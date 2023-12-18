import * as yup from 'yup'
import { imageFileSchema, objectIdSchema } from '../utils/validation'

export const getBlogPostRequestSchema = yup.object({
    query: yup.object({
        authorId: objectIdSchema //check whether the authorId in the query is an instance of objectId (if passed that is)
    })
})

export type GetBlogPostQuery = yup.InferType<typeof getBlogPostRequestSchema>['query']

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