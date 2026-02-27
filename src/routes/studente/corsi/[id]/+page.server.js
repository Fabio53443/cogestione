import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db/db.js';
import { corsi, iscrizioni, studenti } from '$lib/db/models.js';
import { eq } from 'drizzle-orm';
import { getConfig } from '$lib/config';

export async function load({ params, locals }) {
  const courseId = parseInt(params.id, 10);
  if (!locals.user || locals.user.role !== 'studente') {
    throw redirect(302, '/');
  }

  // Check if user has a classe, redirect to complete profile if not
  const [userRecord] = await db.select({ classe: studenti.classe })
    .from(studenti)
    .where(eq(studenti.id, locals.user.id));

  if (!userRecord?.classe) {
    throw redirect(302, '/studente/complete-profile');
  }

  const config = await getConfig();

  // Load the specific course by ID
  const [course] = await db
    .select()
    .from(corsi)
    .where(eq(corsi.id, courseId)); 

  if (!course) {
    return { corso: null, error: 'Corso non trovato' };
  }

  //get eventual enrolment of the student, array as it might be more than one; return both the day and hour index of the existing enrolment
  const enrolment = await db.select().from(iscrizioni).where(eq(iscrizioni.idStudente, locals.user.id), eq(iscrizioni.idCorso, courseId));
  //copy the array to a new one that only contains the day and hour as dictioanry
  let enrolmentDict = [];
  enrolment.forEach((enrol) => {
    enrolmentDict.push({day: enrol.giorno, hour: enrol.ora, id: enrol.idCorso});
  });
  return {
    pageName: 'Dettagli del corso', 
    corso: {
      id: course.id,
      nome: course.nome,
      length: course.length,
      descrizione: course.descrizione,
      aula: course.aula,
      postiDisponibili: course.postiDisponibili,
      numPosti: course.numPosti, 
      schedule: course.schedule,
      availability: course.availability,
    }, 
    siteConfig: config,
    enrolmentDict
  };
}