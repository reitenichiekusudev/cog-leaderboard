import Client from 'pg'

export async function updateHandler(req, res) {

    const client = new Client({
        host: 'cog-db.ciuvsd3fdx6v.us-east-1.rds.amazonaws.com',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: 'i9n3??AxnP5TqLnB',
    })
}

export function serializeUsers(users) {
    (BigInt.prototype as any).toJSON = function () {
        return this.toString();
    };
    const usersinter = users.map(({ depositPairs, ...rest }) => ({
        ...rest,
        depositPairs: depositPairs.map(({ userPointsSetter, pairPointsSetter, ...rest }) => ({ ...rest })),
    }))
    const usersProcessed = usersinter.map((e) => JSON.stringify(e))

    return usersProcessed
}