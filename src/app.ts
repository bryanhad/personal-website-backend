import 'dotenv/config'
import express from 'express'
import blogsRoutes from './routes/blog.routes'
import usersRoutes from './routes/users.routes'
import cors from 'cors'
import env from './env'
import morgan from 'morgan'
import errorHandler from './middlewares/errorHandler'
import createHttpError from 'http-errors'

const app = express()

app.use(morgan('dev')) // better console.logs! helps us to know where is the route that logs something..
app.use(cors({ origin: env.WEBSITE_URL })) //now the backend is accessible to our frontend's url!
app.use(express.json()) // parse incoming json!

app.use('/uploads/blog-images', express.static('uploads/blog-images')) //this allows us to serve our images in the 'uploads/blog-images/' through the url directly! cool!

app.use('/posts', blogsRoutes)
app.use('/users', usersRoutes)

app.use((req, res, next) => next(createHttpError(404, 'Endpoint not found'))) // just a catch all basically

app.use(errorHandler)

export default app
