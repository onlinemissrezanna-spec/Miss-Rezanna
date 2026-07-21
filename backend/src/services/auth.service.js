const prisma = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('./email.service');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError');

const registerUser = async (data) => {
    const { firstName, lastName, email, phone, password } = data;
    
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if(existingEmail) throw new ApiError(400, 'Email already in use');

    if(phone) {
        const existingPhone = await prisma.user.findFirst({ where: { phone } });
        if(existingPhone) throw new ApiError(400, 'Phone already in use');
    }

    let role = await prisma.role.findUnique({ where: { name: 'Customer' } });
    if(!role) {
        role = await prisma.role.create({ data: { name: 'Customer' } });
    }

    const hashed = await hashPassword(password);
    
    const user = await prisma.user.create({
        data: { firstName, lastName, email, phone, password: hashed, roleId: role.id }
    });

    const token = crypto.randomBytes(32).toString('hex');
    await prisma.emailVerificationToken.create({
        data: {
            token,
            userId: user.id,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
    });

    await sendVerificationEmail(user.email, token);
    
    const { password: p, ...safeUser } = user;
    return safeUser;
};

const verifyEmail = async (token) => {
    const verifyToken = await prisma.emailVerificationToken.findUnique({ where: { token } });
    if(!verifyToken || verifyToken.expiresAt < new Date()) {
        throw new ApiError(400, 'Invalid or expired verification token');
    }

    const user = await prisma.user.update({
        where: { id: verifyToken.userId },
        data: { isVerified: true }
    });

    await prisma.emailVerificationToken.delete({ where: { id: verifyToken.id } });
    await sendWelcomeEmail(user.email, user.firstName);
    
    return true;
};

const loginUser = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
    if(!user) throw new ApiError(401, 'Invalid credentials');
    if(!user.isVerified) throw new ApiError(401, 'Please verify your email first');
    if(user.status !== 'active') throw new ApiError(401, 'Account inactive');

    const isMatch = await comparePassword(password, user.password);
    if(!isMatch) throw new ApiError(401, 'Invalid credentials');

    const accessToken = generateToken({ id: user.id, roleId: user.roleId });
    const refreshTokenStr = crypto.randomBytes(40).toString('hex');

    await prisma.refreshToken.create({
        data: {
            token: refreshTokenStr,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
    });

    const { password: p, ...safeUser } = user;
    return { accessToken, refreshToken: refreshTokenStr, user: safeUser };
};

const refresh = async (oldToken) => {
    const rt = await prisma.refreshToken.findUnique({ where: { token: oldToken }, include: { user: true } });
    if(!rt || rt.expiresAt < new Date()) throw new ApiError(401, 'Invalid or expired refresh token');

    const accessToken = generateToken({ id: rt.user.id, roleId: rt.user.roleId });
    const newRefreshToken = crypto.randomBytes(40).toString('hex');

    await prisma.refreshToken.update({
        where: { id: rt.id },
        data: {
            token: newRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
    });

    return { accessToken, refreshToken: newRefreshToken };
};

const logout = async (token) => {
    if (token) {
        await prisma.refreshToken.deleteMany({ where: { token } });
    }
    return true;
};

const forgotPassword = async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if(!user) return true; // Do not leak user existence

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await prisma.passwordResetToken.create({
        data: {
            token: hashedToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        }
    });

    await sendPasswordResetEmail(user.email, resetToken);
    return true;
};

const resetPassword = async (token, newPassword) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token: hashedToken } });
    if(!resetToken || resetToken.expiresAt < new Date()) {
        throw new ApiError(400, 'Invalid or expired reset token');
    }

    const hashedPwd = await hashPassword(newPassword);

    await prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPwd }
    });

    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
    return true;
};

const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if(!user) throw new ApiError(404, 'User not found');

    const isMatch = await comparePassword(currentPassword, user.password);
    if(!isMatch) throw new ApiError(401, 'Current password is incorrect');

    const hashedPwd = await hashPassword(newPassword);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPwd }
    });

    return true;
};

module.exports = { registerUser, verifyEmail, loginUser, refresh, logout, forgotPassword, resetPassword, changePassword };
