import { db } from "$lib/db/db";
import { studenti } from "$lib/db/models";
import { isSdO, isAdmin } from "$lib/isAdmin";
import { error, redirect } from "@sveltejs/kit";

export async function load({ locals }) {
// check if is SdO or Admin
    if (!(await isSdO(locals))) {
        throw redirect(302, '/studente/dashboard');
    }


    try {
        const students = await db.select().from(studenti);
        return {
            pageName: 'Gestione Studenti',
            user: locals.user,
            students: students.map(student => ({
                ...student,
                presente: false // Add default presente state
            }))
        };
    } catch (e) {
        console.error("Error loading students:", e);
        throw error(500, "Internal Server Error");
    }
}
