import { queryInterface } from "../interfaces/query.js";
import { Client, cacheExchange, fetchExchange } from '@urql/core';
export class DepositQuery implements queryInterface {
    private queryString: string
    private client: any
    constructor(querystring: string) {
        this.queryString = querystring
        this.client = new Client({
            url: 'https://api.studio.thegraph.com/query/63781/cog-factory/version/latest',
            exchanges: [cacheExchange, fetchExchange],
        })
    }
    async query(blockNumber: string): Promise<any> {
        try {
            const result = await this.client.query(this.queryString, { lastBN: blockNumber });
            return result
        } catch (e) {
            console.log(e)
        }
    }
}
