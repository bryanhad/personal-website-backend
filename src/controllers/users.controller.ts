import { RequestHandler } from 'express'
import userModel from '../models/user.model'
import createHttpError from 'http-errors'
import bcrypt from 'bcrypt'
import assertIsDefined from '../utils/assertIsDefined'
import { signUpBody, updateUserBody } from '../validation/users.validation'
import sharp from 'sharp'
import env from '../env'

export const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
    const authenticatedUser = req.user

    try {
        assertIsDefined(authenticatedUser)

        const user = await userModel
            .findById(authenticatedUser._id)
            .select('+email') // we have to manually select it cuz in the model, we purposely make so that the email field is not sellected by default
            .exec()

        res.status(200).json(user)
    } catch (err) {
        next(err)
    }
}

export const getUserByUsername: RequestHandler = async (req, res, next) => {
    try {
        const user = await userModel
            .findOne({ username: req.params.username })
            .exec()

        if (!user) {
            throw createHttpError(404, 'User not found')
        }

        res.status(200).json(user)
    } catch (err) {
        next(err)
    }
}

export const signUp: RequestHandler<
    unknown,
    unknown,
    signUpBody,
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
            password: hashedPassword,
        })

        const newUser = result.toObject() // we make the result of the user createdby usermodel to be plain ol' JS object, cuz we want to remove the password!
        delete newUser.password

        req.logIn(newUser, (err) => {
            //login would pass the first argument, which is a user objet that has a _id key on it, and would be passed to the passport's deserializeUser! it would get the session from the db, and append an Id key to the
            if (err) throw err
            res.status(201).json(newUser)
        }) //this req.login function is added by passport!
    } catch (err) {
        next(err)
    }
}

export const logOut: RequestHandler = (req, res) => {
    req.logOut((err) => {
        //this func is from passport
        if (err) throw err //we don't need to pass the errorr to the next, cuz if we make the request handler not an async func, the errorr would be automatically forwarded to the error handler
        res.sendStatus(200)
    })
    //when we logout, it doesn't destroy the cookie on the client and not destroy the session in the db,
    //instead the session on the db is altered, where the user's id is removed!

    // similarly, when we login using the passport's func, we would update the session in the db and set the user's id to the stored session that still refers to the same cookie!
}

export const updateUser: RequestHandler<
    unknown,
    unknown,
    updateUserBody,
    unknown
> = async (req, res, next) => {
    const profilePic = req.file
    const {username, displayName, about} = req.body
    const authenticatedUser = req.user

    try {
        assertIsDefined(authenticatedUser)

        if (username) {
            const usernameExists = await userModel
                .findOne({ username: username })
                .collation({ locale: 'en', strength: 2 })
                .exec()

            if (usernameExists) {
                throw createHttpError(409, 'Username already taken')
            }
        }

        let profilePicDestinationPath: string | undefined = undefined

        if (profilePic) {
            //if there is a profile pic being send.. the profile pic would be attached to the req.file.. it just how multer does things
            profilePicDestinationPath =
                '/uploads/profile-pictures/' + authenticatedUser._id + '.png'

            await sharp(profilePic.buffer)
                .resize(500, 500, {
                    withoutEnlargement: true, //this makes sure that if user uploads smaller than 500x500, it wont be stretched to meet the resize of 500x500 lol
                })
                .toFile('./' + profilePicDestinationPath) //where we want to save the image to
        }

        const updatedUser = await userModel.findByIdAndUpdate(authenticatedUser._id, {
            $set: { //with the $set, we tell mongoose that JUST UPDATE WHAT WE SENT HERE! if we dont use the $set, we will lose the user's data! not bueno :(
                ...(username && {username}), //this is how u put a key value pair to a JS object conditionally! 
                //basically says if the username is truthy, add username:username
                ...(displayName && {displayName}),
                ...(about && {about}),
                ...(profilePic && {profilePicUrl: env.SERVER_URL + profilePicDestinationPath}),
            }
        }, { new: true }).exec() //the configuration of {new:true} just tells the findByIdAndUpdate to return the user's state after the update! cuz by default, it returns the user's state before the update lel :D

        res.status(200).json(updatedUser)
    } catch (err) {
        next(err)
    }
}
