import { InferSchemaType, Schema, model } from 'mongoose'

const emailVerificationTokenSchema = new Schema({
    email: { type: String, required: true },
    verificationCode: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '10m' }, // we can make each record expire by explicitly add the createdAt manually and set the default to now, but add in the expires key.. this is one of MongoDB feature btw
})

export type EmailVerificationToken = InferSchemaType<typeof emailVerificationTokenSchema>

export default model<EmailVerificationToken>('EmailVerificationToken', emailVerificationTokenSchema)