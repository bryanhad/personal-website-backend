import passport from 'passport'
import {Strategy as LocalStrategy} from 'passport-local'
import userModel from '../models/user.model'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
//passport is a authentication middleware! basically for login!

passport.serializeUser((user, cb) => { //after the user logged in successfuly, the user returned from the localStrategy below would be passed to this function! where now, we can decide what data should be stored in the session! we can do that via the cb function!
    //basically this func purpose is to handle writing the user's session into our database
    cb(null, user._id)
})

passport.deserializeUser((userId:string, cb) => { //this function purpose is to handle everytime there is a request to the server, passport would get the user's session from our database and will pass the data we stored to the first param of this func, which is 'userId'!, then passport would attach the thing that we return from this deeserializeUser function to the request object!
    // so that we can use the data from the stored session into our endpoints

    cb(null, {_id: new mongoose.Types.ObjectId(userId)})

})

passport.use(new LocalStrategy(async (username, password, cb) => { //this function would run on the users routes/login end point! u can check it!
    try {
        const userExists = await userModel.findOne({username})
            .select('+email +password') //this is to select more than one field
            .exec()

            if (!userExists || !userExists.password) { //if the user doesn't exist or has no password, meaning they use social provider to login..
                return cb(null, false) //the second argument of the cb just tells that there is no user found or they uses a social provider, and this will return a 401 response, which means unvalid credentials
            }

            const passwordMatch = await bcrypt.compare(password, userExists.password)

            if (!passwordMatch) {
                return cb(null, false)
            }

            const user = userExists.toObject()
            delete user.password
            
            cb(null, user) //this will return the user and append it to the request object!
    } catch (err) {
        cb(err)
    }
}))