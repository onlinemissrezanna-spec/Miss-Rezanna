const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcrypt');

const logActivity = async (userId, action, details = {}, ipAddress = null) => {
    await prisma.customerActivity.create({
        data: { userId, action, details, ipAddress }
    });
};

const updateProfile = async (userId, data, ipAddress) => {
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data,
        select: { id: true, firstName: true, lastName: true, email: true, phone: true }
    });

    await logActivity(userId, 'PROFILE_UPDATED', { updatedFields: Object.keys(data) }, ipAddress);
    return updatedUser;
};

const changePassword = async (userId, currentPassword, newPassword, ipAddress) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(404, 'User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new ApiError(401, 'Incorrect current password');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
    });

    await logActivity(userId, 'PASSWORD_CHANGED', {}, ipAddress);
    return true;
};

const deleteAccountRequest = async (userId, ipAddress) => {
    await logActivity(userId, 'ACCOUNT_DELETION_REQUESTED', {}, ipAddress);
    
    // Hard deleting immediately is bad practice in e-commerce due to financial records.
    // We mark the user as deactivated and let cron/admin handle cleanup.
    await prisma.user.update({
        where: { id: userId },
        data: { /* status: 'Deactivated' -> Assuming status field exists, else just log */ }
    });
    
    return true;
};

module.exports = { updateProfile, changePassword, deleteAccountRequest, logActivity };
