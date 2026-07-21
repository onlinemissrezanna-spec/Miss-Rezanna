const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

const getUserProfile = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, firstName: true, lastName: true, email: true, phone: true, isVerified: true, role: true }
    });
    if(!user) throw new ApiError(404, 'User not found');
    return user;
};

const updateProfile = async (id, data, photoPath) => {
    const updateData = { ...data };
    
    // Check if phone uniqueness is violated during update
    if(updateData.phone) {
        const existing = await prisma.user.findFirst({ where: { phone: updateData.phone, id: { not: id } } });
        if(existing) throw new ApiError(400, 'Phone already in use by another account');
    }

    const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: { id: true, firstName: true, lastName: true, email: true, phone: true }
    });
    
    return { ...user, uploadedPhoto: photoPath || null };
};

module.exports = { getUserProfile, updateProfile };
