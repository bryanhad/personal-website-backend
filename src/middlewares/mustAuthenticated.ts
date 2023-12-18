import { RequestHandler } from "express";
import createHttpError from "http-errors";

const mustAuthenticated: RequestHandler = (req, res, next) => {
    if (!req.user) { //req.user is set up by passport after deserialize func!
        throw createHttpError(401, 'User not authenticated')
    }
    next()
}

export default mustAuthenticated