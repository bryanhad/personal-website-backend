import { SessionOptions } from 'express-session'
import env from '../env'
import RedisStore from 'connect-redis'
import crypto from 'crypto'
import redisClient from './redisClient'

// const store = env.NODE_ENV === 'production'  //if u want, u can even use mongoStore in development, and use ur local redisStore in production!
//     ? new RedisStore({
//         client: redisClient
//     })
//     : MongoStore.create({
//         mongoUrl: env.MONGO_CONNECTION_STRING
//     })

const sessionConfig: SessionOptions = {
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, //this is the maxAge of our cookie in miliseconds
    },
    rolling: true, //this means if the user makes request to our backend, the cookie's age would be reset
    store: new RedisStore({
        client: redisClient
    }),
    genid(req) { //generate our own session id!
        const userId = req.user?._id //get the user's Id from passport
        const randomId = crypto.randomUUID() //generate radom string ID
        if (userId) {
            return `${userId}-${randomId}`
        } else {
            return randomId
        }
    }
}

export default sessionConfig