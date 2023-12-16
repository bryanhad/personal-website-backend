import { RequestHandler } from 'express' // for defining express request handler.
import BlogPostModel from '../models/blog-post.model'
import blogPostModel from '../models/blog-post.model'
import assertIsDefined from '../utils/assertIsDefined'
import mongoose from 'mongoose'
import sharp from 'sharp'
import env from '../env'

export const getBlogPost: RequestHandler = async (req, res, next) => {
    //the reason we use a const and not a function, is cuz we can define the function this way! this way, req, res, and next will automatically get the correct typing!
    try {
        const allBlogPosts = await BlogPostModel.find()
            .sort({ _id: -1 }) // this is the way to sort descending in mongoose! -1
            .exec() //executes the function and returns a promise
        // if you want to use good ol' callback, well you can omit the exec,
        // it is only for us to be able to use async await! noice.
        res.status(200).json(allBlogPosts)
    } catch (err) {
        console.error(err)
        res.status(500).json({ err })

        // next(err)
    }
}

export const getAllBlogPostSlug: RequestHandler = async (req, res, next) => {
    try {
        const results = await BlogPostModel.find().select('slug').exec()
        const slugs = results.map(blog => blog.slug)

        res.status(200).json(slugs)
    } catch (err) {
        console.error(err)
        res.status(500).json({ err })
    }
}

export const getBlogPostBySlug: RequestHandler = async (req, res, next) => {
    try {
        const blog = await BlogPostModel.findOne({
            slug: req.params.slug,
        }).exec()

        if (!blog) return res.sendStatus(404) //send status is if u only want to send the status without a body!

        res.status(200).json(blog)
    } catch (err) {
        console.error(err)
        res.status(500).json({ err })
    }
}

type BlogPost = {
    slug: string
    title: string
    summary: string
    body: string
}

export const createBlogPost: RequestHandler<
    //defining the request's body is on the 3rd parameter.
    unknown,
    unknown,
    BlogPost,
    unknown
> = async (req, res, next) => {
    const blogImage = req.file // multer automatically appends the file key to the request, but the compiler doesn't know if we actually append it, so we have to check if the value is indeed not null or not undefined.
    try {
        assertIsDefined(blogImage)

        //we need the blogImage to be saved with the same id as the blog ID!
        const blogPostId = new mongoose.Types.ObjectId()

        const blogImageDestinationPath =
            '/uploads/blog-images/' + blogPostId + '.png' //this tells about where we will save the image in our server

        await sharp(blogImage.buffer)
            .resize(700, 450) //we resize the image to w:700, and h:450
            .toFile('./' + blogImageDestinationPath) //store the image in our file system

        const newBlogPost = await blogPostModel.create({
            _id: blogPostId,
            ...req.body,
            blogImage: env.SERVER_URL + blogImageDestinationPath,
        })

        res.status(201).json(newBlogPost)
    } catch (err) {
        console.error(err)
        res.status(500).json({ err, bruh: 'bruh' })
        // next(err)
    }
}
