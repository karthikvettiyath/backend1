const express = require('express');
const router = express.Router();
const { getColleges, addCollege } = require('../controllers/collegeController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getColleges);
router.post('/', authMiddleware, addCollege);

module.exports = router;
