import express from 'express'
import * as UsersController from '../controllers/users.controller'
import passport from 'passport'
import mustAuthenticated from '../middlewares/mustAuthenticated'
import validateRequestSchema from '../middlewares/validateRequestSchema'
import {
    verificationCodeRequestSchema,
    signUpRequestSchema,
    updateUserRequestSchema,
} from '../validation/users.validation'
import { profilePicUpload } from '../middlewares/image-upload'
import env from '../env'
import setSessionReturnTo from '../middlewares/setSessionReturnTo'

const router = express.Router()

router.get('/me', mustAuthenticated, UsersController.getAuthenticatedUser)

router.get('/profile/:username', UsersController.getUserByUsername)

router.post(
    '/signup',
    validateRequestSchema(signUpRequestSchema),
    UsersController.signUp
)

router.post('/verification-code', validateRequestSchema(verificationCodeRequestSchema), UsersController.giveEmailVerificationCode)

// passport.authenticate('local') would execute our localStrategy in our config
router.post('/login', passport.authenticate('local'), (req, res) =>
    res.status(200).json(req.user)
)

router.get('/login/google', setSessionReturnTo, passport.authenticate('google')) //this will work out of the box, cuz we already setup the googleStrategy in the passport's config. This route, '/login/google' is where our frontend's googleButton would redirect the user to. it's a google login page.
// after the user logged in from this page, the user would be redirected to the '/oauth2/redirect/google' route below.
// cuz that is the redirect url that we set on the google console, and on our passport googleStrategy

router.get('/oauth2/redirect/google', passport.authenticate('google', {
    successReturnToOrRedirect:  env.WEBSITE_URL, //when the google auth is done, the user would be redirected to this url
    keepSessionInfo: true //by default, passport would remove the session data.. but we want to keep our returnTo key in our session! for the redirect to the returnTo that we set with the setSessionReturnTo middleware to work!

    //the successReturnToOrRedirect would look into the req.session.returnTo value and will use it as the redirect url if there is any.
    // if there isn't any, our env.WEBSITE_URL would be the fallback redirect value instead.
}))

router.get('/login/github', setSessionReturnTo, passport.authenticate('github'))

router.get('/oauth2/redirect/github', passport.authenticate('github', {
    successReturnToOrRedirect:  env.WEBSITE_URL,
    keepSessionInfo: true
}))

router.post('/logout', UsersController.logOut)

router.patch(
    '/me',
    mustAuthenticated,
    profilePicUpload.single('profilePic'),
    validateRequestSchema(updateUserRequestSchema),
    UsersController.updateUser
)

export default router
