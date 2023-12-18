import * as yup from 'yup'
import { imageFileSchema, objectIdSchema } from '../utils/validation'

export const getBlogPostsRequestSchema = yup.object({
    query: yup.object({
        authorId: objectIdSchema, //check whether the authorId in the query is an instance of objectId (if passed that is)
        page: yup.string() //url param is always a string
    })
})

export type GetBlogPostsQuery = yup.InferType<typeof getBlogPostsRequestSchema>['query']

const blogBodySchema = yup.object({
    title: yup.string().required().max(100),
    slug: yup
        .string()
        .required()
        .max(100)
        .matches(/^[a-zA-Z0-9_-]*$/),
    summary: yup.string().required().max(300),
    body: yup.string().required(),
})

export type BlogPost = yup.InferType<typeof blogBodySchema>

export const createBlogRequestSchema = yup.object({
    body: blogBodySchema,
    file: imageFileSchema.required('Blog image required')
})

export const updateBlogRequestSchema = yup.object({
    params: yup.object({
        blogId: objectIdSchema.required() //it is required cuz we can't update the blog without knowing the blog's id.. duhh
    }),
    body: blogBodySchema,
    file: imageFileSchema, //the blog image is not required, cuz by default, the input file would be empty, and we don't want to force our poor users to upload a new blog image everytime they want to update their blog lol
})

export type UpdateBlogParams = yup.InferType<typeof updateBlogRequestSchema>['params']

export const deleteBlogSchema = yup.object({
    params: yup.object({
        blogId: objectIdSchema.required()
    }),
})

export type DeleteBlogParams = yup.InferType<typeof deleteBlogSchema>['params']