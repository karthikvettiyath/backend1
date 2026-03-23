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
app.use('/api/studyPlan', require('./routes/studyPlan'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/planner', require('./routes/planner'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/insights', require('./routes/insights'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/tasks', require('./routes/tasks'));

app.get('/', (req, res) => {
    res.send('Study Planner API is running');
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}