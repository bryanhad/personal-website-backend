import { InferSchemaType, Schema, model } from 'mongoose'

const commentSchema = new Schema(
    {
        blogId: { type: Schema.Types.ObjectId, required: true },
        parentCommentId: { type: Schema.Types.ObjectId }, //this field is to determine if the comment is a child comment or not..
        //it's a bad idea to store the replies in an array, it scales poorly..
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true }, //autopupulate the field by using ref and using the model's name
        text: { type: String, required: true },
    },
    { timestamps: true }
)

type Comment = InferSchemaType<typeof commentSchema>

export default model<Comment>('Comment', commentSchema)