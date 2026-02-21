const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

const createCollegeWithAdmin = async (req, res) => {
    const { collegeName, location, adminName, adminEmail, adminPassword } = req.body;

    try {
        // 1. Create College
        const college = await prisma.college.create({
            data: {
                name: collegeName,
                location
            }
        });

        // 2. Create College Admin User
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const adminUser = await prisma.user.create({
            data: {
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                role: 'COLLEGE_ADMIN',
                collegeId: college.id
            }
        });
        console.log(`Created College Admin: ${adminEmail} with role COLLEGE_ADMIN`);

        res.status(201).json({ college, admin: { id: adminUser.id, name: adminUser.name, email: adminUser.email } });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllColleges = async (req, res) => {
    try {
        const colleges = await prisma.college.findMany({
            include: {
                users: {
                    where: { role: 'COLLEGE_ADMIN' },
                    select: { name: true, email: true }
                }
            }
        });
        res.json(colleges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAdminStats = async (req, res) => {
    try {
        const totalColleges = await prisma.college.count();
        const totalTeachers = await prisma.user.count({ where: { role: 'TEACHER' } });
        const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });

        res.json({
            totalColleges,
            totalTeachers,
            totalStudents
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { createCollegeWithAdmin, getAllColleges, getAdminStats };
