const express = require('express');
const { getExams, addExam, deleteExam } = require('../controllers/examController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getExams);
router.post('/', addExam);
router.delete('/:id', deleteExam);

module.exports = router;
