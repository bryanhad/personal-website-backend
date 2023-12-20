// import mongoose from 'mongoose'
import redisClient from '../config/redisClient'

export async function destroyAllActiveSessionForUser(userId: string) {
    let cursor = 0

    do {
        const result = await redisClient.scan(cursor, {
            MATCH: `sess:${userId}*`,
            COUNT: 1000,
        }) //this will match to any entry in the redis db, that starts with sess:userId...
        // the count is to tell the server to fetch 1000 entries at a time to check the redis db.. until all is checked..
        // btw this scan would result in an object containing the sessions that matched the matcher syntax

        for (const key of result.keys) {
            await redisClient.del(key)
        }
        cursor = result.cursor
    } while (cursor !== 0)

    // const regExp = new RegExp('^' + userId) //will match string that starts with the userId

    // mongoose.connection.db.collection('sessions').deleteMany({ _id: regExp }) //delete every session document where the _id starts with the userId
}
