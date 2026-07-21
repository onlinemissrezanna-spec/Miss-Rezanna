const express = require('express');
const router = express.Router();
const productController = require('../../controllers/product.controller');
const validate = require('../../middlewares/validate');
const { protect } = require('../../middlewares/auth.middleware');
const { adminOnly } = require('../../middlewares/admin.middleware');
const upload = require('../../middlewares/upload.middleware');
const { createProductSchema, updateProductSchema } = require('../../validators/product.validator');

// Public routes (Search, Filter, Pagination)
router.get('/', productController.getProducts);
router.get('/:identifier', productController.getProduct);

// Admin only routes
router.use(protect);
router.use(adminOnly);

// Supports up to 10 images uploaded at once
router.post('/', upload.array('images', 10), validate(createProductSchema), productController.createProduct);
router.put('/:id', upload.array('images', 10), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
