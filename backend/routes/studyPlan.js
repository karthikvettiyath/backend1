const express = require('express');
const router = express.Router();
const { generateStudyPlan } = require('../controllers/studyPlanController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', generateStudyPlan);

module.exports = router;
