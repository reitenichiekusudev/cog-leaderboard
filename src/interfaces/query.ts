
export interface IQueryInterface {
    query(blockNumber: string): Promise<object>
    //TODO:find out type of query result
}

export interface IURQLClient {
    query(queryString: string, variables?: Object): Promise<any>
}