import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db/db.js';
import { eq } from 'drizzle-orm';
import { corsi, professori, studenti } from '$lib/db/models.js';
import { isAdmin } from '$lib/isAdmin';

export async function load({ params, locals }) {
  if (!(await isAdmin(locals))) {
    throw redirect(302, '/studente/dashboard');
  }   
  const id = parseInt(params.id, 10);
  
  const info_docente = await db
    .select({
      nome: professori.nomeCompleto,
    })
    .from(professori)
    .where(eq(professori.id, id));
    const nome_docente = info_docente[0].nome;


  try {
    // Get all courses the teacher is teaching
    const teacherCorsi = await db
      .select()
      .from(corsi)
      .where(eq(corsi.docente, id));
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
      pageName: 'Impersonando ' + nome_docente,
      docente: nome_docente,
      user: locals.user,
      corsi: corsiInsegnati
    };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return {
      pageName: 'Dashboard docente',
      user: locals.user,
      corsi: [],
      error: 'Si è verificato un errore durante il caricamento dei corsi.'
    };
  }
}