import { RequestHandler } from 'express' // for defining express request handler.
import BlogPostModel from '../models/blog-post.model'
import blogPostModel from '../models/blog-post.model'

export const getBlogPost: RequestHandler = async (req, res, next) => {
    //the reason we use a const and not a function, is cuz we can define the function this way! this way, req, res, and next will automatically get the correct typing!
    try {
        const allBlogPosts = await BlogPostModel.find().exec() //executes the function and returns a promise
        // if you want to use good ol' callback, well you can omit the exec,
        // it is only for us to be able to use async await! noice.

        res.status(200).json(allBlogPosts)
    } catch (err) {
        console.error(err)
        res.status(500).json({err})

        // next(err)
    }
}

type BlogPost = {
    slug: string
    title: string
    summary: string
    body: string
}

export const createBlogPost: RequestHandler< //defining the request's body is on the 3rd parameter.
    unknown,
    unknown,
    BlogPost,
    unknown
> = async (req, res, next) => {
    try {
        const newBlogPost = await blogPostModel.create(req.body)

        res.status(201).json(newBlogPost)
    } catch (err) {
        console.error(err)
        res.status(500).json({err, bruh:'bruh'})
        // next(err)
    }
}
