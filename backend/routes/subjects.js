const express = require('express');
const subjectController = require('../controllers/subjectController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', subjectController.getSubjects);
router.post('/', subjectController.addSubject);
router.put('/:id', subjectController.updateSubject);
router.delete('/:id', subjectController.deleteSubject);

router.post('/:id/topics', subjectController.addTopic);
router.post('/topics/:topicId/toggle', subjectController.toggleTopicStatus);

module.exports = router;
