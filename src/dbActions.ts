import pg from 'pg'

const client = new pg.Client({
    host: 'cog-db.ciuvsd3fdx6v.us-east-1.rds.amazonaws.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'i9n3??AxnP5TqLnB',
})
export async function updateHandler(users) {
    //await client.connect()
    let tableName = "leaderboards"


    let query1 = ['UPDATE leaderboards SET points = CASE user_name']

    for (const user of users) {
        query1.push(`WHEN '${user.user}' THEN ${Number(user.points)}`)
    }
    query1.push('ELSE points END;')
    const queryString1 = query1.join(' ')
    console.log(queryString1)

    let query2 = ['UPDATE leaderboards SET rank = CASE user_name']

    for (const user of users) {
        query2.push(`WHEN '${user.user}' THEN ${Number(user.rank)}`)
    }
    query2.push('ELSE rank END;')
    const queryString2 = query2.join(' ')
    console.log(queryString2)

    //await client.end()
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

export async function insertUsers(users) {
}

export async function insertLeaderboard(users) {
    const query = ['INSERT INTO leaderboards (user_name, points, rank) VALUES']

    for (const [idx, user] of users.entries()) {
        if (idx === users.length - 1) {
            query.push(`('${user.user}', ${Number(user.points)}, ${user.rank});`)
        }
        else query.push(`('${user.user}', ${Number(user.points)}, ${user.rank}),`)
    }
    const dbquery = query.join(' ')

    try {
        console.log('awaiting DB connection')
        await client.connect()
        console.log('DB connected')
        const emptyCheck = await client.query('SELECT * FROM leaderboards;')
        if (!emptyCheck.rows.length) {
            const res = await client.query(dbquery)
            console.log(res)
            await client.end()
            console.log('write successful')
        } else {
            console.log('leaderboard table not empty!')
            await client.end()
        }
    } catch (e) {
        console.log('DB error')
        console.log(e)
        await client.end()
    }

}