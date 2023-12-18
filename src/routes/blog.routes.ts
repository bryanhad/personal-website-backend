import express from 'express'
import * as BlogPostsController from '../controllers/blog.controller' // we import form * so that we can access all the individual exports in a single place! neat.
import { imageUpload } from '../middlewares/image-upload'
import mustAuthenticated from '../middlewares/mustAuthenticated'

const router = express.Router()

router
    .route('/')
    .get(BlogPostsController.getBlogPost)
    // the .single('string') represents a single prop in the request body with the string as the req.body's key that will be looked into. So our frontend has to send a req.body that has an 'image' key in it.
    .post(mustAuthenticated, imageUpload.single('blogImage'), BlogPostsController.createBlogPost)

router.get('/slugs', BlogPostsController.getAllBlogPostSlug)

router.route('/post/:slug').get(BlogPostsController.getBlogPostBySlug)

export default router
