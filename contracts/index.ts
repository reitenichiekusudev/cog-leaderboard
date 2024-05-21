import ICogPairABI from "./ICogPair.sol/ICogPair.json" with {type: "json"};
import ICogFactoryABI from "./ICogPair.sol/ICogFactory.json" with {type: "json"};
import IAggregatorV3ABI from "./IAggregatorV3/IAggregatorV3.js"
import { Address } from "viem";
// import { erc20ABI } from "wagmi";

export default {
    ICogPair: {
        abi: ICogPairABI
    },
    ICogFactory: {
        address: "0xbAbD55549c266c6755b99173fE7604238D04117d",
        abi: ICogFactoryABI
    },
    Multicall: {
        address: "0xcA11bde05977b3631167028862bE2a173976CA11" as Address
    },
    IAggregatorV3: {
        abi: IAggregatorV3ABI
    }
}
