import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db/db.js';
import { eq } from 'drizzle-orm';
import { corsi, iscrizioni, professori } from '$lib/db/models.js';
import { getConfig } from '$lib/config';
import { isSdO } from '$lib/isAdmin';

export async function load({ locals }) {
  if (!locals.user || locals.user.role !== 'studente') {
    throw redirect(302, '/');
  }

  const config = await getConfig();
  const userIsSdO = await isSdO(locals);

  try {
    // Get all courses the student is enrolled in
    const userIscrizioni = await db
      .select({
        corso: corsi,
        docente: professori, 
        ora: iscrizioni.ora,
        giorno: iscrizioni.giorno,
        presente: iscrizioni.presente
      })
      .from(iscrizioni)
      .where(eq(iscrizioni.idStudente, locals.user.id))
      .leftJoin(corsi, eq(iscrizioni.idCorso, corsi.id))
      .leftJoin(professori, eq(corsi.docente, professori.id));

    const corsiIscritto = userIscrizioni.map(({ corso, docente, ora, giorno, presente }) => ({
      id: corso.id,
      uniqueKey: `${corso.id}-${giorno}-${ora}`, // Add this field for unique keying
      nome: corso.nome,
      descrizione: corso.descrizione,
      aula: corso.aula,
      ora: ora,
      giorno: giorno,
      presente: presente,
    }));
    return {
      pageName: 'Dashboard studente',
      user: locals.user,
      corsi: corsiIscritto,
      siteConfig: config,
      isSdO: userIsSdO
    };
  } catch (error) {
    console.error('Error fetching courses:', error);
    // You might want to throw a proper error here that your client can handle
    return {
      pageName: 'Dashboard studente',
      user: locals.user,
      corsi: [],
      error: 'Si è verificato un errore durante il caricamento dei corsi.',
      siteConfig: config,
      isSdO: userIsSdO
    };
  }
}