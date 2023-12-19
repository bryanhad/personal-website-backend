import { RequestHandler } from 'express' // for defining express request handler.
import assertIsDefined from '../utils/assertIsDefined'
import mongoose from 'mongoose'
import sharp from 'sharp'
import env from '../env'
import createHttpError from 'http-errors'
import {
    BlogPost,
    DeleteBlogParams,
    GetBlogPostsQuery,
    UpdateBlogParams,
} from '../validation/blog.validation'
import blogPostModel from '../models/blog-post.model'
import fs from 'fs'
import axios from 'axios'

export const getBlogPosts: RequestHandler<
    unknown,
    unknown,
    unknown,
    GetBlogPostsQuery
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

export const updateBlog: RequestHandler<
    UpdateBlogParams,
    unknown,
    BlogPost,
    unknown
> = async (req, res, next) => {
    const { blogId } = req.params //see? the benefit of using yup's schema is that now the blogId type is string!
    // just a reminder, we handle the validation of the request object to this endpoint from the middleware, by using our UpdateBlogRequestSchema, but that still doesn't tell the compiler about the typings in this request handler,
    // so we still have to pass in the types manually like the above where we define the typings for our RequestHandler..
    const { slug, title, body, summary } = req.body
    const blogImage = req.file
    const authenticatedUser = req.user

    try {
        assertIsDefined(authenticatedUser)

        const slugExists = await blogPostModel.findOne({slug}).exec()
        if (slugExists && !slugExists._id.equals(blogId)) { //if the slug exist AND is different one from the targeted blog.. which means other blog already has the slug
            throw createHttpError(409, 'Slug already taken. Please choose a different one')
        }

        const blogToBeEdited = await blogPostModel.findById(blogId).exec()

        if (!blogToBeEdited) {
            throw createHttpError(404, 'Blog post not found')
        }

        // here, we use special equals method to check between two object Ids
        if (!blogToBeEdited.author.equals(authenticatedUser._id)) {
            throw createHttpError(401, 'You are not the author of this blog')
        }

        blogToBeEdited.slug = slug
        blogToBeEdited.title = title
        blogToBeEdited.summary = summary
        blogToBeEdited.body = body

        if (blogImage) {
            const blogImageDestinationPath =
                '/uploads/blog-images/' + blogId + '.png' //this tells about where we will save the image in our server

            await sharp(blogImage.buffer)
                .resize(700, 450) //we resize the image to w:700, and h:450
                .toFile('./' + blogImageDestinationPath) //store the image in our file system

            blogToBeEdited.blogImage =
                env.SERVER_URL +
                blogImageDestinationPath +
                '?lastUpdated=' +
                Date.now()
            // it is necessary to add the query of something unique, so that the browser would load the updated image even though the name is the same!
        }

        await blogToBeEdited.save()

        await axios.get(env.WEBSITE_URL + `/api/revalidate-blog/${slug}?secret=${env.POST_REVALIDATION_KEY}`) //this revalidation makes so that the next's cache will be updated! and it just like the user (author who updates) helps to update the build cache to be the updated version! 
        // so when other user's visit the page, they will be served the updated cache!

        res.sendStatus(200)
    } catch (err) {
        next(err)
    }
}

export const deleteBlog: RequestHandler<DeleteBlogParams> = async (
    req,
    res,
    next
) => {
    const { blogId } = req.params
    const authenticatedUser = req.user

    try {
        assertIsDefined(authenticatedUser)

        const toBeDeletedBlog = await blogPostModel.findById(blogId).exec()

        if (!toBeDeletedBlog) {
            throw createHttpError(404, 'Blog post not found')
        }

        if (!toBeDeletedBlog.author.equals(authenticatedUser._id)) {
            throw createHttpError(401, 'You are not the owner of this blog')
        }

        if (toBeDeletedBlog.blogImage.startsWith(env.SERVER_URL)) {
            //search the blog's image and we want to delete it also! no need to save unused images in our server~
            const imagePath = toBeDeletedBlog.blogImage
                .split(env.SERVER_URL)[1] //we don't need the first parth of https:blabla.. we only want the subdir part
                .split('?')[0] //remove the query if there is any.. cuz we only need the path of the image!
            // remember that the query only is there on the database, not on our server
            fs.unlinkSync('.' + imagePath) //removes a file in the file system. native to nodejs
        }

        await toBeDeletedBlog.deleteOne()

        await axios.get(env.WEBSITE_URL + `/api/revalidate-blog/${toBeDeletedBlog.slug}?secret=${env.POST_REVALIDATION_KEY}`)

        res.sendStatus(204) //204 for resource has successfully been deleted
    } catch (err) {
        next(err)
    }
}
