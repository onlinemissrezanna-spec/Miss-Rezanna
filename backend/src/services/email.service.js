const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
        user: process.env.SMTP_USER || 'test',
        pass: process.env.SMTP_PASS || 'test',
    }
});

const sendEmail = async (options) => {
    const mailOptions = {
        from: process.env.SMTP_FROM || 'support@missrezanna.com',
        to: options.email,
        subject: options.subject,
        html: options.html,
    };
    
    if(!process.env.SMTP_USER || process.env.SMTP_USER === 'test') {
        console.log('[DEV MOCK EMAIL]', mailOptions.subject, '->', options.email);
        return true;
    }

    await transporter.sendMail(mailOptions);
};

const sendVerificationEmail = async (email, token) => {
    const verifyUrl = `http://localhost:5000/api/v1/auth/verify-email?token=${token}`;
    const html = `
        <h2>Welcome to MISS REZANNA</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verifyUrl}">Verify Email</a>
    `;
    await sendEmail({ email, subject: 'Verify Your Email', html });
};

const sendPasswordResetEmail = async (email, token) => {
    const html = `
        <h2>Password Reset</h2>
        <p>Use the following token to reset your password:</p>
        <h3>${token}</h3>
    `;
    await sendEmail({ email, subject: 'Password Reset', html });
};

const sendWelcomeEmail = async (email, firstName) => {
    const html = `
        <h2>Welcome ${firstName}!</h2>
        <p>Thank you for joining the MISS REZANNA family. Your account is now fully verified.</p>
    `;
    await sendEmail({ email, subject: 'Welcome to MISS REZANNA', html });
};

const sendOrderConfirmationEmail = async (email, orderNumber, invoicePath) => {
    const html = `
        <h2>Order Confirmed!</h2>
        <p>Thank you for your purchase. Your order <strong>${orderNumber}</strong> has been confirmed.</p>
        <p>Your invoice is attached to this email.</p>
    `;
    
    // In production, you would attach the PDF using nodemailer attachments array
    // attachments: [{ filename: 'invoice.pdf', path: invoicePath }]
    
    await sendEmail({ email, subject: `Order Confirmed - ${orderNumber}`, html });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail, sendOrderConfirmationEmail };
