import express from 'express'
import * as UsersController from '../controllers/users.controller'
import passport from 'passport'

const router = express.Router()

router.get('/me', UsersController.getAuthenticatedUser)

router.post('/signup', UsersController.signUp)

// passport.authenticate('local') would execute our localStrategy in our config
router.post('/login', passport.authenticate('local'), (req, res) => res.status(200).json(req.user))

router.post('/logout', UsersController.logOut)

export default router