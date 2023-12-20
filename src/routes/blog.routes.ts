import express from 'express'
import * as BlogPostsController from '../controllers/blog.controller' // we import form * so that we can access all the individual exports in a single place! neat.
import * as CommentsController from '../controllers/comment.controller' // we import form * so that we can access all the individual exports in a single place! neat.
import { imageUpload } from '../middlewares/image-upload'
import mustAuthenticated from '../middlewares/mustAuthenticated'
import validateRequestSchema from '../middlewares/validateRequestSchema'
import {
    createBlogRequestSchema,
    deleteBlogSchema,
    getBlogPostsRequestSchema,
    updateBlogRequestSchema,
} from '../validation/blog.validation'
import {
    createBlogRateLimit,
    updateBlogRateLimit,
} from '../middlewares/rate-limit'
import {
    createCommentRequestSchema,
    deleteCommentRequestSchema,
    getCommentRepliesRequestSchema,
    getCommentsRequestSchema,
    updateCommentRequestSchema,
} from '../validation/comments.validation'

const router = express.Router()

router.get(
    '/',
    validateRequestSchema(getBlogPostsRequestSchema),
    BlogPostsController.getBlogPosts
)

router.post(
    '/',
    mustAuthenticated,
    createBlogRateLimit, //rate limit
    imageUpload.single('blogImage'), // the .single('string') represents a single prop in the request body with the string as the req.body's key that will be looked into. So our frontend has to send a req.body that has an 'blogImage' key in it.,
    validateRequestSchema(createBlogRequestSchema), // we validate the wole request object with yup
    BlogPostsController.createBlogPost
)

router.get('/slugs', BlogPostsController.getAllBlogPostSlug)

router.get('/post/:slug', BlogPostsController.getBlogPostBySlug)

router.patch(
    '/:blogId',
    mustAuthenticated,
    updateBlogRateLimit, //rate limit
    imageUpload.single('blogImage'),
    validateRequestSchema(updateBlogRequestSchema),
    BlogPostsController.updateBlog
)

router.delete(
    '/:blogId',
    mustAuthenticated,
    validateRequestSchema(deleteBlogSchema),
    BlogPostsController.deleteBlog
)

router.get(
    '/:blogId/comments',
    validateRequestSchema(getCommentsRequestSchema),
    CommentsController.getCommentsFromBlogId
)

router.post(
    '/:blogId/comments',
    mustAuthenticated,
    validateRequestSchema(createCommentRequestSchema),
    CommentsController.createComment
)

router.get(
    '/comments/:commentId/replies',
    validateRequestSchema(getCommentRepliesRequestSchema),
    CommentsController.getCommentReplies
)

router.patch(
    '/comments/:commentId',
    mustAuthenticated,
    validateRequestSchema(updateCommentRequestSchema),
    CommentsController.updateComment
)

router.delete(
    '/comments/:commentId',
    mustAuthenticated,
    validateRequestSchema(deleteCommentRequestSchema),
    CommentsController.deleteComment
)

export default router
