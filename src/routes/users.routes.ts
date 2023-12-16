import express from 'express'
import * as UsersController from '../controllers/users.controller'

const router = express.Router()

router.post('/signup', UsersController.signUp)

export default router