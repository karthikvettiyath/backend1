const express = require('express');
const { generatePlan, getPlan } = require('../controllers/plannerController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/generate', generatePlan);
router.get('/', getPlan);

module.exports = router;
