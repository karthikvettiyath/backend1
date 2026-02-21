const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const email = process.argv[2];

if (!email) {
    console.log("Usage: node promote_teacher.js <email>");
    process.exit(1);
}

async function run() {
    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'TEACHER' }
        });
        console.log(`User ${user.email} is now a TEACHER.`);
    } catch (e) {
        console.error(e.message);
    } finally {
        await prisma.$disconnect();
    }
}

run();
