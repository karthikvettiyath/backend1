const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generatePlan = async (req, res) => {
    try {
        const { availableHoursPerDay } = req.body; // e.g. 4
        const userId = req.userId;

        // 1. Fetch Subjects and Exams
        const subjects = await prisma.subject.findMany({
            where: { userId: userId },
            include: { exams: true },
        });

        if (subjects.length === 0) {
            return res.status(400).json({ message: 'No subjects found. Add subjects first.' });
        }

        // 2. Calculate Weights
        const now = new Date();
        const subjectWeights = subjects.map(subject => {
            let daysUntilExam = 30; // Default if no exam
            if (subject.exams.length > 0) {
                const earliestExam = new Date(Math.min(...subject.exams.map(e => new Date(e.date))));
                daysUntilExam = Math.max(1, Math.ceil((earliestExam - now) / (1000 * 60 * 60 * 24)));
            }

            // Heuristic: Higher priority and difficulty, closer exam = Higher Weight
            const weight = (subject.priority * subject.difficulty) / Math.sqrt(daysUntilExam);
            return { id: subject.id, weight };
        });

        const totalWeight = subjectWeights.reduce((acc, s) => acc + s.weight, 0);

        // 3. Clear existing sessions for future
        await prisma.studySession.deleteMany({
            where: {
                subject: { userId: userId },
                startTime: { gte: now },
            },
        });

        // 4. Distribute hours and create sessions for next 7 days
        const sessions = [];
        for (let day = 0; day < 7; day++) {
            let currentStartTime = new Date(now);
            currentStartTime.setDate(currentStartTime.getDate() + day);
            currentStartTime.setHours(9, 0, 0, 0); // Start at 9 AM

            subjectWeights.forEach(sw => {
                const hoursForThisSubject = (sw.weight / totalWeight) * (availableHoursPerDay || 4);
                if (hoursForThisSubject < 0.5) return; // Skip if less than 30 mins

                const endTime = new Date(currentStartTime);
                endTime.setMinutes(endTime.getMinutes() + Math.round(hoursForThisSubject * 60));

                sessions.push({
                    subjectId: sw.id,
                    startTime: new Date(currentStartTime),
                    endTime: new Date(endTime),
                });

                // Add 15 min break
                currentStartTime = new Date(endTime);
                currentStartTime.setMinutes(currentStartTime.getMinutes() + 15);
            });
        }

        // Save to DB
        await prisma.studySession.createMany({
            data: sessions,
        });

        res.json({ message: 'Study plan generated successfully', sessions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPlan = async (req, res) => {
    try {
        const sessions = await prisma.studySession.findMany({
            where: { subject: { userId: req.userId } },
            include: { subject: true },
            orderBy: { startTime: 'asc' },
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { generatePlan, getPlan };
