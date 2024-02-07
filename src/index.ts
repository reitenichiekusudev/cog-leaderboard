import { Client, cacheExchange, fetchExchange } from '@urql/core';
import { allowedPairs } from './addressHelper.js';
import { checkDepositMulti, filterUniqueTokens, getCurrentBlock, getPrices, setPoints } from './leaderboardActions.js';

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
get current pair prices
const pricefeeds = []
for token of tokens
   const pricefeed =  PricefeedAddresses.find((e)=>{return e.fromAsset === TokenAddresses.find((e)=>{if(e.address === token)return e.symbol})})
    pricefeeds.push(pricefeed.address)
get transactions
for 
**we don't even need this for deposits only**
construct user calls needed array
    for users of userlist
        finish processing one user before moving on
        for needed calls of one user
            count how many calls that user needs
            (1 call per address + either extra 1 (only borrow/deposit) or 2 (both borrow/deposit) per user for tokenAddress lookup)
            push call count into an array
            **a completed users call aray would be something like [1, 4, 5, 3, 6] etc to represent how many calls each user needs**

construct all multicalls
        let calls
        for(user of users)(push every depositpair address into calls)

        let outsider counter
        let allcalls result array
        let calls chunk array of multicall details (address, abi etc)
        for call of calls
            push calls chunk
            counter ++
            check if counter % 50 = 0 (doesn't have to be 50) || counter is the last element
                let results = await execute multicall(chunk)
                completeResults = results.map(for the result, you need: 
                - token balance converted to points,something like this object: {pair:'0x1e934892', points:829})
                allcalls = allcalls.push(...completeResults)
                clear chunk
                
                
**don't need this thing below until it's time for borrow**
and a list of how many of the points belong to each user [2,3,5,6,1]
**
and a list of all user info so far (users)


convert multicall token result to points (takes in allcalls from last step)


    for (user of users){
        for (pair of user.depositPairs){
            pair.pointsSetter(pair.pairPoints)
        }
    }

    **this section is if borrows need to be implemented
    borrows = allcalls.reduce(only the borrows), remember to keep the indexs from this step into an array to insert
    back later

    **this is the desired array shape**
    [
       {'0x09812129389': {shares:18877832n, tokenName:usdc, type: borrow}} 
       {'0x82738438478': {shares:18877832n, tokenName:usdc, type: borrow}} 
    ]
    uniquePairAddresses = borrows.reduce(only unique pair addresses)
    **
    



    multicall unique pair addresses for total shares


    look up points based on token address



*/
