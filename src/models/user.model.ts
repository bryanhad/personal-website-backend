import { InferSchemaType, Schema, model } from 'mongoose'

const userSchema = new Schema(
    {
        username: { type: String, unique: true, sparse: true }, //sparse is needed cuz it just makes so that 'undefined' will not be considered as a username! this allows multiple users to have undefined username! whilst still maintaining the unique constraint
        email: { type: String, unique: true, sparse: true, select: false }, //select false just means when we fetch the user witht he schema, this email field won't be appended to the result. why? well an email is a bit of a sensitive data right? so we set the select to false by default, but we can still explicitly add it if we rlly need it later
        displayName: { type: String },
        about: { type: String },
        profilePicUrl: { type: String },
        password: { type: String, select: false }, //is not required cuz u don't rlly need a password if u signed up with a 3rd party provider eh?
        googleId: { type: String, unique: true, sparse: true, select: false }, //would be filled if the user signed up with a google provider
        githubId: { type: String, unique: true, sparse: true, select: false },
    },
    { timestamps: true }
)

// but with that current schema we have a problem!
// currently, the amil, googleId, and githubId, is not required!
// but a user must atleast have one of those! how can we ensure that?

userSchema.pre('validate', function (next) {
    //we can make a mongoose hook. this func will run everytime we make a new user or make changes to the record.
    // and we also have to declare the callback with 'function' and not with an arrow func.. cuz if u use arrow func, the 'this' will lose it's scope
    if (!this.email && !this.googleId && !this.githubId) {
        return next(
            new Error('User must have an email or a social provider ID')
        )
    }
    next()
})

type User = InferSchemaType<typeof userSchema>

export default model<User>('User', userSchema)
