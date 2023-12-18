import express from 'express'
import * as UsersController from '../controllers/users.controller'
import passport from 'passport'
import mustAuthenticated from '../middlewares/mustAuthenticated'
import validateRequestSchema from '../middlewares/validateRequestSchema'
import {
    signUpRequestSchema,
    updateUserRequestSchema,
} from '../validation/users.validation'
import { profilePicUpload } from '../middlewares/image-upload'

const router = express.Router()

router.get('/me', mustAuthenticated, UsersController.getAuthenticatedUser)

router.get('/profile/:username', UsersController.getUserByUsername)

router.post(
    '/signup',
    validateRequestSchema(signUpRequestSchema),
    UsersController.signUp
)

// passport.authenticate('local') would execute our localStrategy in our config
router.post('/login', passport.authenticate('local'), (req, res) =>
    res.status(200).json(req.user)
)

router.post('/logout', UsersController.logOut)

router.patch(
    '/me',
    mustAuthenticated,
    profilePicUpload.single('profilePic'),
    validateRequestSchema(updateUserRequestSchema),
    UsersController.updateUser
)

export default router
