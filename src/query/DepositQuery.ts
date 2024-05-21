import { IQueryInterface, IURQLClient } from "../interfaces/query.js";
import { Client } from "@urql/core";
import { cacheExchange, fetchExchange } from '@urql/core';
export class DepositQuery implements IQueryInterface {
    private queryString: string
    private client: Client
    constructor(querystring: string, client: Client) {
        this.queryString = querystring
        this.client = client
    }
    async query(blockNumber: string | Number): Promise<any> {
        try {
            const result = await this.client.query(this.queryString, { lastBN: blockNumber });
            return result
        } catch (e) {
            console.log(e)
        }
    }
}
