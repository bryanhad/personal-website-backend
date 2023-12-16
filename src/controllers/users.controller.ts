import { RequestHandler } from 'express'
import userModel from '../models/user.model'
import createHttpError from 'http-errors'
import bcrypt from 'bcrypt'

type SignUpBody = {
    username: string
    email: string
    password: string
}

export const signUp: RequestHandler<
    unknown,
    unknown,
    SignUpBody,
    unknown
> = async (req, res, next) => {
    const { username, email, password: rawPassword } = req.body

    try {
        const usernameExists = await userModel
            .findOne({ username })
            .collation({ locale: 'en', strength: 2 }) //this would find the username even with a different letter casing!
            .exec()

        if (usernameExists) {
            throw createHttpError(409, 'Username already taken')
        }

        const hashedPassword = await bcrypt.hash(rawPassword, 10)

        const result = await userModel.create({
            username,
            displayName: username,
            email,
            password: hashedPassword
        })

        const newUser = result.toObject() // we make the result of the user createdby usermodel to be plain ol' JS object, cuz we want to remove the password!
        delete newUser.password

        res.status(201).json(newUser)

    } catch (err) {
        next(err)
    }
}
