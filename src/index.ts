import { readPointsFromFile } from "./realTime.js";
import { getCurrentBlock } from './leaderboardActions.js';
import { serializeUsers } from "./dbActions.js";
import { ArchivalQuery } from "./archival.js";

let users = readPointsFromFile('/Users/suyangsong/programming/cog-leaderboard/src/users_v2.xlsx')
console.log(users)
const block: bigint = await getCurrentBlock()
users = users.map((e) => ({ ...e, block: block }))
console.log(users)
const result = serializeUsers(users)
console.log(result)
//archival query
//