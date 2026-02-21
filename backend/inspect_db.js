const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const users = await prisma.user.findMany();
        console.log('--- USERS IN DB ---');
        console.table(users.map(u => ({ id: u.id, email: u.email, role: u.role, name: u.name })));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
