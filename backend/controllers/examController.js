const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getExams = async (req, res) => {
    try {
        const exams = await prisma.exam.findMany({
            where: { subject: { userId: req.userId } },
            include: { subject: true },
        });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addExam = async (req, res) => {
    try {
        const { date, subjectId } = req.body;
        const exam = await prisma.exam.create({
            data: {
                date: new Date(date),
                subjectId: Number(subjectId),
            },
        });
        res.status(201).json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteExam = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.exam.delete({ where: { id: Number(id) } });
        res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getExams, addExam, deleteExam };
