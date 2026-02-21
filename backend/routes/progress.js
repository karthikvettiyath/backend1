const express = require('express');
const { toggleTopicCompletion, getOverallProgress } = require('../controllers/progressController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getOverallProgress);
router.put('/topic/:id', toggleTopicCompletion);

module.exports = router;
