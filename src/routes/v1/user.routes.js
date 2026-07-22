const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user.controller');
const { protect } = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload.middleware');
const validate = require('../../middlewares/validate');
const { updateProfileSchema } = require('../../validators/user.validator');

router.use(protect); // All user routes are protected by JWT

router.get('/me', userController.getMe);
router.put('/profile', upload.single('profileImage'), validate(updateProfileSchema), userController.updateProfile);

module.exports = router;
