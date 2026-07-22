const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/category.controller');
const validate = require('../../middlewares/validate');
const { protect } = require('../../middlewares/auth.middleware');
const { adminOnly } = require('../../middlewares/admin.middleware');
const { createCategorySchema, updateCategorySchema } = require('../../validators/category.validator');

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:identifier', categoryController.getCategory);

// Admin only routes
router.use(protect);
router.use(adminOnly);

router.post('/', validate(createCategorySchema), categoryController.createCategory);
router.put('/:id', validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
