const express = require('express');
const router = express.Router();
const { createCollegeWithAdmin, getAllColleges, getAdminStats } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check if user is ADMIN
const requireAdmin = async (req, res, next) => {
    // Ideally fetch user and check role. For now assuming authMiddleware sets userId.
    // In production, verify role from DB here.
    next();
};

router.post('/colleges', authMiddleware, createCollegeWithAdmin);
router.get('/colleges', authMiddleware, getAllColleges);
router.get('/stats', authMiddleware, getAdminStats);

module.exports = router;
