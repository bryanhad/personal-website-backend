import express from 'express'
import * as BlogPostsController from '../controllers/blog-post.controller' // we import form * so that we can access all the individual exports in a single place! neat.

const router = express.Router()

router
    .route('/')
    .get(BlogPostsController.getBlogPost)
    .post(BlogPostsController.createBlogPost)

export default router
