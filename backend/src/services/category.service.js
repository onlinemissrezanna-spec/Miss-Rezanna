const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const { slugify } = require('../utils/slugify');

const createCategory = async (data) => {
    let slug = slugify(data.name);
    // Ensure slug is unique
    const existing = await prisma.category.findUnique({ where: { slug } });
    if(existing) {
        slug = `${slug}-${Date.now()}`;
    }

    return await prisma.category.create({
        data: {
            ...data,
            slug
        }
    });
};

const getCategories = async () => {
    return await prisma.category.findMany({
        orderBy: { displayOrder: 'asc' }
    });
};

const getCategoryByIdOrSlug = async (identifier) => {
    const isId = !isNaN(identifier) && !identifier.includes('-');
    const category = await prisma.category.findFirst({
        where: isId ? { id: parseInt(identifier) } : { slug: identifier },
        include: { products: true }
    });

    if(!category) throw new ApiError(404, 'Category not found');
    return category;
};

const updateCategory = async (id, data) => {
    const category = await prisma.category.findUnique({ where: { id } });
    if(!category) throw new ApiError(404, 'Category not found');

    const updateData = { ...data };
    if(data.name && data.name !== category.name) {
        let newSlug = slugify(data.name);
        const existing = await prisma.category.findUnique({ where: { slug: newSlug } });
        if(existing && existing.id !== id) {
            newSlug = `${newSlug}-${Date.now()}`;
        }
        updateData.slug = newSlug;
    }

    return await prisma.category.update({
        where: { id },
        data: updateData
    });
};

const deleteCategory = async (id) => {
    const category = await prisma.category.findUnique({ 
        where: { id },
        include: { _count: { select: { products: true } } }
    });
    
    if(!category) throw new ApiError(404, 'Category not found');
    if(category._count.products > 0) throw new ApiError(400, 'Cannot delete category with attached products. Delete products first.');

    await prisma.category.delete({ where: { id } });
    return true;
};

module.exports = { createCategory, getCategories, getCategoryByIdOrSlug, updateCategory, deleteCategory };
