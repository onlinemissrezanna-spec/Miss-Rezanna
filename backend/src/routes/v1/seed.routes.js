const express = require('express');
const router = express.Router();
const seedController = require('../../controllers/seed.controller');

router.get('/', seedController.seedDatabase);
router.get('/init', seedController.initDatabase);

module.exports = router;
