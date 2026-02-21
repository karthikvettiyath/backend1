const express = require('express');
const router = express.Router();
const { getTeachers, addTeacher } = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getTeachers);
router.post('/', authMiddleware, addTeacher);

module.exports = router;
