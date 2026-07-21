const express = require('express');
const router = express.Router();

const { protect } = require('../../middlewares/auth.middleware');
const { adminOnly } = require('../../middlewares/admin.middleware');
const { requirePermission } = require('../../middlewares/rbac.middleware');

const dashboardController = require('../../controllers/admin-dashboard.controller');
const adminProductController = require('../../controllers/admin-product.controller');
const settingsController = require('../../controllers/admin-settings.controller');

// All admin routes require authentication and basic Admin role
router.use(protect);
router.use(adminOnly);

// ----------------------------------------------------
// Dashboard
// ----------------------------------------------------
router.get('/dashboard', requirePermission('dashboard', 'read'), dashboardController.getDashboard);

// ----------------------------------------------------
// Product & Inventory Bulk Operations
// ----------------------------------------------------
router.post('/products/bulk-status', requirePermission('products', 'write'), adminProductController.bulkUpdateStatus);
router.post('/products/bulk-delete', requirePermission('products', 'delete'), adminProductController.bulkDelete);
router.post('/inventory/adjust', requirePermission('inventory', 'write'), adminProductController.adjustInventory);

// ----------------------------------------------------
// Settings
// ----------------------------------------------------
router.get('/settings', requirePermission('settings', 'read'), settingsController.getSettings);
router.put('/settings', requirePermission('settings', 'write'), settingsController.updateSetting);

module.exports = router;
