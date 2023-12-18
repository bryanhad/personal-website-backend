import { RequestHandler } from 'express'
import createHttpError from 'http-errors'
import { Schema, ValidationError } from 'yup'

//basically this middleware will return a request Handler!
// why do we do it like this? cuz we want to use any validation schema that we want in the future! this reduces code repitition~
const validateRequestSchema = (schema: Schema): RequestHandler => {
    return async (req, res, next) => {
        try {
            await schema.validate(req)
            next()
        } catch (err) {
            if (err instanceof ValidationError) {
                //if the error is from yup's validation error..
                next(createHttpError(400, err.message))
            } else {
                next(err)
            }
        }
    }
}

export default validateRequestSchema