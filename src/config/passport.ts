import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import userModel from '../models/user.model'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as GitHubStrategy, Profile } from 'passport-github2'
import { VerifyCallback } from 'passport-oauth2'
import env from '../env'

//passport is a authentication middleware! basically for login!

passport.serializeUser((user, cb) => {
    //after the user logged in successfuly, the user returned from the localStrategy below would be passed to this function! where now, we can decide what data should be stored in the session! we can do that via the cb function!
    //basically this func purpose is to handle writing the user's session into our database
    cb(null, user._id)
})

passport.deserializeUser((userId: string, cb) => {
    //this function purpose is to handle everytime there is a request to the server, passport would get the user's session from our database and will pass the data we stored to the first param of this func, which is 'userId'!, then passport would attach the thing that we return from this deeserializeUser function to the request object! in the req.user
    // so that we can use the data from the stored session into our endpoints

    cb(null, { _id: new mongoose.Types.ObjectId(userId) })
})

passport.use(
    new LocalStrategy(async (username, password, cb) => {
        //this function would run on the users routes/login end point! u can check it!
        try {
            const userExists = await userModel
                .findOne({ username })
                .select('+email +password') //this is to select more than one field
                .exec()

            if (!userExists || !userExists.password) {
                //if the user doesn't exist or has no password, meaning they use social provider to login..
                return cb(null, false) //the second argument of the cb just tells that there is no user found or they uses a social provider, and this will return a 401 response, which means unvalid credentials
            }

            const passwordMatch = await bcrypt.compare(
                password,
                userExists.password
            )

            if (!passwordMatch) {
                return cb(null, false)
            }

            const user = userExists.toObject()
            delete user.password

            cb(null, user) //this will return the user and append it to the request object!
        } catch (err) {
            cb(err)
        }
    })
)

passport.use(
    new GoogleStrategy(
        {
            clientID: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            callbackURL: env.SERVER_URL + '/users/oauth2/redirect/google',
            scope: ['profile', 'email'], //this just names the data that we get from google, and the data that we get depends on our setting configuration when we configure the consent scope (what datas that we want from google)
        },
        async (accessToken, refreshToken, profile, cb) => {
            //we don't really need to do anything with the accessToken and refreshToken,
            // those are needed if we want to access their google account, for instance if we want to do something with their google drive account
            // but we dont need 'em.. we just want to verify the user's google email credibility
            try {
                // this is after the user already clicked the google sign in button..
                let user = await userModel
                    .findOne({ googleId: profile.id })
                    .exec() //find a user that has this google Id

                if (!user) { //if user with the google id not found
                    if (profile.emails) { //check wether we can get the user's email
                        const emailAddress = profile.emails[0].value
                        user = await userModel
                            .findOne({ email: emailAddress }) //find user by email
                            .exec()

                        if (user) {
                            user.googleId = profile.id //if found, update the googleId
                            await user.save()
                        } else {
                            user = await userModel.create({
                                // if the user is not found via email, just create new user
                                googleId: profile.id,
                                email: emailAddress,
                            })
                        }
                    } else {
                        user = await userModel.create({
                            // if we CANNOT get the google's EMAIL, just create new user also
                            googleId: profile.id,
                        })
                    }

                }
                //at this point, the login is successful, either there is already a user that has the googleId, or we create a new user
                cb(null, user)
            } catch (err) {
                if (err instanceof Error) {
                    cb(err) //idk why but this callback expect the err argument to be a typeOf Error instead of any..
                } else {
                    throw err
                }
            }
        }
    )
)

passport.use(
    new GitHubStrategy(
        {
            clientID: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
            callbackURL: '/users/oauth2/redirect/github',
            scope: ['user:email'],
        },
        async (
            accessToken: string,
            refreshToken: string,
            profile: Profile,
            cb: VerifyCallback
        ) => {
            console.log(profile, 'THIS IS THE PROFILE OF GITHUB ACCOUNT')
            try {
                let user = await userModel
                    .findOne({ githubId: profile.id })
                    .exec()

                if (!user) {
                    //if there is no user with the github ID

                    if (profile.emails) {
                        //but if we CAN get the github's EMAIL from the github oauth..
                        const emailAddress = profile.emails[0].value

                        user = await userModel
                            .findOne({ email: emailAddress }) //we will try to find the user via the email address
                            .exec()

                        if (user) {
                            user.githubId = profile.id //if user exists via the email, update the github ID of the user
                            await user.save()
                        } else {
                            user = await userModel.create({
                                // if the user is not found via email, just create new user
                                githubId: profile.id,
                                email: emailAddress,
                            })
                        }
                    } else {
                        user = await userModel.create({
                            // if we CANNOT get the github's EMAIL, just create new user also
                            githubId: profile.id,
                        })
                    }
                }

                cb(null, user)
            } catch (err) {
                if (err instanceof Error) {
                    cb(err) //idk why but this callback expect the err argument to be a typeOf Error instead of any..
                } else {
                    throw err
                }
            }
        }
    )
)
