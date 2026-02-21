const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getColleges = async (req, res) => {
    try {
        const colleges = await prisma.college.findMany();
        res.json(colleges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addCollege = async (req, res) => {
    const { name, location } = req.body;
    try {
        const newCollege = await prisma.college.create({
            data: { name, location },
        });
        res.status(201).json(newCollege);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getColleges, addCollege };
