const express = require('express');
const router = express.Router();
const { generateAIStudyPlan, chatWithAI } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/generate-plan', generateAIStudyPlan);
router.post('/chat', chatWithAI);

module.exports = router;
