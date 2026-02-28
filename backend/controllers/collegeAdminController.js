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

const createCollegeClassroom = async (req, res) => {
    const { name, teacherId } = req.body;
    try {
        const admin = await prisma.user.findUnique({ where: { id: req.userId } });
        if (!admin?.collegeId) return res.status(403).json({ message: "No college found" });

        const teacher = await prisma.user.findFirst({
            where: { id: parseInt(teacherId), collegeId: admin.collegeId, role: 'TEACHER' }
        });

        if (!teacher) return res.status(404).json({ message: "Teacher not found or doesn't belong to your college" });

        const crypto = require('crypto');
        const code = crypto.randomBytes(3).toString('hex').toUpperCase();

        const classroom = await prisma.classroom.create({
            data: {
                name,
                code,
                teacherId: teacher.id
            }
        });
        res.status(201).json(classroom);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getCollegeClassrooms = async (req, res) => {
    try {
        const admin = await prisma.user.findUnique({ where: { id: req.userId } });
        if (!admin?.collegeId) return res.status(403).json({ message: "No college found" });

        const classrooms = await prisma.classroom.findMany({
            where: {
                teacher: { collegeId: admin.collegeId }
            },
            include: {
                teacher: { select: { name: true, email: true } },
                subjects: {
                    include: {
                        teacher: { select: { name: true, email: true } }
                    }
                },
                _count: {
                    select: { students: { where: { status: 'APPROVED' } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formatted = classrooms.map(c => ({
            id: c.id,
            name: c.name,
            code: c.code,
            teacherName: c.teacher?.name || 'Unknown',
            enrolledCount: c._count.students,
            subjects: c.subjects.map(s => ({
                id: s.id,
                name: s.name,
                description: s.description,
                teacherName: s.teacher?.name || 'Unassigned',
                teacherId: s.teacherId
            })),
            createdAt: c.createdAt
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const addClassSubject = async (req, res) => {
    const { classroomId } = req.params;
    const { name, description, teacherId } = req.body;

    try {
        const admin = await prisma.user.findUnique({ where: { id: req.userId } });
        if (!admin?.collegeId) return res.status(403).json({ message: "No college found" });

        // Ensure classroom belongs to this college
        const classroom = await prisma.classroom.findFirst({
            where: {
                id: parseInt(classroomId),
                teacher: { collegeId: admin.collegeId }
            }
        });

        if (!classroom) return res.status(404).json({ message: "Classroom not found" });

        // Validate teacher if provided
        if (teacherId) {
            const validTeacher = await prisma.user.findFirst({
                where: { id: parseInt(teacherId), collegeId: admin.collegeId, role: 'TEACHER' }
            });
            if (!validTeacher) return res.status(400).json({ message: "Invalid teacher assignment" });
        }

        const newSubject = await prisma.classSubject.create({
            data: {
                name,
                description,
                classroomId: parseInt(classroomId),
                teacherId: teacherId ? parseInt(teacherId) : null
            },
            include: {
                teacher: { select: { name: true, email: true } }
            }
        });

        res.status(201).json({
            id: newSubject.id,
            name: newSubject.name,
            description: newSubject.description,
            teacherName: newSubject.teacher?.name || 'Unassigned',
            teacherId: newSubject.teacherId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { createTeacher, getCollegeTeachers, getCollegeStudents, getCollegeStats, createCollegeClassroom, getCollegeClassrooms, addClassSubject };
