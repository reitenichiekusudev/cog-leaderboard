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
    '0x6ace91e105cd5288dc46598e96538e9ad0e421aa',
    '0x4ac126e5dd1cd496203a7e703495caa8112a20ca',
    '0x63fdafa50c09c49f594f47ea7194b721291ec50f',
    '0x43187a6052a4bf10912cde2c2f94953e39fce8c7',
    '0x5c121db888ad212670017080047ed16ce99a2a96',
    '0x04BB9Bca2F8955051966B6dA5398AD1B3a832762',
]

//maybe a function to update interest rate