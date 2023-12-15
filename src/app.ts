import 'dotenv/config'
import express from 'express'
import blogPostRoutes from './routes/blog-post.routes'
import cors from 'cors'
import env from './env'
import morgan from 'morgan'

const app = express()

app.use(morgan('dev')) // better console.logs! helps us to know where is the route that logs something..
app.use(cors({ origin: env.WEBSITE_URL })) //now the backend is accessible to our frontend's url!
app.use(express.json()) // parse incoming json!

app.use('/posts', blogPostRoutes)

export default app
