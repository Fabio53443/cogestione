import { redirect } from '@sveltejs/kit';
import { isAdmin } from '$lib/isAdmin';
import { getConfig } from '$lib/config';
import { db } from '$lib/db/db';
import { professori } from '$lib/db/models';


export const load = async ({ locals }) => {
    if (!(await isAdmin(locals))) {
        throw redirect(302, '/studente/dashboard');
    }
    
    const siteConfig = await getConfig();
    const teachers = await db.select({
        id: professori.id,
        nomeCompleto: professori.nomeCompleto,
        email: professori.email
    }).from(professori);

    return {
        pageName: 'Amministratori',
        user: locals.user,
        siteConfig,
        teachers
    };
};
