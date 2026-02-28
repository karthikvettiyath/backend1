const express = require('express');
const router = express.Router();
const {
    createTeacher,
    getCollegeTeachers,
    getCollegeStudents,
    getCollegeStats,
    createCollegeClassroom,
    getCollegeClassrooms,
    addClassSubject
} = require('../controllers/collegeAdminController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/teachers', authMiddleware, createTeacher);
router.get('/teachers', authMiddleware, getCollegeTeachers);
router.get('/students', authMiddleware, getCollegeStudents);
router.get('/stats', authMiddleware, getCollegeStats);
router.post('/classrooms', authMiddleware, createCollegeClassroom);
router.get('/classrooms', authMiddleware, getCollegeClassrooms);
router.post('/classrooms/:classroomId/subjects', authMiddleware, addClassSubject);

module.exports = router;
