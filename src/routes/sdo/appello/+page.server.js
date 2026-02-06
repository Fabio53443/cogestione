import { redirect } from '@sveltejs/kit';
import { isSdO } from '$lib/isAdmin';
import { db } from '$lib/db/db';
import { corsi, professori } from '$lib/db/models';
import { eq } from 'drizzle-orm';
import { getConfig } from '$lib/config';

export async function load({ locals }) {
  if (!(await isSdO(locals))) {
    throw redirect(302, '/studente/dashboard');
  }

  const config = await getConfig();

  // Check if SDO is allowed to take attendance
  if (!config.sdoCanTakeAttendance) {
    return {
      pageName: 'Appello',
      corsi: [],
      siteConfig: config,
      attendanceDisabled: true
    };
  }

  try {
    // Get all courses with their teachers
    const allCorsi = await db.select({
      id: corsi.id,
      nome: corsi.nome,
      aula: corsi.aula,
      numPosti: corsi.numPosti,
      length: corsi.length,
      availability: corsi.availability,
      schedule: corsi.schedule,
      docenteNome: professori.nomeCompleto,
    })
    .from(corsi)
    .leftJoin(professori, eq(corsi.docente, professori.id));

    return {
      pageName: 'Appello',
      corsi: allCorsi,
      siteConfig: config,
      attendanceDisabled: false
    };
  } catch (error) {
    console.error('Error loading courses:', error);
    return {
      pageName: 'Appello',
      corsi: [],
      error: 'Errore durante il caricamento dei corsi.',
      siteConfig: config,
      attendanceDisabled: false
    };
  }
}
