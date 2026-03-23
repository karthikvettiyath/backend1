const { PrismaClient } = require('@prisma/client');
const Groq = require('groq-sdk');
const prisma = new PrismaClient();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const getInsights = async (req, res) => {
    try {
        const subjects = await prisma.subject.findMany({
            where: { userId: req.userId },
            include: { topics: true, exams: true },
        });

        if (subjects.length === 0) {
            return res.json({ suggestions: ["Add some subjects to get personalized AI insights!"] });
        }

        // Prepare data for AI
        const dataSummary = subjects.map(s => {
            const totalTopics = s.topics.length;
            const completedTopics = s.topics.filter(t => t.isCompleted).length;
            const progress = totalTopics > 0 ? (completedTopics / totalTopics * 100).toFixed(1) : 0;
            const nextExam = s.exams.length > 0 ? s.exams[0].date : 'No upcoming exam';
            return `- ${s.name}: ${progress}% complete. Priority: ${s.priority}/5. Difficulty: ${s.difficulty}/5. Next Exam: ${nextExam}`;
        }).join('\n');

        const prompt = `
        You are an intelligent study assistant. Based on the following student's progress, provide 3-5 concise, actionable, and encouraging study tips. Focus on subjects with low progress, high priority, or upcoming exams.
        
        Student Data:
        ${dataSummary}
        
        Format the response as a simple JSON array of strings, e.g., ["Tip 1", "Tip 2"]. Do not include markdown formatting or extra text.
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama3-8b-8192',
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content || '[]';

        let suggestions;
        try {
            // Attempt to parse JSON, fallback to splitting by newline if it fails or returns plain text
            suggestions = JSON.parse(aiResponse);
        } catch (e) {
            suggestions = aiResponse.split('\n').filter(s => s.trim().length > 0);
        }

        res.json({ suggestions });

    } catch (error) {
        console.error("Error generating insights:", error);
        res.status(500).json({ message: "Failed to generate AI insights.", error: error.message });
    }
};

module.exports = { getInsights };
