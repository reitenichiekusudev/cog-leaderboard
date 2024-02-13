import { Client, cacheExchange, fetchExchange } from '@urql/core';
import { allowedPairs } from './addressHelper.js';
import { checkDepositMulti, filterUniqueTokens, getCurrentBlock, getPrices, setPoints, calculateTop100 } from './leaderboardActions.js';
import { serializeUsers } from './dbActions.js';

const client = new Client({
    url: 'https://api.studio.thegraph.com/query/63781/cog-factory/version/latest',
    exchanges: [cacheExchange, fetchExchange],
});

const FIRST_DEPOSIT_BN = '86140'
const allowedPairsLC = allowedPairs.map((e) => e.toLowerCase())
const FIRST_BORROW_BN = '86270'
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
      }
  }
`
async function query(Type, blockNumber) {
    if (Type === "Deposit") {
        try {

            const result = await client.query(DEPOSIT_QUERY, { lastBN: blockNumber });
            return result
        } catch (e) {
            console.log(e)
        }
    }
    if (Type === "Borrow") {
        try {

            const result = await client.query(BORROW_QUERY, { lastBN: blockNumber });
            return result
        } catch (e) {
            console.log(e)
        }
    }
}

let deposits = []
let depositResult = await query("Deposit", FIRST_DEPOSIT_BN)
deposits.push(...depositResult.data.deposits)

let borrows = []
let borrowResult = await query("Borrow", FIRST_BORROW_BN)
borrows.push(...borrowResult.data.borrows)

while (depositResult.data.deposits.length > 0) {
    if (depositResult.data.deposits[depositResult.data.deposits.length - 1]) {
        depositResult = await query("Deposit", depositResult.data.deposits[depositResult.data.deposits.length - 1].blockNumber)
        deposits.push(...depositResult.data.deposits)
    }
}
while (borrowResult.data.borrows.length > 0) {
    if (borrowResult.data.borrows[borrowResult.data.borrows.length - 1]) {
        borrowResult = await query("Borrow", borrowResult.data.borrows[borrowResult.data.borrows.length - 1].blockNumber)
        borrows.push(...borrowResult.data.borrows)
    }
}
let users = []
for (let i = 0; i < deposits.length; i++) {
    if (!users.find(e => e && e.user === deposits[i].depositor)) {
        users.push({ user: deposits[i].depositor, depositPairs: [], borrowPairs: [], points: 0n, setPoints: function (points) { this.points += points } })
    }
}

for (let o = 0; o < users.length; o++) {
    for (let i = 0; i < deposits.length; i++) {
        if (deposits[i].depositor === users[o].user)
            if ((!users[o].depositPairs.find(e => e.pair === deposits[i].pairAddress)) && allowedPairsLC.includes(deposits[i].pairAddress)) {
                const pairObject = {
                    pair: deposits[i].pairAddress, userPointsSetter: (points) => users[o].setPoints(points), pairPoints: 0n, pairPointsSetter: function (points) { this.pairPoints = points }, userAddr: users[o].user, depositToken: deposits[i].depositToken
                }
                pairObject.pairPointsSetter = pairObject.pairPointsSetter.bind(pairObject)
                users[o].depositPairs.push(pairObject)


            }

    }
}
// console.log('0x6D2F1432cbb1De3435aC2cE4426bBe9c011b0E75'.toLowerCase())
// console.log(users.find((e) => e.user === '0x6D2F1432cbb1De3435aC2cE4426bBe9c011b0E75'.toLowerCase()))


let tokens = filterUniqueTokens(users)
console.log(tokens)
const block: bigint = await getCurrentBlock()
const priceinfos = await getPrices(block, tokens)
const allSnapshots = await checkDepositMulti(users, block)
await setPoints(allSnapshots, priceinfos)

console.log(users[0])
console.log(users.reduce((acc, el) => acc + el.points, 0n))
console.log(users.find((e) => e.user === '0x6D2F1432cbb1De3435aC2cE4426bBe9c011b0E75'.toLowerCase()))
const top100users = calculateTop100(users)
console.log(top100users)
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
