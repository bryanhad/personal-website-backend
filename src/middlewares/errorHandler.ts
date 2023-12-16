import { ErrorRequestHandler } from 'express'
import { isHttpError } from 'http-errors'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = (err, req, res, next) => { //we have to disable the linting manually cuz if the params is just 3, then it won't be recognized as a errorHandler by express!, but it's annoying when the linting is mad cuz we don't use the 'next' param lol
    console.error(err)
    let statusCode = 500 //this is just for fallback
    let errorMessage = 'An unknown error occured'

    if (isHttpError(err)) { //if it is instance of http-error, then use it's errorcode & error message isntead
        statusCode = err.statusCode
        errorMessage = err.message
    }

    res.status(statusCode).json({ error: errorMessage })
}

export default errorHandler