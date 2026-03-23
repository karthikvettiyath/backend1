const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getStats = async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalSubjects = await prisma.subject.count();
        const totalSessions = await prisma.studySession.count();
        
        // Find most popular subjects
        const popularSubjects = await prisma.subject.groupBy({
            by: ['name'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 5
        });

        res.json({
            totalUsers,
            totalSubjects,
            totalSessions,
            popularSubjects: popularSubjects.map(s => ({ name: s.name, count: s._count.id }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                course: true,
                createdAt: true,
                _count: { select: { subjects: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRecentActivity = async (req, res) => {
    try {
        const recentUsers = await prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, email: true, createdAt: true }
        });

        const recentSessions = await prisma.studySession.findMany({
            take: 5,
            orderBy: { startTime: 'desc' },
            include: { subject: { select: { name: true, user: { select: { name: true } } } } }
        });

        res.json({ recentUsers, recentSessions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    try {
        if (!['admin', 'student'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { role },
            select: { id: true, name: true, email: true, role: true }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getStats, getAllUsers, updateUserRole, getRecentActivity };
