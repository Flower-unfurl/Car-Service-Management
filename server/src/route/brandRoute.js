const express = require('express');
const router = express.Router();
const brandController = require('../controller/brandController');

router.get('/', brandController.getAllBrands);
router.post('/', brandController.createBrand);
router.post('/seed', brandController.seedBrands);

module.exports = router;
