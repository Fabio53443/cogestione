import { json } from '@sveltejs/kit';
import { db } from '$lib/db/db';
import { iscrizioni, corsi, presenze_logs } from '$lib/db/models';
import { eq, and } from 'drizzle-orm';

export async function POST({ request, locals }) {
    try {
        const body = await request.json();
        const { studentId, courseId, day, hour } = body;

        if (!studentId || !courseId || day === undefined || hour === undefined) {
            return json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        const parsedStudentId = parseInt(studentId);
        const parsedCourseId = parseInt(courseId);
        const parsedDay = parseInt(day);
        const parsedHour = parseInt(hour);

        // 1. Get the course to find its length
        const [course] = await db.select({ length: corsi.length }).from(corsi).where(eq(corsi.id, parsedCourseId)).limit(1);
        if (!course) {
            return json({ success: false, message: 'Course not found' }, { status: 404 });
        }

        const courseLength = course.length || 1;
        const adminId = locals?.user?.id || null;

        // 2 & 3. For each hour in the block, check existing enrollment and insert/update
        let processedCount = 0;
        for (let currentHour = parsedHour; currentHour < parsedHour + courseLength; currentHour++) {
            // Check if student is already enrolled
            const [existing] = await db.select()
                .from(iscrizioni)
                .where(
                    and(
                        eq(iscrizioni.idStudente, parsedStudentId),
                        eq(iscrizioni.idCorso, parsedCourseId),
                        eq(iscrizioni.giorno, parsedDay),
                        eq(iscrizioni.ora, currentHour)
                    )
                )
                .limit(1);

            let changedIscrizioneId;
            let previousPresente = null;

            if (existing) {
                // Update existing record
                previousPresente = existing.presente;
                await db.update(iscrizioni)
                    .set({ presente: true })
                    .where(eq(iscrizioni.id, existing.id));
                changedIscrizioneId = existing.id;
            } else {
                // Insert new record
                const [inserted] = await db.insert(iscrizioni)
                    .values({
                        idStudente: parsedStudentId,
                        idCorso: parsedCourseId,
                        giorno: parsedDay,
                        ora: currentHour,
                        presente: true
                    })
                    .returning({ id: iscrizioni.id });
                changedIscrizioneId = inserted.id;
            }

            // 4. Log the action
            await db.insert(presenze_logs).values({
                id_iscrizione: changedIscrizioneId,
                id_studente: parsedStudentId,
                id_corso: parsedCourseId,
                giorno: parsedDay,
                ora: currentHour,
                previous_presente: previousPresente,
                new_presente: true,
                changed_by: adminId,
                reason: 'Added manually by admin'
            });

            processedCount++;
        }

        return json({
            success: true,
            message: `Successfully updated attendance for ${processedCount} hour(s).`
        });

    } catch (error) {
        console.error('Error adding manual attendance:', error);
        return json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
