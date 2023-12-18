import * as yup from 'yup'
import { imageFileSchema } from '../utils/validation'

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