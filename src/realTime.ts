import { Client, cacheExchange, fetchExchange } from '@urql/core';
import { Address } from 'viem';
import { DepositQuery } from './query/DepositQuery.js';
import { allowedPairs, allowedPairsV1 } from './addressHelper.js';
import { checkDepositMulti, checkBorrowsMulti, filterUniqueTokens, getCurrentBlock, getPrices, setDepositPoints, setBorrowPoints, calculateTop200 } from './leaderboardActions.js';
import { BorrowQuery } from './query/BorrowQuery.js';
import { User } from './users/user.js';
import xlsx from 'xlsx';
import fs from 'fs';
import { pairObject } from './pairs/pairObject.js';
export function realTimeQuery() {
    const v2client = new Client({
        url: 'https://api.studio.thegraph.com/query/63781/cog-factory/version/latest',
        exchanges: [cacheExchange, fetchExchange],
    });
}
export function readPointsFromFile(filePath) {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
    }

    // Read the workbook
    const workbook = xlsx.readFile(filePath);

    // Assuming the sheet name is 'Users'
    const sheetName = 'Users';
    const worksheet = workbook.Sheets[sheetName];

    // Convert the sheet to JSON
    const jsonData = xlsx.utils.sheet_to_json<Record<string, string>>(worksheet);

    // Process the JSON data to convert strings to BigInt and arrays
    const users = jsonData.map(row => ({
        address: row.address,
        v2_points: BigInt(row.v2_points),
        v2_snapshots: row.v2_snapshots.split(', ').map(point => BigInt(point)),
    }));

    return users;
}