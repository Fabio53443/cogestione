import { json } from '@sveltejs/kit';
import { db } from '$lib/db/db';
import { studenti } from '$lib/db/models';
import { eq } from 'drizzle-orm';
import { SignJWT } from 'jose';
import { TextEncoder } from 'util';
import bcrypt from 'bcryptjs';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export const POST = async ({ request }) => {
    try {
        const formData = await request.json();
        const { username, password } = formData;

        if (!username || !password) {
            return json({ success: false, message: 'All fields are required.' }, { status: 400 });
        }

        const result = await db.select({
            id: studenti.id,
            hashedPass: studenti.hashedPass, 
            nome_completo: studenti.nomeCompleto, 
        })
        .from(studenti)
        .where(eq(studenti.email, username));

        if (result.length === 0) {
            return json({ success: false, message: 'Email o password non validi.' }, { status: 401 });
        }

        const user = result[0];
        const isPasswordValid = await bcrypt.compare(password, user.hashedPass);

        if (!isPasswordValid) {
            return json({ success: false, message: 'Email o password non validi.' }, { status: 401 });
        }

        const token = await new SignJWT({ username, id: user.id, role: 'studente', nome_completo: user.nome_completo })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('36h')
            .sign(secret);
        
        return json({ success: true, token });
    } catch (error) {
        console.error('Login Error:', error);
        return json({ success: false, message: 'Login failed.' }, { status: 500 });
    }
};