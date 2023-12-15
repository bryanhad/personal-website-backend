import { InferSchemaType, Schema, model } from 'mongoose'

const blogPostSchema = new Schema({
    slug: {
        type: String,
        required: true,
        unique:true
    },
    title: {
        type: String,
        required:true,
        unique:true
    },
    summary: {
        type: String,
        required:true,
        unique:true
    },
    body: {
        type: String,
        required:true,
        unique:true
    },
}, {
    timestamps: true //this is mongoose feature! mongoose will automatically add createdAt and updatedAt timestamps to our schema!
})

type BlogPost = InferSchemaType<typeof blogPostSchema> //InferSchemaType will automatically infer the type from our Schema!

export default model<BlogPost>('BlogPost', blogPostSchema) //mongodb will automatically pluralize the naming from this model!