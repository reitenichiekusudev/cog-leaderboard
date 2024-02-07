export const TokenAddresses = [
    {
        symbol: 'rETH',
        address: '0x53878b874283351d26d206fa512aece1bef6c0dd',
        decimals: 18n,
        intermediary: true,
        feedAddress: '0x3fBB86e564fC1303625BA88EaE55740f3A649d36',
        CHAINLINK_DIV: 10n ** 44n
        //original decimals = (18n of precision) + intermediary of reth/eth(18n of precision) + eth/USD(8n of precision) = 44n down to dollar value
    },
    {
        symbol: 'AAVE',
        address: '0x79379c0e09a41d7978f883a56246290ee9a8c4d3',
        decimals: 18n,
        intermediary: true,
        feedAddress: '0x538E0fC727ce4604e25354D082890cdb5553d33B',
        CHAINLINK_DIV: 10n ** 26n
        //original decimals = (18n of precision) + AAVE/usd = 10^8 of precision, 26n down to dollar value
    },
    {
        symbol: 'CRV',
        address: '0xb755039edc7910c1f1bd985d48322e55a31ac0bf',
        decimals: 18n,
        intermediary: true,
        feedAddress: '0x8658273E2f7bc06d3F8462703b8a733204312fF2',
        CHAINLINK_DIV: 10n ** 26n
        //original decimals = (18n of precision) + CRV/usd = 10^8 of precision, 26n down to dollar value
    },
    {
        symbol: 'wstETH',
        address: '0xf610a9dfb7c89644979b4a0f27063e9e7d7cda32',
        decimals: 18n,
        intermediary: true,
        feedAddress: '0xe428fbdbd61CC1be6C273dC0E27a1F43124a86F3',
        CHAINLINK_DIV: 10n ** 44n
        //original decimals = (18n of precision) + intermediary of wsteth/eth(18n of precision) + eth/USD(8n of precision) = 44n down to dollar value
    },
    {
        symbol: 'USDC',
        address: '0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4',
        decimals: 6n,
        feedAddress: '0x43d12Fb3AfCAd5347fA764EeAB105478337b7200',
        CHAINLINK_DIV: 10n ** 14n
        //original decimals = (6n of precision) + usdc/usd = 10^8 of precision, 14n down to dollar value
    },
    {
        symbol: 'WETH',
        address: '0x5300000000000000000000000000000000000004',
        decimals: 18n,
        feedAddress: '0x6bF14CB0A831078629D993FDeBcB182b21A8774C',
        CHAINLINK_DIV: 10n ** 26n
        //original decimals = (18n of precision) + eth/usd = 10^8 of precision, 26n down to dollar value
    },
    {
        symbol: 'USDT',
        address: '0xf55bec9cafdbe8730f096aa55dad6d22d44099df',
        decimals: 6n,
        feedAddress: '0xf376A91Ae078927eb3686D6010a6f1482424954E',
        CHAINLINK_DIV: 10n ** 14n
        //original decimals = (6n of precision) + usdt/usd = 10^8 of precision, 14n down to dollar value
    },
    {
        symbol: 'DAI',
        address: '0xca77eb3fefe3725dc33bccb54edefc3d9f764f97',
        decimals: 18n,
        feedAddress: '0x203322e1d15EB3Dff541a5aF0288D951c4a8d3eA',
        CHAINLINK_DIV: 10n ** 26n
        //original decimals = (18n of precision) + DAI/usd = 10^8 of precision, 26n down dollar value
    },

]

export const PricefeedAddresses = [
    { fromAsset: 'AAVE', toAsset: 'USD', address: '0x538E0fC727ce4604e25354D082890cdb5553d33B' },
    { fromAsset: 'BTC', toAsset: 'USD', address: '0xCaca6BFdeDA537236Ee406437D2F8a400026C589' },
    { fromAsset: 'CRV', toAsset: 'USD', address: '0x8658273E2f7bc06d3F8462703b8a733204312fF2' },
    { fromAsset: 'DAI', toAsset: 'USD', address: '0x203322e1d15EB3Dff541a5aF0288D951c4a8d3eA' },
    { fromAsset: 'ETH', toAsset: 'USD', address: '0x6bF14CB0A831078629D993FDeBcB182b21A8774C' },
    { fromAsset: 'WETH', toAsset: 'USD', address: '0x6bF14CB0A831078629D993FDeBcB182b21A8774C' },
    { fromAsset: 'LINK', toAsset: 'USD', address: '0x227a4E5E9239CAc88022DF86B1Ad9B24A7616e60' },
    { fromAsset: 'rETH', toAsset: 'ETH', address: '0x3fBB86e564fC1303625BA88EaE55740f3A649d36' },
    { fromAsset: 'STG', toAsset: 'USD', address: '0x9019Be7Aa8f66551E94d6508EA48856386945E80' },
    { fromAsset: 'USDC', toAsset: 'USD', address: '0x43d12Fb3AfCAd5347fA764EeAB105478337b7200' },
    { fromAsset: 'USDT', toAsset: 'USD', address: '0xf376A91Ae078927eb3686D6010a6f1482424954E' },
    { fromAsset: 'wstETH', toAsset: 'ETH', address: '0xe428fbdbd61CC1be6C273dC0E27a1F43124a86F3' },
]
export const allowedPairs = [
    "0x20b3a538aA525Cf5F8aF25052AE849471d96138B",
    "0xd3b2AffE1e406D0d8D15Ce8CFb937D305f2680Bb",
    "0xA5832adC1e4487B635a483722e4fc34062467479",
    "0x411F041aE4c7eC399C11670d7594A18EB2cF735A",
    "0x449C58c2F8D2AF6aBe16d0366910b602De430935",
    "0x677dde488050F00Cc7412b910da25575a72FadD6",
    "0x408EB3EC735047E8AE8De55989C19AAfD9E6b78F",
    "0xb31d07F716b5cd5C47e5d46E6955D7185F04Fd24",
    "0x8999a01f60E2adE8Cbdf895F383593420dfb4B74",
]

//maybe a function to update interest rate