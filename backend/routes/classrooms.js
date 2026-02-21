const express = require('express');
const router = express.Router();
const {
    createClassroom,
    addClassSubjects,
    approveEnrollment,
    getClassroomDetails,
    joinClassroom,
    getStudentEnrollments,
    getMyClassrooms
} = require('../controllers/classroomController');
const authMiddleware = require('../middleware/authMiddleware');

// Teacher / Shared
router.post('/', authMiddleware, createClassroom);
router.get('/owned', authMiddleware, getMyClassrooms);
router.get('/:id', authMiddleware, getClassroomDetails);
router.post('/:classroomId/subjects', authMiddleware, addClassSubjects);
router.put('/enrollment', authMiddleware, approveEnrollment);

// Student
router.post('/join', authMiddleware, joinClassroom);
router.get('/my-enrollments', authMiddleware, getStudentEnrollments);

module.exports = router;
