import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  service: 'gmail',
  secure:false,
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD,
  },
  connectionTimeout: 5 * 60 * 1000, // 5 minutes
  greetingTimeout: 30 * 1000, // 30 seconds
  socketTimeout: 60 * 1000, // 1 minute
})

const emailService = {
  sendPasswordResetEmail: async (email: string, resetCode: string) => {
    console.log("DEBUG: Sending email to", email);
    await transporter.sendMail({
      from: process.env.GMAIL_USERNAME,
      to: email,
      subject: 'Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Reset Your Password</h2>
          <p>Your password reset code is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${resetCode}
          </div>
          <p>Enter this code on the password reset page.</p>
          <p><strong>This code expires in 10 minutes.</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    })
  },
}

export default emailService
