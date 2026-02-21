const express = require('express');
const router = express.Router();
const { createTeacher, getCollegeTeachers, getCollegeStudents, getCollegeStats } = require('../controllers/collegeAdminController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/teachers', authMiddleware, createTeacher);
router.get('/teachers', authMiddleware, getCollegeTeachers);
router.get('/students', authMiddleware, getCollegeStudents);
router.get('/stats', authMiddleware, getCollegeStats);

module.exports = router;
