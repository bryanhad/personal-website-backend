import { RequestHandler } from "express";
import env from "../env";

const setSessionReturnTo: RequestHandler = (req, res, next) => {
    const {returnTo} = req.query

    if (returnTo) {
        req.session.returnTo = env.WEBSITE_URL + returnTo //whatever that we put here, would also be stored in the session's db
    }
    next()
}

export default setSessionReturnTo