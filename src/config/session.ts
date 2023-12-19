import { SessionOptions } from 'express-session'
import env from '../env'
import MongoStore from 'connect-mongo'
import crypto from 'crypto'

const sessionConfig: SessionOptions = {
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, //this is the maxAge of our cookie in miliseconds
    },
    rolling: true, //this means if the user makes request to our backend, the cookie's age would be reset
    store: MongoStore.create({
        mongoUrl: env.MONGO_CONNECTION_STRING
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