const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

const createTeacher = async (req, res) => {
    const { name, email, password, specialization } = req.body;

    try {
        // Get logged in admin's college
        const admin = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { collegeId: true }
        });

        if (!admin || !admin.collegeId) {
            return res.status(403).json({ message: "Admin not associated with a college" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User with TEACHER role
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'TEACHER',
                collegeId: admin.collegeId
            }
        });

        // Also create Teacher entry for metadata if needed, or just rely on User role.
        // For consistency with previous "Teacher" model which was separate:
        await prisma.teacher.create({
            data: {
                name,
                email,
                specialization,
                collegeId: admin.collegeId
            }
        });

        res.status(201).json({ message: "Teacher created successfully", user: { id: user.id, email: user.email } });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCollegeTeachers = async (req, res) => {
    try {
        const admin = await prisma.user.findUnique({ where: { id: req.userId } });
        if (!admin?.collegeId) return res.status(403).json({ message: "No college found" });

        const teachers = await prisma.user.findMany({
            where: {
                collegeId: admin.collegeId,
                role: 'TEACHER'
            },
            select: { id: true, name: true, email: true, createdAt: true }
        });
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getCollegeStudents = async (req, res) => {
    try {
        const admin = await prisma.user.findUnique({ where: { id: req.userId } });
        if (!admin?.collegeId) return res.status(403).json({ message: "No college found" });

        const students = await prisma.user.findMany({
            where: {
                collegeId: admin.collegeId,
                role: 'STUDENT'
            },
            select: { id: true, name: true, email: true, createdAt: true, course: true, semester: true }
        });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getCollegeStats = async (req, res) => {
    try {
        const admin = await prisma.user.findUnique({ where: { id: req.userId } });
        if (!admin?.collegeId) return res.status(403).json({ message: "No college found" });

        const [totalTeachers, totalStudents, recentTeachers, recentStudents] = await Promise.all([
            prisma.user.count({ where: { collegeId: admin.collegeId, role: 'TEACHER' } }),
            prisma.user.count({ where: { collegeId: admin.collegeId, role: 'STUDENT' } }),
            prisma.user.findMany({
                where: { collegeId: admin.collegeId, role: 'TEACHER' },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { id: true, name: true, email: true }
            }),
            prisma.user.findMany({
                where: { collegeId: admin.collegeId, role: 'STUDENT' },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { id: true, name: true, email: true }
            })
        ]);

        res.json({
            totalTeachers,
            totalStudents,
            recentTeachers,
            recentStudents
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { createTeacher, getCollegeTeachers, getCollegeStudents, getCollegeStats };
