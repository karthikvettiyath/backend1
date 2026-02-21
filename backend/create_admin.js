const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

const email = process.argv[2];
const password = process.argv[3] || 'admin123';

if (!email) {
    console.log("Usage: node create_admin.js <email> [password]");
    process.exit(1);
}

async function run() {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.upsert({
            where: { email },
            update: { role: 'ADMIN', password: hashedPassword },
            create: {
                name: 'Global Admin',
                email,
                password: hashedPassword,
                role: 'ADMIN'
            }
        });
        console.log(`Admin user upserted: ${user.email}`);
    } catch (e) {
        console.error(e.message);
    } finally {
        await prisma.$disconnect();
    }
}

run();
