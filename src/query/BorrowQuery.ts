import { IQueryInterface, IURQLClient } from "../interfaces/query.js";
import { Client } from "@urql/core";
export class BorrowQuery implements IQueryInterface {
    private queryString: string
    private client: Client
    constructor(querystring: string, client: Client) {
        this.queryString = querystring
        this.client = client
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
