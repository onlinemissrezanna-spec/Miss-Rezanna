const express = require('express');
const router = express.Router();
const addressController = require('../../controllers/address.controller');
const validate = require('../../middlewares/validate');
const { protect } = require('../../middlewares/auth.middleware');
const { createAddressSchema, updateAddressSchema } = require('../../validators/address.validator');

router.use(protect);

router.get('/', addressController.getAddresses);
router.post('/', validate(createAddressSchema), addressController.createAddress);
router.get('/:id', addressController.getAddress);
router.put('/:id', validate(updateAddressSchema), addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.patch('/:id/default', addressController.setDefaultAddress);

module.exports = router;
