import * as yup from 'yup'

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
    }),
})

export type signUpBody = yup.InferType<typeof signUpRequestSchema>['body'] //this only makes sure that we only extract the body!


