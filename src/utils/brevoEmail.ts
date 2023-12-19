import { createTransport } from 'nodemailer'
import env from '../env'

const transporter = createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        //this auth would authorize us to use the brevo's service of sending emails
        user: 'bryanhadinata76@gmail.com',
        pass: env.BREVO_SMTP_PASSWORD,
    },
})

export async function sendVerificationCode(
    toEmail: string,
    verificationCode: string
) {
    await transporter.sendMail({
        from: 'noreply@bryanhadinata.com',
        to: toEmail,
        subject: 'Your verification code',
        html: `<p>This is your verification code. It will expire in 10 minutes.</p><strong>${verificationCode}</strong>`,
    })
}

export async function sendPasswordResetCode(
    toEmail: string,
    verificationCode: string
) {
    await transporter.sendMail({
        from: 'noreply@bryanhadinata.com',
        to: toEmail,
        subject: 'Reset your password',
        html: `<p>A password reset request has been sent for this account.
        Use this verification code to reset your password.
        The code would expire in 10 minutes</p>
        <p><strong>${verificationCode}</strong></p>
        If you didn't request a password reset, ignore this email.`,
    })
}
