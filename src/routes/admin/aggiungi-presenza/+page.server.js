import { redirect } from '@sveltejs/kit';
import { isAdmin } from '$lib/isAdmin';
import { getConfig } from '$lib/config';
import { db } from '$lib/db/db';
import { studenti, corsi } from '$lib/db/models';

export const load = async ({ locals }) => {
    if (!(await isAdmin(locals))) {
        throw redirect(302, '/studente/dashboard');
    }

    const siteConfig = await getConfig();

    const students = await db.select({
        id: studenti.id,
        nomeCompleto: logTitleCase(studenti.nomeCompleto) // We'll just select what we need
    }).from(studenti);

    const courses = await db.select({
        id: corsi.id,
        nome: corsi.nome,
        length: corsi.length
    }).from(corsi);

    return {
        pageName: 'Aggiungi Presenza Manuale',
        user: locals.user,
        siteConfig,
        students,
        courses
    };
};

function logTitleCase(str) { // Helper just for this file if needed, otherwise use SQL
    return str;
}
