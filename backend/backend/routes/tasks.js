const express = require('express');
const router = express.Router();
const { getTasks, createTask, toggleTask, deleteTask } = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getTasks);
router.post('/', createTask);
router.post('/:id/toggle', toggleTask);
router.delete('/:id', deleteTask);

module.exports = router;
