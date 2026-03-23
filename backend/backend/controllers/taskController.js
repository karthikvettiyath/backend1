const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTasks = async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTask = async (req, res) => {
    try {
        const { title, description, dueDate } = req.body;
        const task = await prisma.task.create({
            data: {
                title,
                description,
                dueDate: dueDate ? new Date(dueDate) : null,
                userId: req.userId,
            },
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await prisma.task.findUnique({ where: { id: parseInt(id) } });
        
        if (!task || task.userId !== req.userId) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const updatedTask = await prisma.task.update({
            where: { id: parseInt(id) },
            data: { isCompleted: !task.isCompleted },
        });
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await prisma.task.findUnique({ where: { id: parseInt(id) } });

        if (!task || task.userId !== req.userId) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await prisma.task.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTasks, createTask, toggleTask, deleteTask };
