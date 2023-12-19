import * as yup from 'yup'
import { imageFileSchema } from '../utils/validation'

const usernameSchema = yup
    .string()
    .max(20)
    .matches(/^[a-zA-Z0-9_]*$/)

const emailSchema = yup.string().email()

const passwordSchema = yup
    .string()
    .matches(/^(?!.* )/)
    .min(8)

export const signUpRequestSchema = yup.object({
    body: yup.object({
        username: usernameSchema.required(),
        email: emailSchema.required(),
        password: passwordSchema.required(),
        verificationCode: yup.string().required(), //we add a new field that is required for our signUp endpoint!
    }),
})

export type signUpBody = yup.InferType<typeof signUpRequestSchema>['body'] //this only makes sure that we only extract the body!

export const updateUserRequestSchema = yup.object({
    body: yup.object({
        username: usernameSchema,
        displayName: yup
            .string()
            .max(20, 'Display name cannot exceed 20 characters'),
        about: yup.string().max(160, 'About cannot exceed 160 characters'),
    }),
    file: imageFileSchema,
})

export type updateUserBody = yup.InferType<
    typeof updateUserRequestSchema
>['body'] //this only makes sure that we only extract the body!

export const verificationCodeRequestSchema = yup.object({
    body: yup.object({
        email: emailSchema.required(),
    }),
})

export type RequestVerificationCodeBody = yup.InferType<
    typeof verificationCodeRequestSchema
>['body']
