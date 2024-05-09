
export interface queryInterface {
    query(blockNumber: string): Promise<object>
    //TODO:find out type of query result
}