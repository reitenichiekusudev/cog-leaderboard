import { Client, cacheExchange, fetchExchange } from '@urql/core';
import { DepositQuery } from './query/DepositQuery.js';
import { allowedPairs } from './addressHelper.js';
import { checkDepositMulti, filterUniqueTokens, getCurrentBlock, getPrices, setPoints, calculateTop200 } from './leaderboardActions.js';
import { insertLeaderboard, serializeUsers, updateHandler } from './dbActions.js';
import { BorrowQuery } from './query/BorrowQuery.js';
import { User } from './users/user.js';
import { pairObject } from './pairs/pairObject.js';

const client = new Client({
    url: 'https://api.studio.thegraph.com/query/63781/cog-factory/version/latest',
    exchanges: [cacheExchange, fetchExchange],
});

const FIRST_DEPOSIT_BN = '3147376'
const allowedPairsLC = allowedPairs.map((e) => e.toLowerCase())
const FIRST_BORROW_BN = '3147376'
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

let deposits = []
let depositQuery = new DepositQuery(DEPOSIT_QUERY, client)
let depositResult = await depositQuery.query(FIRST_DEPOSIT_BN)
deposits.push(...depositResult.data.deposits)
console.log('1')

let borrows = []
let borrowQuery = new BorrowQuery(BORROW_QUERY, client)
let borrowResult = await borrowQuery.query(FIRST_BORROW_BN)
borrows.push(...borrowResult.data.borrows)
console.log('2')

while (depositResult.data.deposits.length > 0) {
    if (depositResult.data.deposits[depositResult.data.deposits.length - 1]) {
        depositResult = await depositQuery.query(depositResult.data.deposits[depositResult.data.deposits.length - 1].blockNumber)
        deposits.push(...depositResult.data.deposits)
    }
}
console.log('3')
while (borrowResult.data.borrows.length > 0) {
    if (borrowResult.data.borrows[borrowResult.data.borrows.length - 1]) {
        borrowResult = await borrowQuery.query(borrowResult.data.borrows[borrowResult.data.borrows.length - 1].blockNumber)
        borrows.push(...borrowResult.data.borrows)
    }
}
console.log(borrows)
let users: Array<User> = [];
let userMap = new Map<string, User>();

for (let i = 0; i < deposits.length; i++) {
    if (!userMap.has(deposits[i].depositor)) {
        let newUser = new User(deposits[i].depositor, 0n);
        users.push(newUser);
        userMap.set(deposits[i].depositor, newUser);
    }
}
for (let i = 0; i < borrows.length; i++) {
    if (!userMap.has(borrows[i]._from)) {
        let newUser = new User(borrows[i]._from, 0n);
        users.push(newUser);
        userMap.set(borrows[i]._from, newUser);
    }
}
console.log('5')
// Preprocess deposits into a map where the key is the depositor's address
const depositMap = {};
const borrowMap = {};
deposits.forEach(deposit => {
    if (!depositMap[deposit.depositor]) {
        depositMap[deposit.depositor] = [];
    }
    depositMap[deposit.depositor].push(deposit);
});
console.log(depositMap['0x6d2f1432cbb1de3435ac2ce4426bbe9c011b0e75'])
// Loop through each user
borrows.forEach(borrow => {
    if (!borrowMap[borrow._from]) {
        borrowMap[borrow._from] = [];
    }
    borrowMap[borrow._from].push(borrow);
})
users.forEach(user => {
    const userDeposits = depositMap[user.address] || [];
    const userBorrows = borrowMap[user.address] || [];
    userDeposits.forEach(deposit => {
        if (allowedPairsLC.includes(deposit.pairAddress)) {
            const depositPair = new pairObject(deposit.pairAddress, 0n, user.getPoints, deposit.depositToken);
            user.addDepositPair(depositPair);
        }
    });
    userBorrows.forEach(borrow => {
        if (allowedPairsLC.includes(borrow.pairAddress)) {
            const borrowPair = new pairObject(borrow.pairAddress, 0n, user.getPoints, borrow.depositToken);
            user.addBorrowPair(borrowPair);
        }
    });
});
console.log('6')
//console.log(users)
// console.log('0x6D2F1432cbb1De3435aC2cE4426bBe9c011b0E75'.toLowerCase())
console.log(users.find((e) => e.address === '0x6D2F1432cbb1De3435aC2cE4426bBe9c011b0E75'.toLowerCase()))


let tokens = filterUniqueTokens(users)
// console.log(tokens)
// const block: bigint = await getCurrentBlock()
// const priceinfos = await getPrices(block, tokens)
// const allSnapshots = await checkDepositMulti(users, block)
// await setPoints(allSnapshots, priceinfos)

// console.log(users.reduce((acc, el) => acc + el.points, 0n))
// console.log(users.find((e) => e.user === '0x6D2F1432cbb1De3435aC2cE4426bBe9c011b0E75'.toLowerCase()))
// const top200users = calculateTop200(users)
//await insertLeaderboard(top200users)

// for (let i = 0; i < borrows.length; i++) {
//     if (!users.find(e => e && e.user === borrows[i]._from)) {
//         users.push({ user: borrows[i]._from, borrowPairs: [] })
//     }
// }
// for (let o = 0; o < users.length; o++) {
//     for (let i = 0; i < borrows.length; i++) {
//         if (borrows[i]._from === users[o].user)
//             if (!users[o].borrowPairs.find(e => e === borrows[i].pairAddress))
//                 users[o].borrowPairs.push(borrows[i].pairAddress)
//     }
// }

/*
    look up points based on token address



*/
