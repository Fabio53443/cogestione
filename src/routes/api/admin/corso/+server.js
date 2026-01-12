import { json } from '@sveltejs/kit';
import { db } from '$lib/db/db';
import { corsi, professori } from '$lib/db/models';
import { eq } from 'drizzle-orm';
import { isAdmin } from '$lib/isAdmin';
import { getConfig } from '$lib/config';
import bcrypt from 'bcryptjs';

// Create a new course (admin only)
export const POST = async ({ locals, request }) => {
    if (!(await isAdmin(locals))) {
        return json({ success: false, message: 'Unauthorized.' }, { status: 401 });
    }

    try {
        const formData = await request.json();
        const { nome, descrizione, aula, numPosti, length, availability, docenteId, newDocente } = formData;

        if (!nome || !descrizione || !aula || !numPosti || !availability || !length) {
            return json({ success: false, message: 'All fields are required.' }, { status: 400 });
        }

        let teacherId = docenteId;

        // If creating a new teacher
        if (newDocente && newDocente.nome && newDocente.email && newDocente.password) {
            // Check if teacher already exists
            const existingTeacher = await db.select().from(professori).where(eq(professori.email, newDocente.email));
            if (existingTeacher.length > 0) {
                return json({ success: false, message: 'Un organizzatore con questa email esiste già.' }, { status: 400 });
            }

            const hashedPass = await bcrypt.hash(newDocente.password, 10);
            const [newTeacher] = await db.insert(professori).values({
                nomeCompleto: newDocente.nome,
                email: newDocente.email,
                hashedPass
            }).returning();
            
            teacherId = newTeacher.id;
        }

        if (!teacherId) {
            return json({ success: false, message: 'Seleziona un organizzatore o creane uno nuovo.' }, { status: 400 });
        }

        // Get config for dynamic days and hours
        const config = await getConfig();
        const enabledDays = config.days.filter(d => d.enabled);
        const enabledHours = config.hours.filter(h => h.enabled);
        const numDays = enabledDays.length;
        const numHoursConfig = enabledHours.length;

        // Build schedule dynamically based on config
        let schedule = [];
        for (let i = 0; i < numDays; i++) {
            const dayId = enabledDays[i].id;
            if (availability.includes(dayId)) {
                schedule.push(Array(numHoursConfig).fill(numPosti));
            } else {
                schedule.push(Array(numHoursConfig).fill(0));
            }
        }

        const [newCourse] = await db.insert(corsi).values({
            nome,
            descrizione,
            aula,
            numPosti: parseInt(numPosti),
            docente: teacherId,
            length: parseInt(length),
            postiDisponibili: parseInt(numPosti),
            availability,
            schedule
        }).returning();

        return json({ success: true, message: 'Corso creato con successo!', course: newCourse });
    } catch (error) {
        console.error('Error creating course:', error);
        return json({ success: false, message: 'Errore durante la creazione del corso.' }, { status: 500 });
    }
};
