import { RequestHandler } from 'express'
import {
    createCommentBody,
    createCommentParams,
    getCommentsParams,
    getCommentsQuery,
} from '../validation/comments.validation'
import commentModel from '../models/comment.model'
import assertIsDefined from '../utils/assertIsDefined'

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

        await commentModel.populate(newComment, {path: 'author'}) //this would take the  author field in the commentModel, and populate it with the correspondning User id! 
        // this is the way to pupulate a field even with not using the find method.

        res.status(201).json(newComment)
    } catch (err) {
        next(err)
    }
}
