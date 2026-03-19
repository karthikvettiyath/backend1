const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getSubjects = async (req, res) => {
    try {
        const subjects = await prisma.subject.findMany({
            where: { userId: req.userId },
            include: { topics: true, exams: true },
        });
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addSubject = async (req, res) => {
    try {
        const { name, description, difficulty, priority, exams, topics } = req.body;
        const subject = await prisma.subject.create({
            data: {
                name,
                description,
                difficulty: Number(difficulty),
                priority: Number(priority),
                userId: req.userId,
                exams: exams && exams.length > 0 ? {
                    create: exams.map(e => ({ date: new Date(e.date) }))
                } : undefined,
                topics: topics && topics.length > 0 ? {
                    create: topics.map(t => typeof t === 'string' ? { name: t } : { name: t.name, difficulty: Number(t.difficulty || 3) })
                } : undefined
            },
            include: { topics: true, exams: true },
        });
        res.status(201).json(subject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, difficulty, priority } = req.body;
        const subject = await prisma.subject.update({
            where: { id: Number(id) },
            data: { name, description, difficulty: Number(difficulty), priority: Number(priority) },
        });
        res.json(subject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        
        await prisma.topic.deleteMany({ where: { subjectId: Number(id) } });
        await prisma.exam.deleteMany({ where: { subjectId: Number(id) } });
        await prisma.studySession.deleteMany({ where: { subjectId: Number(id) } });
        
        await prisma.subject.delete({ where: { id: Number(id) } });
        res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, difficulty } = req.body;
        
        const topic = await prisma.topic.create({
            data: {
                name,
                difficulty: difficulty ? Number(difficulty) : 3,
                subjectId: Number(id)
            }
        });
        res.status(201).json(topic);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleTopicStatus = async (req, res) => {
    try {
        const { topicId } = req.params;
        
        const topic = await prisma.topic.findUnique({ where: { id: Number(topicId) } });
        if (!topic) return res.status(404).json({ message: 'Topic not found' });
        
        const updatedTopic = await prisma.topic.update({
            where: { id: Number(topicId) },
            data: { isCompleted: !topic.isCompleted }
        });
        
        res.json(updatedTopic);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSubjects, addSubject, updateSubject, deleteSubject, addTopic, toggleTopicStatus };
