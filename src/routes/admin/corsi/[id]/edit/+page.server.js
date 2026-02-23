import { db } from '$lib/db/db';
import { corsi, professori } from '$lib/db/models';
import { eq } from 'drizzle-orm';
import { isAdmin } from '$lib/isAdmin';
import { redirect } from '@sveltejs/kit';

export async function load({ params, locals }) {
  if (!(await isAdmin(locals))) {
    throw redirect(302, '/studente/dashboard');
  }

  const courseId = parseInt(params.id, 10);

  const [course] = await db
    .select()
    .from(corsi)
    .where(eq(corsi.id, courseId));

  if (!course) {
    return { corso: null, error: 'Corso non trovato' };
  }

  const teachers = await db.select().from(professori);

  return {
    pageName: 'Modifica Corso',
    corso: {
      id: course.id,
      nome: course.nome,
      descrizione: course.descrizione,
      aula: course.aula,
      postiDisponibili: course.postiDisponibili,
      numPosti: course.numPosti,
      length: course.length,
      availability: course.availability,
      docente: course.docente,
    },
    teachers,
  };
}