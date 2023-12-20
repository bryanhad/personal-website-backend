import 'dotenv/config'
import express from 'express'
import blogsRoutes from './routes/blog.routes'
import usersRoutes from './routes/users.routes'
import cors from 'cors'
import env from './env'
import morgan from 'morgan'
import errorHandler from './middlewares/errorHandler'
import createHttpError from 'http-errors'
import session from 'express-session'
import sessionConfig from './config/session'
import passport from 'passport'
import './config/passport' //by importing the file just like this, we can automatically execute all code in that file

const app = express()

app.use(morgan('dev')) // better console.logs! helps us to know where is the route that logs something..
app.use(cors({ 
    origin: env.WEBSITE_URL,
    credentials: true,
})) //now the backend is accessible to our frontend's url!
app.use(express.json()) // parse incoming json!

app.use(session(sessionConfig)) //this will run the express-session as the middleware for our Express app! //this lets us create the session and save our session to our database (currently using mongo, but later we gonna use redis in our server) //basically express-session is for managing session

app.use(passport.authenticate('session')) //this activates passport, and on every request to the backend, passport will fetch the user's session from the db, and then call thee deserializeUser to deserialize the session fetched, and then making the user object available on 'req.user' for every routes!

app.use('/uploads/blog-images', express.static('uploads/blog-images')) //this allows us to serve our images in the 'uploads/blog-images/' through the url directly! cool!
app.use('/uploads/profile-pictures', express.static('uploads/profile-pictures'))
app.use('/uploads/in-blog-images', express.static('uploads/in-blog-images'))

app.use('/posts', blogsRoutes)
app.use('/users', usersRoutes)

app.use((req, res, next) => next(createHttpError(404, 'Endpoint not found'))) // just a catch all basically

app.use(errorHandler)

export default app
