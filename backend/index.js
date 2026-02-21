const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/planner', require('./routes/planner'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/insights', require('./routes/insights'));
app.use('/api/colleges', require('./routes/colleges'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/classrooms', require('./routes/classrooms'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/college-admin', require('./routes/collegeAdmin'));

app.get('/', (req, res) => {
    res.send('Study Planner API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
