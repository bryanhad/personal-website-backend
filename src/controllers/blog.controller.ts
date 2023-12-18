import { RequestHandler } from 'express' // for defining express request handler.
import assertIsDefined from '../utils/assertIsDefined'
import mongoose from 'mongoose'
import sharp from 'sharp'
import env from '../env'
import createHttpError from 'http-errors'
import { BlogPost, GetBlogPostQuery } from '../validation/blog.validation'
import blogPostModel from '../models/blog-post.model'

export const getBlogPost: RequestHandler<
    unknown,
    unknown,
    unknown,
    GetBlogPostQuery
> = async (req, res, next) => {
    //the reason we use a const and not a function, is cuz we can define the function this way! this way, req, res, and next will automatically get the correct typing!

    const authorId = req.query.authorId
    const page = Number(req.query.page || '1')
    const pageSize = 6

    const filterOption = authorId ? { author: authorId } : {}

    try {
        const getQueriedBlogs = blogPostModel
            .find(filterOption)
            .sort({ _id: -1 }) // this is the way to sort descending in mongoose! -1
            .limit(pageSize)
            .skip((page - 1) * pageSize)
            .populate('author') //this will automatically attach the authors (which is user document) document to the response!
            // so the author key would be populated by the author's data, not the id! nice
            .exec() //executes the function and returns a promise
        // if you want to use good ol' callback, well you can omit the exec,
        // it is only for us to be able to use async await! noice.

        const countQueriedBlogs = blogPostModel
            .countDocuments(filterOption)
            .exec() //count the documents so we get the info about how many pages there are

        const [blogPosts, totalResults] = await Promise.all([
            getQueriedBlogs,
            countQueriedBlogs,
        ])

        const totalPages = Math.ceil(totalResults / pageSize)

        res.status(200).json({ blogPosts, page, totalPages })
    } catch (err) {
        next(err)
    }
}

export const getAllBlogPostSlug: RequestHandler = async (req, res, next) => {
    try {
        const results = await blogPostModel.find().select('slug').exec()
        const slugs = results.map((blog) => blog.slug)

        res.status(200).json(slugs)
    } catch (err) {
        next(err)
    }
}

export const getBlogPostBySlug: RequestHandler = async (req, res, next) => {
    try {
        const blog = await blogPostModel
            .findOne({ slug: req.params.slug })
            .populate('author')
            .exec()

        if (!blog) {
            throw createHttpError(404, 'No blog post found for this slug')
            //createHttpError is from the package http-erros
        }

        res.status(200).json(blog)
    } catch (err) {
        next(err)
    }
}

export const createBlogPost: RequestHandler<
    //defining the request's body is on the 3rd parameter.
    unknown,
    unknown,
    BlogPost,
    unknown
> = async (req, res, next) => {
    const blogImage = req.file // multer automatically appends the file key to the request, but the compiler doesn't know if we actually append it, so we have to check if the value is indeed not null or not undefined.
    const authenticatedUser = req.user

    try {
        assertIsDefined(blogImage)
        assertIsDefined(authenticatedUser)

        const slugExists = await blogPostModel
            .findOne({ slug: req.body.slug })
            .exec()

        if (slugExists) {
            throw createHttpError(
                409,
                'Slug already taken. Please choose a different one'
            )
        }

        //we need the blogImage to be saved with the same id as the blog ID! so, we have to assign the id ourselve!
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
            author: authenticatedUser._id,
        })

        res.status(201).json(newBlogPost)
    } catch (err) {
        next(err)
    }
}
