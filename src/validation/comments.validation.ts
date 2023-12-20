import * as yup from 'yup'
import { objectIdSchema } from '../utils/validation'

const commentTextSchema = yup.string().required().max(700, 'Comment must be less than 700 characters')

export const getCommentsRequestSchema = yup.object({
    params: yup.object({
        blogId: objectIdSchema.required()
    }),
    query: yup.object({
        continueAfterId: objectIdSchema //this is optional, cuz at first, the blog won't have a commnet!
    })
})

export type getCommentsParams = yup.InferType<typeof getCommentsRequestSchema>['params']
export type getCommentsQuery = yup.InferType<typeof getCommentsRequestSchema>['query']

export const getCommentRepliesRequestSchema = yup.object({
    params: yup.object({
        commentId: objectIdSchema.required()
    }),
    query: yup.object({
        continueAfterId: objectIdSchema //this is optional, cuz at first, the blog won't have a commnet!
    })
})

export type getCommentRepliesParams = yup.InferType<typeof getCommentRepliesRequestSchema>['params']
export type getCommentRepliesQuery = yup.InferType<typeof getCommentRepliesRequestSchema>['query']

export const createCommentRequestSchema = yup.object({
    body: yup.object({
        text: commentTextSchema,
        parentCommentId: objectIdSchema //it's not required cuz we never know wether the comment is for the top level or is nested
    }),
    params: yup.object({
        blogId: objectIdSchema.required()
    })
})

export type createCommentParams = yup.InferType<typeof createCommentRequestSchema>['params']
export type createCommentBody = yup.InferType<typeof createCommentRequestSchema>['body']

export const updateCommentRequestSchema = yup.object({
    body: yup.object({
        newText: commentTextSchema,
    }),
    params: yup.object({
        commentId: objectIdSchema.required()
    })
})

export type updateCommentParams = yup.InferType<typeof updateCommentRequestSchema>['params']
export type updateCommentBody = yup.InferType<typeof updateCommentRequestSchema>['body']

export const deleteCommentRequestSchema = yup.object({
    params: yup.object({
        commentId: objectIdSchema.required()
    })
})

export type deleteCommentParams = yup.InferType<typeof deleteCommentRequestSchema>['params']