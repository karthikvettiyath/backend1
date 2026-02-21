const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:5000/api/auth/login';

async function run() {
    const email = 'test_college_admin@example.com';
    const password = 'password123';

    // 1. Create College (dummy)
    let college = await prisma.college.upsert({
        where: { id: 999 },
        update: {},
        create: {
            id: 999,
            name: 'Test College',
            location: 'Test Location'
        }
    });

    // 2. Create College Admin
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
        where: { email },
        update: { role: 'COLLEGE_ADMIN', password: hashedPassword, collegeId: college.id },
        create: {
            name: 'Test Admin',
            email,
            password: hashedPassword,
            role: 'COLLEGE_ADMIN', // Check this string
            collegeId: college.id
        }
    });

    console.log(`Created user: ${user.email} with role: ${user.role}`);

    // 3. Login
    try {
        const res = await axios.post(BASE_URL, { email, password });
        console.log('Login Response Status:', res.status);
        console.log('Login Response Data:', JSON.stringify(res.data, null, 2));

        if (res.data.user.role === 'COLLEGE_ADMIN') {
            console.log('SUCCESS: Backend returns correct role.');
        } else {
            console.error(`FAILURE: Backend returned role '${res.data.user.role}' instead of 'COLLEGE_ADMIN'`);
        }

    } catch (e) {
        console.error('Login Failed:', e.response ? e.response.data : e.message);
    } finally {
        await prisma.$disconnect();
    }
}

run();
