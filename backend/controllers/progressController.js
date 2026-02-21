const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const toggleTopicCompletion = async (req, res) => {
    try {
        const { id } = req.params;
        const { isCompleted } = req.body;
        const topic = await prisma.topic.update({
            where: { id: Number(id) },
            data: { isCompleted: Boolean(isCompleted) },
        });
        res.json(topic);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOverallProgress = async (req, res) => {
    try {
        const subjects = await prisma.subject.findMany({
            where: { userId: req.userId },
            include: { topics: true },
        });

        const totalTopics = subjects.reduce((acc, sub) => acc + sub.topics.length, 0);
        const completedTopics = subjects.reduce(
            (acc, sub) => acc + sub.topics.filter(t => t.isCompleted).length,
            0
        );

        const percentage = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

        res.json({ totalTopics, completedTopics, percentage });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { toggleTopicCompletion, getOverallProgress };
