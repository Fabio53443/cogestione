import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db/db';
import { eq, sql } from 'drizzle-orm';
import { corsi, iscrizioni, professori } from '$lib/db/models';

export async function load({ locals }) {
  if (!locals.user || locals.user.role !== 'studente') {
    throw redirect(302, '/');
  }
  try {
    // Get student's current enrollments
    const currentEnrollments = await db
      .select({
        idCorso: iscrizioni.idCorso,
        giorno: iscrizioni.giorno,
        ora: iscrizioni.ora
      })
      .from(iscrizioni)
      .where(eq(iscrizioni.idStudente, locals.user.id));

    const enrolledCourseIds = currentEnrollments.map(e => e.idCorso);

    const enrollmentMap = new Map();
    currentEnrollments.forEach(e => {
      enrollmentMap.set(e.idCorso, { giorno: e.giorno, ora: e.ora });
    });
    
    // Get all available courses with professor info and enrollment count
    const availableCorsi = await db
      .select({
        corso: corsi,
        docente: professori,
        enrollmentCount: sql`(
          SELECT COUNT(*)::int 
          FROM ${iscrizioni} 
          WHERE ${iscrizioni.idCorso} = ${corsi.id}
        )`
      })
      .from(corsi)
      .leftJoin(professori, eq(corsi.docente, professori.id));

    // Transform the data for the client
    const corsiProcessed = availableCorsi.map(({ corso, docente, enrollmentCount }) => {
      const enrolledInfo = enrollmentMap.get(corso.id);
      return {
        id: corso.id,
        nome: corso.nome,
        descrizione: corso.descrizione,
        aula: corso.aula,
        numPosti: corso.numPosti,
        length: corso.length,
        postiDisponibili: corso.numPosti - enrollmentCount,
        docenteNome: `${docente.nome} ${docente.cognome}`,
        iscritto: enrolledCourseIds.includes(corso.id),
        giorno: enrolledInfo?.giorno ?? null,
        ora: enrolledInfo?.ora ?? null,
        availability: corso.availability // Add this line
      };
    });

    return {
      pageName: 'Corsi disponibili',
      user: locals.user,
      corsi: corsiProcessed
    };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return {
      pageName: 'Corsi disponibili',
      user: locals.user,
      corsi: [],
      error: 'Si è verificato un errore durante il caricamento dei corsi.'
    };
  }
}

// Handle course enrollment
export const actions = {
  enroll: async ({ request, locals }) => {
    if (!locals.user) {
      return { success: false, message: 'Non autorizzato' };
    }

    const data = await request.formData();
    const courseId = parseInt(data.get('courseId'));

    try {
      // Check if already enrolled
      const existingEnrollment = await db
        .select()
        .from(iscrizioni)
        .where(
          eq(iscrizioni.idStudente, locals.user.id),
          eq(iscrizioni.idCorso, courseId)
        );

      if (existingEnrollment.length > 0) {
        return {
          success: false,
          message: 'Sei già iscritto a questo corso'
        };
      }

      // Check available spots
      const course = await db
        .select({
          numPosti: corsi.numPosti,
          enrollmentCount: sql`(
            SELECT COUNT(*)::int 
            FROM ${iscrizioni} 
            WHERE ${iscrizioni.idCorso} = ${corsi.id}
          )`
        })
        .from(corsi)
        .where(eq(corsi.id, courseId))
        .limit(1);

      if (!course[0] || course[0].enrollmentCount >= course[0].numPosti) {
        return {
          success: false,
          message: 'Il corso è al completo'
        };
      }

      // Create enrollment
      await db.insert(iscrizioni).values({
        idStudente: locals.user.id,
        idCorso: courseId
      });

      return {
        success: true,
        message: 'Iscrizione effettuata con successo'
      };
    } catch (error) {
      console.error('Error enrolling in course:', error);
      return {
        success: false,
        message: 'Si è verificato un errore durante l\'iscrizione'
      };
    }
  }
};