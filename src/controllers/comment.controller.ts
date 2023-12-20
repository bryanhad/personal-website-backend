import { RequestHandler } from 'express'
import {
    createCommentBody,
    createCommentParams,
    deleteCommentParams,
    getCommentRepliesParams,
    getCommentRepliesQuery,
    getCommentsParams,
    getCommentsQuery,
    updateCommentBody,
    updateCommentParams,
} from '../validation/comments.validation'
import commentModel from '../models/comment.model'
import assertIsDefined from '../utils/assertIsDefined'
import createHttpError from 'http-errors'

export const getCommentsFromBlogId: RequestHandler<
    getCommentsParams,
    unknown,
    unknown,
    getCommentsQuery
> = async (req, res, next) => {
    const { blogId } = req.params
    const { continueAfterId } = req.query

    const pageSize = 3

    try {
        const commentQuery = commentModel
            .find({ blogId, parentCommentId: undefined }) //ignore any comment that is a child comment
            .sort({ _id: -1 }) //sort by newest / desc

        if (continueAfterId) {
            commentQuery.lt('_id', continueAfterId) //if the continuAfterId is passed, we will query a comment that has the '_id' LESS THAN the continueAfterId, which means the older comment than the last comment on the blog.
        }

        const result = await commentQuery
            .limit(pageSize + 1)
            .populate('author')
            .exec()

        const comments = result.slice(0, pageSize) //the comments that we send to the client would always be the size of pageSize or less..

        const endOfPaginationReached = result.length <= pageSize //example: when we fetch the getCommentsFromBlogId, it will fetch the comments by pageSize  + 1, which is 4.
        // if the result of the fetch is 4, then the endOfPaginationReached would be false. cuz 4 is not less than or equal to 3.
        // if the result of the fetch is less than 4, then endOfPaginationReached would be true. and we know there isn't a next pagination.

        // this info would be used in the frontend where we can determine whether to show the 'load more' button or not! COOL

        const commentsWithRepliesCount = await Promise.all(
            comments.map(async (comment) => {
                const repliesCount = await commentModel.countDocuments({
                    parentCommentId: comment._id,
                }) //iterate through the fetched commets, and get each reply count of em
                //since the retrieved comment from mongoose is of type mongoose object, we have to make em into POJO so we can sread em
                return { ...comment.toObject(), repliesCount }
            })
        )

        res.status(200).json({
            comments: commentsWithRepliesCount,
            endOfPaginationReached,
        })
    } catch (err) {
        next(err)
    }
}

export const getCommentReplies: RequestHandler<
    getCommentRepliesParams,
    unknown,
    unknown,
    getCommentRepliesQuery
> = async (req, res, next) => {
    const { commentId: parentCommentId } = req.params
    const { continueAfterId } = req.query

    const pageSize = 2

    try {
        const commentRepliesQuery = commentModel //this will fetch the replies async, which the oldest is at tge top
            .find({ parentCommentId })

        if (continueAfterId) {
            commentRepliesQuery.gt('_id', continueAfterId) //get the newer comments replies to load!
        }

        const result = await commentRepliesQuery
            .limit(pageSize + 1)
            .populate('author')
            .exec()

        const comments = result.slice(0, pageSize)
        const endOfPaginationReached = result.length <= pageSize

        res.status(200).json({
            comments,
            endOfPaginationReached,
        })
    } catch (err) {
        next(err)
    }
}

export const createComment: RequestHandler<
    createCommentParams,
    unknown,
    createCommentBody,
    unknown
> = async (req, res, next) => {
    const { blogId } = req.params
    const { text, parentCommentId } = req.body
    const authenticatedUser = req.user

    try {
        assertIsDefined(authenticatedUser)

        const newComment = await commentModel.create({
            blogId,
            author: authenticatedUser._id,
            parentCommentId,
            text,
        })

        await commentModel.populate(newComment, { path: 'author' }) //this would take the  author field in the commentModel, and populate it with the correspondning User id!
        // this is the way to pupulate a field even with not using the find method.

        res.status(201).json(newComment)
    } catch (err) {
        next(err)
    }
}

export const updateComment: RequestHandler<
    updateCommentParams,
    unknown,
    updateCommentBody,
    unknown
> = async (req, res, next) => {
    const { commentId } = req.params
    const { newText } = req.body
    const authenticatedUser = req.user

    try {
        assertIsDefined(authenticatedUser)

        const commentToUpdate = await commentModel
            .findById(commentId)
            .populate('author')
            .exec()

        if (!commentToUpdate) {
            throw createHttpError(404, 'comment not found')
        }

        if (!commentToUpdate.author.equals(authenticatedUser._id)) {
            //to compare between id's we can use the equals method on the object that has the id
            throw createHttpError(
                401,
                'You are not authorized to udpdate this comment'
            )
        }

        commentToUpdate.text = newText
        await commentToUpdate.save()

        res.status(200).json(commentToUpdate)
    } catch (err) {
        next(err)
    }
}

export const deleteComment: RequestHandler<
    deleteCommentParams,
    unknown,
    unknown,
    unknown
> = async (req, res, next) => {
    const { commentId } = req.params
    const authenticatedUser = req.user
    try {
        assertIsDefined(authenticatedUser)

        const commentToDelete = await commentModel.findById(commentId).exec()

        if (!commentToDelete) {
            throw createHttpError(404, 'Comment not found')
        }
        if (!commentToDelete.author.equals(authenticatedUser._id)) {
            throw createHttpError(
                401,
                'You are not authorized to delete this comment'
            )
        }

        await commentToDelete.deleteOne()

        await commentModel.deleteMany({ parentCommentId: commentId }) //also delete all the child comments of the deleted comment!

        res.sendStatus(200)
    } catch (err) {
        next(err)
    }
}
