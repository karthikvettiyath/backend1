const express = require('express');
const { getInsights } = require('../controllers/insightsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getInsights);

module.exports = router;
