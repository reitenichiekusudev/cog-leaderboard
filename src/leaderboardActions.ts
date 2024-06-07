import { createPublicClient, http, getContract, Address } from "viem";
import { User } from "./users/user.js";
import { scroll } from "viem/chains";
import contractsConfig from "../contracts/index.js";
import { TokenAddresses } from "./addressHelper.js";
import { pairObject } from "./pairs/pairObject.js";

const publicClient = createPublicClient({
    chain: scroll,
    transport: http("https://smart-yolo-county.scroll-mainnet.quiknode.pro/256f70add7d45776833c8fd4938fc52f87d35358/"),
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const checkDepositMulti = async (users: User[], blockNumber: bigint) => {
    let multicallPairContracts = [];
    let balances: pairObject[] = [];
    let counter = 0;
    let results = [];
    for (const user of users) {
        balances.push(...user.depositPairs);
    }
    for (const balance of balances) {
        multicallPairContracts.push({
            address: balance.pairAddress,
            abi: contractsConfig["ICogPair"].abi.abi,
            functionName: "balanceOf",
            args: [balance.userAddress],
        });
        counter++;
        if (counter % 1000 === 0 || counter === balances.length) {
            console.log("chunk processing started");
            //@ts-ignore
            let chunkResults = await publicClient.multicall({
                contracts: multicallPairContracts,
                multicallAddress: contractsConfig.Multicall.address,
                blockNumber: blockNumber,
            });
            results.push(...chunkResults.map((element) => element.result));
            console.log("chunk processed");
            multicallPairContracts = [];
            await sleep(300);
        }
    }
    return (balances = balances.map((e, idx) => {
        e.tokenSnapshotBalance = results[idx] ? results[idx] : 0n
        return e
    }));
    //@ts-ignore
};

export const checkBorrowsMulti = async (users: User[], blockNumber: bigint) => {
    let multicallPairContracts = [];
    let balances: pairObject[] = [];
    let counter = 0;
    let results = [];
    for (const user of users) {
        balances.push(...user.borrowPairs);
    }
    for (const balance of balances) {
        multicallPairContracts.push({
            address: balance.pairAddress,
            abi: contractsConfig["ICogPair"].abi.abi,
            functionName: "user_borrow_part",
            args: [balance.userAddress],
        });
        counter++;
        if (counter % 1000 === 0 || counter === balances.length) {
            console.log("chunk processing started");
            //@ts-ignore
            let chunkResults = await publicClient.multicall({
                contracts: multicallPairContracts,
                multicallAddress: contractsConfig.Multicall.address,
                blockNumber: blockNumber,
            });
            results.push(...chunkResults.map((element) => element.result));
            console.log("chunk processed");
            multicallPairContracts = [];
            await sleep(300);
        }
    }
    return (balances = balances.map((e, idx) => {
        e.tokenSnapshotBalance = results[idx] ? results[idx] : 0n
        return e
    }));
    //@ts-ignore
};


export const setDepositPoints = (allPairBalances: pairObject[], currentPrices) => {
    for (const pair of allPairBalances) {
        let pairExchangeInfo = {
            ...currentPrices.find((e) => e.address === pair.Token),
        };
        const pairpoints =
            (pair.tokenSnapshotBalance * pairExchangeInfo.exchangePrice) /
            pairExchangeInfo.CHAINLINK_DIV;
        //$1 = 1 point
        pair.userPointsSetter(pairpoints);
    }
};
export const setBorrowPoints = (allPairBalances: pairObject[], currentPrices) => {
    for (const pair of allPairBalances) {
        let pairExchangeInfo = {
            ...currentPrices.find((e) => e.address === pair.Token),
        };
        const pairpoints =
            (pair.tokenSnapshotBalance * pairExchangeInfo.exchangePrice) /
            pairExchangeInfo.CHAINLINK_DIV;
        //$1 = 1 point
        pair.userPointsSetter(pairpoints);
    }
};
export const filterUniqueTokens = (users: User[]) => {
    const seenTokens = {};
    let userPairs: pairObject[] = [];
    for (const user of users) {
        userPairs.push(...user.depositPairs);
        userPairs.push(...user.borrowPairs);
    }
    let uniqueTokens = userPairs
        .filter((item) => {
            if (seenTokens[item.Token]) return false;
            else {
                seenTokens[item.Token] = true;
                return true;
            }
        })
        .map((el) => el.Token);
    return uniqueTokens as Array<Address>;
};
export const getCurrentBlock = async () => await publicClient.getBlockNumber();

export const getPrices = async (block: bigint, tokens: Address[]) => {
    const priceMulti = [];
    const orderedTokenAddresses = tokens.map((el) =>
        TokenAddresses.find((e) => e.address === el),
    );
    for (const address of orderedTokenAddresses) {
        priceMulti.push({
            address: address.feedAddress,
            abi: contractsConfig.IAggregatorV3.abi,
            functionName: "latestRoundData",
            blockNumber: block,
        });
        console.log(address.feedAddress)
    }
    //@ts-ignore
    const priceMultiResult = await publicClient.multicall({
        contracts: priceMulti,
        multicallAddress: contractsConfig.Multicall.address,
    });

    const tokenInfos = orderedTokenAddresses.map((el, idx) => {
        return { ...el, exchangePrice: priceMultiResult[idx].result[1] };
    });
    for (const token of tokenInfos) {
        if (token.intermediary) {
            const result = await publicClient.readContract({
                address: TokenAddresses.find((e) => e.symbol === "WETH")
                    .feedAddress as Address,
                abi: contractsConfig.IAggregatorV3.abi,
                functionName: "latestRoundData",
                blockNumber: block,
            });
            console.log(result)
            token.exchangePrice = token.exchangePrice * result[1];
        }
    }
    return tokenInfos;
};
export const calculateTop200 = (users) => {
    const sortedUsers = users
        .sort((a, b) => {
            if (a.points < b.points) return 1;
            else if (a.points > b.points) return -1;
            return 0;
        })
        .slice(0, 200);
    const finalUsers = sortedUsers.map((e, idx) => ({ ...e, rank: idx + 1 }));
    return finalUsers;
};
