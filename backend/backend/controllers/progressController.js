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
        const userId = req.userId;
        const subjects = await prisma.subject.findMany({
            where: { userId },
            include: { topics: true },
        });

        const totalTopics = subjects.reduce((acc, sub) => acc + sub.topics.length, 0);
        const completedTopics = subjects.reduce(
            (acc, sub) => acc + sub.topics.filter(t => t.isCompleted).length,
            0
        );

        const percentage = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

        // Fetch recent Pomodoro sessions for the past week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const sessions = await prisma.pomodoroSession.findMany({
            where: {
                userId,
                completedAt: { gte: oneWeekAgo }
            }
        });
        
        const totalFocusMinutesThisWeek = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
        const streakDays = totalFocusMinutesThisWeek > 0 ? 1 : 0; // simplified streak

        res.json({ totalTopics, completedTopics, percentage, totalFocusMinutesThisWeek, streakDays });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const logPomodoroSession = async (req, res) => {
    try {
        const userId = req.userId;
        const { durationMinutes } = req.body;
        
        const session = await prisma.pomodoroSession.create({
            data: {
                userId,
                durationMinutes: durationMinutes || 25
            }
        });
        
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { toggleTopicCompletion, getOverallProgress, logPomodoroSession };
