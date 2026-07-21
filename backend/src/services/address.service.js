const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

const createAddress = async (userId, data) => {
    if (data.isDefault) {
        await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }

    return await prisma.address.create({
        data: { ...data, userId }
    });
};

const getAddresses = async (userId) => {
    return await prisma.address.findMany({ where: { userId }, orderBy: { isDefault: 'desc' } });
};

const getAddressById = async (userId, id) => {
    const address = await prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== userId) throw new ApiError(404, 'Address not found');
    return address;
};

const updateAddress = async (userId, id, data) => {
    const address = await getAddressById(userId, id);

    if (data.isDefault && !address.isDefault) {
        await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }

    return await prisma.address.update({
        where: { id },
        data
    });
};

const deleteAddress = async (userId, id) => {
    await getAddressById(userId, id);
    await prisma.address.delete({ where: { id } });
    return true;
};

const setDefaultAddress = async (userId, id) => {
    await getAddressById(userId, id);
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    
    return await prisma.address.update({
        where: { id },
        data: { isDefault: true }
    });
};

module.exports = { createAddress, getAddresses, getAddressById, updateAddress, deleteAddress, setDefaultAddress };
