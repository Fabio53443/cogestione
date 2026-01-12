import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db/db.js';
import { eq } from 'drizzle-orm';
import { corsi } from '$lib/db/models.js';
import { afterNavigate } from '$app/navigation';

export async function load({ locals }) {
  if (!locals.user || locals.user.role !== 'docente') {
    throw redirect(302, '/docenti/login');
  }

  try {
    // Get all courses the teacher is teaching
    const teacherCorsi = await db
      .select()
      .from(corsi)
      .where(eq(corsi.docente, locals.user.id));
    const corsiInsegnati = teacherCorsi.map(corso => ({
      id: corso.id,
      nome: corso.nome,
      descrizione: corso.descrizione,
      aula: corso.aula,
      numPosti: corso.numPosti,
      postiDisponibili: corso.postiDisponibili,
      availability: corso.availability,
      schedule: corso.schedule,
    }));

    return {
      pageName: 'Dashboard docente',
      user: locals.user,
      corsi: corsiInsegnati
    };
  } catch (error) {
    console.error('Error fetching courses:', error);
    // You might want to throw a proper error here that your client can handle
    return {
      pageName: 'Dashboard docente',
      user: locals.user,
      corsi: [],
      error: 'Si è verificato un errore durante il caricamento dei corsi.'
    };
  }
}