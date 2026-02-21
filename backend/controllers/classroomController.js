const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

// --- TEACHER ACTIONS ---

const createClassroom = async (req, res) => {
    const { name } = req.body;
    try {
        const code = crypto.randomBytes(3).toString('hex').toUpperCase(); // Generate 6-char code
        const classroom = await prisma.classroom.create({
            data: {
                name,
                code,
                teacherId: req.userId
            }
        });
        res.status(201).json(classroom);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addClassSubjects = async (req, res) => {
    const { classroomId } = req.params;
    const { subjects } = req.body; // Array of { name, description }

    try {
        const createdSubjects = await Promise.all(subjects.map(async (sub) => {
            return await prisma.classSubject.create({
                data: {
                    name: sub.name,
                    description: sub.description,
                    classroomId: parseInt(classroomId)
                }
            });
        }));
        res.json(createdSubjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const approveEnrollment = async (req, res) => {
    const { classroomId, studentId } = req.body;
    try {
        // 1. Update enrollment status
        const enrollment = await prisma.enrollment.updateMany({
            where: {
                classroomId: parseInt(classroomId),
                studentId: parseInt(studentId)
            },
            data: { status: 'APPROVED' }
        });

        if (enrollment.count === 0) return res.status(404).json({ message: "Enrollment not found" });

        // 2. Copy class subjects to student's personal subjects
        const classSubjects = await prisma.classSubject.findMany({
            where: { classroomId: parseInt(classroomId) }
        });

        for (const sub of classSubjects) {
            await prisma.subject.create({
                data: {
                    name: sub.name,
                    description: sub.description,
                    userId: parseInt(studentId),
                    difficulty: 3, // Default difficulty
                    priority: 3
                }
            });
        }

        res.json({ message: "Student approved and subjects synced." });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getClassroomDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const classroom = await prisma.classroom.findUnique({
            where: { id: parseInt(id) },
            include: {
                subjects: true,
                students: {
                    include: { student: { select: { id: true, name: true, email: true } } }
                }
            }
        });
        res.json(classroom);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- STUDENT ACTIONS ---

const joinClassroom = async (req, res) => {
    const { code } = req.body;
    try {
        const classroom = await prisma.classroom.findUnique({ where: { code } });
        if (!classroom) return res.status(404).json({ message: "Invalid Class Code" });

        const existing = await prisma.enrollment.findFirst({
            where: { studentId: req.userId, classroomId: classroom.id }
        });
        if (existing) return res.status(400).json({ message: "Already requested/joined" });

        const enrollment = await prisma.enrollment.create({
            data: {
                studentId: req.userId,
                classroomId: classroom.id,
                status: 'PENDING'
            }
        });
        res.status(201).json(enrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getStudentEnrollments = async (req, res) => {
    try {
        const enrollments = await prisma.enrollment.findMany({
            where: { studentId: req.userId },
            include: { classroom: true }
        });
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// --- SHARED ---
const getMyClassrooms = async (req, res) => {
    // If teacher, return owned. If student, return enrolled.
    // For simplicity, we'll return both or split by query param logic later.
    // Here returning owned classrooms for teachers.
    try {
        const classrooms = await prisma.classroom.findMany({
            where: { teacherId: req.userId }
        });
        res.json(classrooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createClassroom,
    addClassSubjects,
    approveEnrollment,
    getClassroomDetails,
    joinClassroom,
    getStudentEnrollments,
    getMyClassrooms
};
