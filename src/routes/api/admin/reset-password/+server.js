import { json } from '@sveltejs/kit';
import { db } from '$lib/db/db';
import { studenti, professori } from '$lib/db/models';
import { eq } from 'drizzle-orm';
import { isAdmin } from '$lib/isAdmin';
import bcrypt from 'bcryptjs';

export async function POST({ request, locals }) {
    if (!(await isAdmin(locals))) {
        return json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { userId, userType, newPassword } = await request.json();

        if (!userId || !userType || !newPassword) {
            return json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        if (userType === 'student') {
            await db.update(studenti)
                .set({ hashedPass: hashedPassword })
                .where(eq(studenti.id, userId));
        } else if (userType === 'teacher') {
            await db.update(professori)
                .set({ hashedPass: hashedPassword })
                .where(eq(professori.id, userId));
        } else {
            return json({ success: false, message: 'Invalid user type' }, { status: 400 });
        }

        return json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Password Reset Error:', error);
        return json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
