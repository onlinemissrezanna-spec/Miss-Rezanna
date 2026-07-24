const nodemailer = require('nodemailer');
const prisma = require('../config/db');

const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    }
});

const DEFAULT_FROM = process.env.SMTP_FROM || '"MISS REZANNA" <admin@missrezanna.com>';

const sendEmail = async (options) => {
    const mailOptions = {
        from: DEFAULT_FROM,
        to: options.email,
        subject: options.subject,
        html: options.html,
    };

    if (!SMTP_PASS) {
        console.log(`[EMAIL LOG] From: ${DEFAULT_FROM} -> To: ${options.email} | Subject: "${options.subject}"`);
        return true;
    }

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SENT] Successfully sent "${options.subject}" to ${options.email}`);
    } catch (err) {
        console.error(`[EMAIL ERROR] Failed to send email to ${options.email}:`, err.message);
    }
};

const sendVerificationEmail = async (email, token) => {
    const verifyUrl = `https://miss-rezanna-production.up.railway.app/api/v1/auth/verify-email?token=${token}`;
    const html = `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #ffffff; border: 1px solid #eae7e1;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 24px; letter-spacing: 0.15em; color: #111111; text-transform: uppercase; margin: 0;">MISS REZANNA</h1>
                <p style="font-size: 11px; color: #c3a167; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 5px;">Luxury Couture</p>
            </div>
            <h2 style="font-size: 18px; color: #111111; margin-bottom: 15px;">Verify Your Email Address</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #555555;">Thank you for registering with MISS REZANNA. Please verify your account by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" style="background: #111111; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; display: inline-block;">Verify Account</a>
            </div>
            <p style="font-size: 12px; color: #999999; text-align: center; margin-top: 30px;">© 2026 MISS REZANNA. All Rights Reserved.</p>
        </div>
    `;
    await sendEmail({ email, subject: 'Verify Your MISS REZANNA Account', html });
};

const sendPasswordResetEmail = async (email, token) => {
    const html = `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #ffffff; border: 1px solid #eae7e1;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 24px; letter-spacing: 0.15em; color: #111111; text-transform: uppercase; margin: 0;">MISS REZANNA</h1>
            </div>
            <h2 style="font-size: 18px; color: #111111;">Password Reset Request</h2>
            <p style="font-size: 14px; color: #555555;">Use the security code below to reset your password:</p>
            <div style="background: #f8f7f5; padding: 15px; text-align: center; font-size: 22px; font-weight: bold; letter-spacing: 0.2em; color: #111111; margin: 20px 0;">${token}</div>
        </div>
    `;
    await sendEmail({ email, subject: 'Reset Your Password - MISS REZANNA', html });
};

const sendWelcomeEmail = async (email, firstName) => {
    const html = `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #ffffff; border: 1px solid #eae7e1;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 24px; letter-spacing: 0.15em; color: #111111; text-transform: uppercase; margin: 0;">MISS REZANNA</h1>
                <p style="font-size: 11px; color: #c3a167; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 5px;">Welcome to Private Membership</p>
            </div>
            <h2 style="font-size: 18px; color: #111111;">Welcome, ${firstName}!</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #555555;">Thank you for becoming a member of MISS REZANNA. Your email (${email}) has been registered in our inner circle. You will receive private previews of new seasonal arrivals and exclusive collections.</p>
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://miss-rezanna-production.up.railway.app/index.html" style="background: #111111; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; display: inline-block;">Explore Collection</a>
            </div>
        </div>
    `;
    await sendEmail({ email, subject: 'Welcome to MISS REZANNA', html });
};

const sendOrderConfirmationEmail = async (email, orderNumber, orderDetails = {}) => {
    const grandTotal = orderDetails.grandTotal ? `₹ ${parseFloat(orderDetails.grandTotal).toLocaleString('en-IN')}` : '';
    const customerName = orderDetails.customerName || 'Valued Customer';
    
    const html = `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #ffffff; border: 1px solid #eae7e1;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 24px; letter-spacing: 0.15em; color: #111111; text-transform: uppercase; margin: 0;">MISS REZANNA</h1>
                <p style="font-size: 11px; color: #c3a167; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 5px;">Order Confirmation</p>
            </div>
            
            <h2 style="font-size: 18px; color: #111111; margin-bottom: 10px;">Thank You for Your Order, ${customerName}!</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #555555; margin-bottom: 20px;">
                We have received your order <strong>${orderNumber}</strong>. Our artisans are preparing your luxury garments for dispatch.
            </p>

            <div style="background: #f8f7f5; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
                <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #111111; margin-bottom: 10px;">Order Summary</div>
                <div style="display: flex; justify-content: space-between; font-size: 14px; color: #333333; margin-bottom: 5px;">
                    <span>Order Number:</span>
                    <strong>${orderNumber}</strong>
                </div>
                ${grandTotal ? `
                <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; color: #111111; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e0e0e0;">
                    <span>Total Amount Paid:</span>
                    <span>${grandTotal}</span>
                </div>` : ''}
            </div>

            <p style="font-size: 13px; color: #777777; line-height: 1.5;">If you have any questions regarding your delivery, feel free to reply directly to this email or contact us at <a href="mailto:admin@missrezanna.com" style="color: #c3a167;">admin@missrezanna.com</a>.</p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                <p style="font-size: 12px; color: #999999;">© 2026 MISS REZANNA. All Rights Reserved.</p>
            </div>
        </div>
    `;
    await sendEmail({ email, subject: `Order Confirmed: ${orderNumber} - MISS REZANNA`, html });
};

const broadcastNewProductEmail = async (product) => {
    try {
        // Retrieve all registered customer emails
        const users = await prisma.user.findMany({
            where: { status: 'active' },
            select: { email: true, firstName: true }
        });

        if (!users || users.length === 0) return;

        const productName = product.name || 'New Seasonal Arrival';
        const priceStr = product.price ? `₹ ${parseFloat(product.price).toLocaleString('en-IN')}` : '';
        const description = product.description || 'Crafted from pure ethically sourced silk with intricate handcrafted embroidery.';
        const productUrl = `https://miss-rezanna-production.up.railway.app/product.html?slug=${product.slug || ''}`;

        console.log(`[BROADCAST] Broadcasting new product "${productName}" to ${users.length} customer(s)...`);

        for (const user of users) {
            const html = `
                <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #ffffff; border: 1px solid #eae7e1;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="font-size: 24px; letter-spacing: 0.15em; color: #111111; text-transform: uppercase; margin: 0;">MISS REZANNA</h1>
                        <p style="font-size: 11px; color: #c3a167; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 5px;">New Arrival Announcement</p>
                    </div>

                    <h2 style="font-size: 20px; color: #111111; text-align: center; margin-bottom: 10px;">${productName}</h2>
                    ${priceStr ? `<p style="text-align: center; font-size: 18px; color: #c3a167; font-weight: bold; margin-bottom: 20px;">${priceStr}</p>` : ''}

                    <p style="font-size: 14px; line-height: 1.6; color: #555555; text-align: center; margin-bottom: 25px;">
                        ${description}
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${productUrl}" style="background: #111111; color: #ffffff; padding: 15px 32px; text-decoration: none; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; display: inline-block;">View & Order New Arrival</a>
                    </div>

                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                        <p style="font-size: 11px; color: #aaaaaa;">You are receiving this email because you are registered with MISS REZANNA.</p>
                    </div>
                </div>
            `;
            await sendEmail({ email: user.email, subject: `✨ New Arrival: ${productName} - MISS REZANNA`, html });
        }
    } catch (err) {
        console.error('Failed to broadcast new product email:', err.message);
    }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail, sendOrderConfirmationEmail, broadcastNewProductEmail };

