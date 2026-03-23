const express = require('express');
const { toggleTopicCompletion, getOverallProgress, logPomodoroSession } = require('../controllers/progressController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getOverallProgress);
router.put('/topic/:id', toggleTopicCompletion);
router.post('/pomodoro', logPomodoroSession);

module.exports = router;
