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
app.use(session(sessionConfig)) //this lets us save our session to our database (currently using mongo, but later we gonna use redis in our server)
app.use(passport.authenticate('session')) //this activates passport, and makes it use express session to store user sessions to our databse

app.use('/uploads/blog-images', express.static('uploads/blog-images')) //this allows us to serve our images in the 'uploads/blog-images/' through the url directly! cool!

app.use('/posts', blogsRoutes)
app.use('/users', usersRoutes)

app.use((req, res, next) => next(createHttpError(404, 'Endpoint not found'))) // just a catch all basically

app.use(errorHandler)

export default app
