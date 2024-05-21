import { Client, cacheExchange, fetchExchange } from '@urql/core';
import { Address } from 'viem';
import { DepositQuery } from './query/DepositQuery.js';
import { allowedPairs, allowedPairsV1 } from './addressHelper.js';
import { checkDepositMulti, checkBorrowsMulti, filterUniqueTokens, getCurrentBlock, getPrices, setDepositPoints, setBorrowPoints, calculateTop200 } from './leaderboardActions.js';
import { insertLeaderboard, serializeUsers, updateHandler } from './dbActions.js';
import xlsx from 'xlsx'
import { BorrowQuery } from './query/BorrowQuery.js';
import { User } from './users/user.js';
import { pairObject } from './pairs/pairObject.js';

const v2client = new Client({
    url: 'https://api.studio.thegraph.com/query/63781/cog-factory/version/latest',
    exchanges: [cacheExchange, fetchExchange],
});
const v1client = new Client({
    url: 'https://api.studio.thegraph.com/query/63781/cog-factory/v0.0.6',
    exchanges: [cacheExchange, fetchExchange],
});

const allowedPairsLC = allowedPairs.map((e) => e.toLowerCase())
const allowedPairsV1LC = allowedPairsV1.map(e => e.toLowerCase())
const DEPOSIT_QUERY = `
query MyQuery($lastBN: BigInt) {
    deposits(first: 1000, orderBy: blockNumber, where: { blockNumber_gt: $lastBN }) {
      depositor
      blockNumber
      blockTimestamp
      pairAddress
      id
      depositToken
    }
  }
`;

const BORROW_QUERY = `
query MyQuery($lastBN: BigInt) {
    borrows(first: 1000, orderBy: blockNumber, where: { blockNumber_gt: $lastBN }) {
        id
        pairAddress
        amount
        _from
        blockNumber
        blockTimestamp
        borrowToken
      }
  }
`
export async function ArchivalQuery(
    client: Client,
    startBlock: number,
    endBlock: number,
    blockRange: number,
    version: string,
    epochs: bigint,
    allowedPairs: string[]
) {
    console.log('hi')
    let deposits = [];
    let borrows = [];
    let users: Array<User> = [];
    let userMap = new Map<string, User>();
    const depositMap = new Map<string, Array<any>>();
    const borrowMap = new Map<string, Array<any>>();


    for (let currentStartBlock = startBlock; currentStartBlock < endBlock; currentStartBlock += blockRange) {
        const currentEndBlock = (currentStartBlock + blockRange) < endBlock ? (currentStartBlock + blockRange) : endBlock;

        // Chunk list for each iteration
        let chunkUsers: Array<User> = [];

        // Process deposits
        let depositQuery = new DepositQuery(DEPOSIT_QUERY, client);
        let depositResult = await depositQuery.query(currentStartBlock);
        deposits.push(...depositResult.data.deposits);

        while (depositResult.data.deposits.length > 0) {
            const lastBlockNumber = depositResult.data.deposits[depositResult.data.deposits.length - 1].blockNumber;
            if (lastBlockNumber < currentEndBlock) {
                depositResult = await depositQuery.query(lastBlockNumber);
                deposits.push(...depositResult.data.deposits);
            } else {
                break;
            }
        }

        console.log('2')
        // Process borrows
        let borrowQuery = new BorrowQuery(BORROW_QUERY, client);
        let borrowResult = await borrowQuery.query(currentStartBlock);
        borrows.push(...borrowResult.data.borrows);

        while (borrowResult.data.borrows.length > 0) {
            const lastBlockNumber = borrowResult.data.borrows[borrowResult.data.borrows.length - 1].blockNumber;
            if (lastBlockNumber < currentEndBlock) {
                borrowResult = await borrowQuery.query(lastBlockNumber);
                borrows.push(...borrowResult.data.borrows);
            } else {
                break;
            }
        }
        deposits.forEach(deposit => {
            if (!depositMap.has(deposit.depositor)) {
                depositMap.set(deposit.depositor, []);
                depositMap.get(deposit.depositor).push(deposit)
            }
            else depositMap.get(deposit.depositor).push(deposit)
        });
        borrows.forEach(borrow => {
            if (!borrowMap.has(borrow._from)) {
                borrowMap.set(borrow._from, []);
                borrowMap.get(borrow._from).push(borrow)
            } else borrowMap.get(borrow._from).push(borrow)
        });

        for (let i = 0; i < depositResult.data.deposits.length; i++) {
            if (!userMap.has(depositResult.data.deposits[i].depositor)) {
                let newUser = new User(depositResult.data.deposits[i].depositor, 0n);
                users.push(newUser);
                chunkUsers.push(newUser)
                userMap.set(depositResult.data.deposits[i].depositor, newUser);
            }
        }

        // Update chunk users and chunkUserMap with new borrows
        for (let i = 0; i < borrowResult.data.borrows.length; i++) {
            if (!userMap.has(borrowResult.data.borrows[i]._from)) {
                let newUser = new User(borrowResult.data.borrows[i]._from, 0n);
                users.push(newUser);
                chunkUsers.push(newUser)
                userMap.set(borrowResult.data.borrows[i]._from, newUser);
            }
        }

        console.log('3')
        // Update global users and userMap with chunk users
        // Process chunk users to add deposit and borrow pairs
        chunkUsers.forEach(user => {
            const userDeposits = depositMap.get(user.address) || [];
            const userBorrows = borrowMap.get(user.address) || [];
            userDeposits.forEach(deposit => {
                if (allowedPairs.includes(deposit.pairAddress)) {
                    const depositPair = new pairObject(deposit.pairAddress, 0n, user.addPoints, deposit.depositToken, user.address);

                    userMap.get(user.address).addDepositPair(depositPair);
                }
            });
            userBorrows.forEach(borrow => {
                if (allowedPairs.includes(borrow.pairAddress)) {
                    const borrowPair = new pairObject(borrow.pairAddress, 0n, user.addPoints, borrow.borrowToken, user.address);
                    userMap.get(user.address).addBorrowPair(borrowPair);
                }
            });
        });
        let tokens: Address[] = filterUniqueTokens(users)
        const priceinfos = await getPrices(BigInt(currentEndBlock), tokens)
        const depositSnapshots = await checkDepositMulti(users, BigInt(currentEndBlock))
        const borrowSnapshots = await checkBorrowsMulti(users, BigInt(currentEndBlock))
        setBorrowPoints(borrowSnapshots, priceinfos)
        setDepositPoints(depositSnapshots, priceinfos)
        users.forEach(user => {
            //            console.log(`User: ${user.address}, Points before snapshot: ${user.getPoints()}`);
            if (version === 'v2') {
                if (user.getPoints() > 0) {
                    user.addv2PointsSnapshot(user.getPoints())
                    user.setPoints(0n)
                } else {
                    user.addv2PointsSnapshot(0n)
                }
            }
            else {
                user.addv1PointsSnapshot(user.getPoints())
                user.setPoints(0n)
            }
            // console.log(`User: ${user.address}, Points after snapshot: ${user.getPoints()}`);
            // console.log(`User: ${user.address}, v2PointsSnapshots: ${user.v2PointsSnapshots}`);
            // console.log('-----')
        })
        epochs++;
    }
    console.log('4')
    // console.log('0x6D2F1432cbb1De3435aC2cE4426bBe9c011b0E75'.toLowerCase())
    //console.log(users.find((e) => e.address === '0x6D2F1432cbb1De3435aC2cE4426bBe9c011b0E75'.toLowerCase()))
    //0x6d2f1432cbb1de3435ac2ce4426bbe9c011b0e75


    console.log('5')
    return { deposits, borrows, users, depositMap, borrowMap, epochs };
}
let epochs = 0n
let v1FilteredUsers: User[], v2FilteredUsers: User[]
const block: bigint = await getCurrentBlock()
const v2results = await ArchivalQuery(v2client, 3147376, Number(block), 200000, 'v2', epochs, allowedPairs)
v2results.users.forEach(user => user.calculateFinalPoints(v2results.epochs, 'v2'))
v2FilteredUsers = v2results.users.filter(user => user.v2PointsFinal > 0n)
// Prepare data for export
const data = v2FilteredUsers.map(user => ({
    address: user.address,
    v2_points: user.v2PointsFinal.toString(), // Convert BigInt to string
    v2_snapshots: user.v2PointsSnapshots.map(point => point.toString()).join(', '), // Convert BigInt to string
}));
// Convert the data to a worksheet
const worksheet = xlsx.utils.json_to_sheet(data);
// Create a new workbook and append the worksheet
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, 'Users');
// Write the workbook to a file
xlsx.writeFile(workbook, 'users_v2.xlsx');
console.log('Data exported to users_v2.xlsx');

// const v1results = await ArchivalQuery(v1client, 120000, 3147376, 200000, 'v1', epochs, allowedPairsV1)
// v1results.users.forEach(user => user.calculateFinalPoints(v1results.epochs, 'v1'))
// v1FilteredUsers = v1results.users.filter(user => user.v1PointsFinal > 0n)
// // Prepare data for export
// const v1Data = v1FilteredUsers.map(user => ({
//     address: user.address,
//     v1_points: user.v1PointsFinal.toString(), // Convert BigInt to string
//     v1_snapshots: user.v1PointsSnapshots.map(point => point.toString()).join(', '), // Convert BigInt to string
// }));
// // Convert the data to a worksheet
// const v1Worksheet = xlsx.utils.json_to_sheet(v1Data);
// // Create a new workbook and append the worksheet
// const v1Workbook = xlsx.utils.book_new();
// xlsx.utils.book_append_sheet(v1Workbook, v1Worksheet, 'Users');
// // Write the workbook to a file
// xlsx.writeFile(v1Workbook, 'users_v1.xlsx');
// console.log('Data exported to users_v1.xlsx');
// // const top200users = calculateTop200(users)
// //await insertLeaderboard(top200users)
