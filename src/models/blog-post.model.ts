import { InferSchemaType, Schema, model } from 'mongoose'

const BlogPostModel = new Schema(
    {
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        title: { type: String, required: true },
        summary: { type: String, required: true },
        body: { type: String, required: true },
        blogImage: { type: String, required: true },
        author: { type: Schema.ObjectId, ref: 'User', required: true }, //this tells mongoose that this field is a reference to a another model!
        //why do we use a strringg? for referencing the user? cuz that is what we write when declaring user model!

        //when we declare an object id in the schema it self, we have to use mongoose.Schema.Object.id
        // the docs didn't really explain why tho ;-;
    },
    {
        timestamps: true, //this is mongoose feature! mongoose will automatically add createdAt and updatedAt timestamps to our schema!
    }
)

type BlogPost = InferSchemaType<typeof BlogPostModel> //InferSchemaType will automatically infer the type from our Schema!

export default model<BlogPost>('BlogPost', BlogPostModel) //mongodb will automatically pluralize the naming from this model!
