const express = require('express');
const router = express.Router();
const { generateAIStudyPlan } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/generate-plan', generateAIStudyPlan);

module.exports = router;
