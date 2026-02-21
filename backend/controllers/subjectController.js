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
        const { name, description, difficulty, priority, topics } = req.body;
        const subject = await prisma.subject.create({
            data: {
                name,
                description,
                difficulty: Number(difficulty),
                priority: Number(priority),
                userId: req.userId,
                topics: {
                    create: topics ? topics.map(t => ({ name: t })) : [],
                },
            },
            include: { topics: true },
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
        await prisma.subject.delete({ where: { id: Number(id) } });
        res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSubjects, addSubject, updateSubject, deleteSubject };
