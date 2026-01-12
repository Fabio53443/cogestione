import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db/db.js';
import { eq } from 'drizzle-orm';
import { isSdO } from '$lib/isAdmin.js';
import { corsi, iscrizioni, professori, studenti } from '$lib/db/models.js';

export async function load({ locals, params }) {
    if (!(await isSdO(locals))) {
        throw redirect(302, '/studente/dashboard');
    }

  try {
    const student = await db
      .select()
      .from(studenti)
      .where(eq(studenti.id, parseInt(params.id)))
      .then(rows => rows[0]);

    if (!student) {
      throw new Error('Student not found');
    }

    const userIscrizioni = await db
      .select({
        corso: corsi,
        docente: professori,
        ora: iscrizioni.ora,
        giorno: iscrizioni.giorno,
        presente: iscrizioni.presente
      })
      .from(iscrizioni)
      .where(eq(iscrizioni.idStudente, student.id))
      .leftJoin(corsi, eq(iscrizioni.idCorso, corsi.id))
      .leftJoin(professori, eq(corsi.docente, professori.id));

    const corsiIscritto = userIscrizioni.map(({ corso, docente, ora, giorno, presente }) => ({
      id: corso.id,
      uniqueKey: `${corso.id}-${giorno}-${ora}`,
      nome: corso.nome,
      descrizione: corso.descrizione,
      aula: corso.aula,
      ora: ora,
      giorno: giorno,
      presente: presente,
      docente: docente.nomeCompleto
    }));

    return {
      pageName: 'Visualizza Studente',
      student,
      corsi: corsiIscritto
    };
  } catch (error) {
    console.error('Error fetching student data:', error);
    return {
      pageName: 'Visualizza Studente',
      error: 'Si è verificato un errore durante il caricamento dei dati dello studente.'
    };
  }
}
