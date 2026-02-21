const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTeachers = async (req, res) => {
    try {
        const teachers = await prisma.teacher.findMany({
            include: { college: true }
        });
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addTeacher = async (req, res) => {
    const { name, email, specialization, collegeId } = req.body;
    try {
        const newTeacher = await prisma.teacher.create({
            data: {
                name,
                email,
                specialization,
                collegeId: parseInt(collegeId)
            },
        });
        res.status(201).json(newTeacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTeachers, addTeacher };
