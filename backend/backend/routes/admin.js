const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, updateUserRole, getRecentActivity } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
};

router.get('/stats', authMiddleware, isAdmin, getStats);
router.get('/users', authMiddleware, isAdmin, getAllUsers);
router.get('/activity', authMiddleware, isAdmin, getRecentActivity);
router.post('/role/:id', authMiddleware, isAdmin, updateUserRole);

module.exports = router;
