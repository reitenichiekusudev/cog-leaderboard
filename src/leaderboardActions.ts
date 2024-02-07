import { createPublicClient, http, getContract, Address } from 'viem'
import { scroll } from 'viem/chains'
import contractsConfig from '../contracts/index.js'
import { TokenAddresses } from './addressHelper.js'

const publicClient = createPublicClient({
    chain: scroll,
    transport: http("https://scroll-mainnet-public.unifra.io")
})
type user = {
    user: string
    depositPairs: object[],
    borrowPairs: string[],
    points: number,
    setPoints: Function
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const checkDepositMulti = async (users: user[], blockNumber: bigint) => {
    let multicallPairContracts = []
    let balances = []
    let counter = 0
    let results = []
    for (const user of users) {
        balances.push(...user.depositPairs)
    }
    for (const balance of balances) {
        multicallPairContracts.push({
            address: balance.pair,
            abi: contractsConfig["ICogPair"].abi.abi,
            functionName: 'balanceOf',
            args: [balance.userAddr]
        })
        counter++;
        if (counter % 1000 === 0 || counter === balances.length) {
            console.log('chunk processing started')
            //@ts-ignore
            let chunkResults = await publicClient.multicall({
                contracts: multicallPairContracts,
                multicallAddress: contractsConfig.Multicall.address,
                blockNumber: blockNumber
            })
            results.push(...chunkResults.map((element) => element.result))
            console.log("chunk processed")
            multicallPairContracts = []
            await sleep(100)
        }
    }
    return balances = balances.map((e, idx) => ({ ...e, tokenBalance: results[idx] ? results[idx] : 0n }))
    //@ts-ignore

}
export const setPoints = (allPairBalances, currentPrices) => {
    for (const pair of allPairBalances) {
        let pairExchangeInfo = { ...(currentPrices.find((e) => e.address === pair.depositToken)) }
        const pairpoints = pair.tokenBalance * pairExchangeInfo.exchangePrice / pairExchangeInfo.CHAINLINK_DIV
        //$1 = 1 point
        pair.pairPointsSetter(pairpoints)
        pair.userPointsSetter(pairpoints)
    }
}
export const filterUniqueTokens = (users) => {
    const seenTokens = {}
    let userDepositPairs = []
    for (const user of users) {
        userDepositPairs.push(...user.depositPairs)
    }
    let uniqueTokens = userDepositPairs.filter(item => {
        if (seenTokens[item.depositToken])
            return false
        else {
            seenTokens[item.depositToken] = true
            return true
        }
    }).map((el) => el.depositToken)
    return uniqueTokens

}
export const getCurrentBlock = async () => await publicClient.getBlockNumber()

export const getPrices = async (block: bigint, tokens: Address[]) => {
    const priceMulti = []
    const orderedTokenAddresses = tokens.map((el) => TokenAddresses.find((e) => e.address === el))
    for (const address of orderedTokenAddresses) {
        priceMulti.push({
            address: address.feedAddress,
            abi: contractsConfig.IAggregatorV3.abi,
            functionName: 'latestRoundData',
            blockNumber: block
        })
    }
    //@ts-ignore
    const priceMultiResult = await publicClient.multicall({
        contracts: priceMulti,
        multicallAddress: contractsConfig.Multicall.address,
    })

    const tokenInfos = orderedTokenAddresses.map((el, idx) => {
        return { ...el, exchangePrice: priceMultiResult[idx].result[1] }
    })
    for (const token of tokenInfos) {
        if (token.intermediary) {
            const result = await publicClient.readContract({
                address: TokenAddresses.find((e) => e.symbol === 'WETH').feedAddress as Address,
                abi: contractsConfig.IAggregatorV3.abi,
                functionName: 'latestRoundData',
                blockNumber: block
            })
            token.exchangePrice = token.exchangePrice * result[1]
        }
    }
    return tokenInfos
}


//   // https://blockscout.scroll.io/address/0xcA11bde05977b3631167028862bE2a173976CA11

//   // fetch mult
//   publicClient.multicall({
//     contracts: multicallPairContracts,
//     // @ts-ignore
//     multicallAddress: contractsConfig.Multicall.address
//   }).then((results: any) => {
//     const multicallTokens = []
//     const totalAssetsArray = []
//     const exchangeRates = []
//     const interestRates = []
//     for (let i = 0; i < results.length; i += 5) {
//       multicallTokens.push({
//         address: results[i].result,
//         abi: contractsConfig["ERC20"].abi.abi,
//         functionName: 'symbol'
//       })
//       multicallTokens.push({
//         address: results[i].result,
//         abi: contractsConfig["ERC20"].abi.abi,
//         functionName: 'decimals'
//       })
//       multicallTokens.push({
//         address: results[i + 1].result,
//         abi: contractsConfig["ERC20"].abi.abi,
//         functionName: 'symbol'
//       })
//       multicallTokens.push({
//         address: results[i + 1].result,
//         abi: contractsConfig["ERC20"].abi.abi,
//         functionName: 'decimals'
//       })
//       totalAssetsArray.push(results[i + 2].result)
//       exchangeRates.push(results[i + 3].result[1])
//       interestRates.push(
//         Number(results[i + 4].result['interest_per_second']) * (60 * 60 * 24 * 365) / 1000000000000000000
//       )
//     }