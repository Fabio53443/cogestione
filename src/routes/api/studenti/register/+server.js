import { json } from '@sveltejs/kit'; // To send JSON responses
import { db } from '$lib/db/db'; // Assuming you're using Drizzle ORM for your database
import bcrypt from 'bcryptjs'; // For hashing passwords
import { studenti } from '$lib/db/models';
export const POST = async ({ request }) => {
    try {
        const formData = await request.json();
        const { nome, email, password, classe } = formData;
        if ( !nome || !email || !password ) {
            return json({ success: false, message: 'All fields are required.' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.insert(studenti).values({
            nomeCompleto: nome,
            email,
            classe: classe || null,
            hashedPass: hashedPassword, 
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
