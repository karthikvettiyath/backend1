const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const signup = async (req, res) => {
    try {
        const { email, password, name, course, semester } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                course,
                semester,
            },
        });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log(`Login failed: User ${email} not found`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        console.log(`Login attempt for ${email}. Found user role: ${user.role}`);

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, email: true, name: true, course: true, semester: true, college: true, role: true },
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    const { name, course, semester, collegeId } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: req.userId },
            data: {
                name,
                course,
                semester,
                collegeId: collegeId ? parseInt(collegeId) : undefined
            },
            select: { id: true, name: true, email: true, course: true, semester: true, college: true, role: true },
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { signup, login, getProfile, updateProfile };
