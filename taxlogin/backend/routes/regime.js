const express = require('express');
const router = express.Router();
const { recommendRegime } = require('../controllers/regimeController');

router.post('/', recommendRegime);

module.exports = router;
