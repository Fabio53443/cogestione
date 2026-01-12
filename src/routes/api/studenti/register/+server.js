import { json } from '@sveltejs/kit'; // To send JSON responses
import { db } from '$lib/db/db'; // Assuming you're using Drizzle ORM for your database
import bcrypt from 'bcryptjs'; // For hashing passwords
import { studenti } from '$lib/db/models';
import { count } from 'drizzle-orm';

export const POST = async ({ request }) => {
    try {
        const formData = await request.json();
        const { nome, email, password, classe } = formData;
        if ( !nome || !email || !password ) {
            return json({ success: false, message: 'All fields are required.' }, { status: 400 });
        }

        // Check if this is the first user - make them admin
        const userCount = await db.select({ count: count() }).from(studenti);
        const isFirstUser = userCount[0].count === 0;

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.insert(studenti).values({
            nomeCompleto: nome,
            email,
            classe: classe || null,
            hashedPass: hashedPassword,
            admin: isFirstUser,
        });

        return json({ success: true, message: 'User registered successfully!' });
    } catch (error) {
        console.error('Registration Error:', error);

        // Handle uniqueness violation for username or email
        if (error.code === '23505') {
            return json({ success: false, message: 'Username or email already exists.' }, { status: 400 });
        }

        return json({ success: false, message: 'Registration failed.' }, { status: 500 });
    }
};
