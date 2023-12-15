import 'dotenv/config'
import express from 'express';
import blogPostRoutes from './routes/blog-post.routes'

const app = express()

app.use(express.json()) // parse incoming json!

app.use('/posts', blogPostRoutes)

export default app;