import { json } from '@sveltejs/kit';
import { db } from '$lib/db/db';
import { iscrizioni, studenti } from '$lib/db/models';
import { eq, and } from 'drizzle-orm';

export async function GET({ params, url }) {
  const courseId = params.id;
  const hour = url.searchParams.get('hour');
  const day = url.searchParams.get('day');

  const attendance = await db.select()
    .from(iscrizioni)
    .where(
      and(
        eq(iscrizioni.idCorso, courseId),
        eq(iscrizioni.ora, hour),
        eq(iscrizioni.giorno, day)
      )
    );
  for (let i = 0; i < attendance.length; i++) {
    const student = await db.select({
        nomeCompleto: studenti.nomeCompleto,
        email: studenti.email,
    })
    .from(studenti)
    .where(eq(studenti.id, attendance[i].idStudente))
    .limit(1);

    attendance[i].studentName = student[0].nomeCompleto;
    attendance[i].studentEmail = student[0].email;
  }
  return json(attendance);
}

export async function PUT({ params, request }) {
  const { studentId, present } = await request.json();
  
  const updated = await db
    .update(iscrizioni)
    .set({ presente: present })
    .where(eq(iscrizioni.id, studentId))
    .returning();
  
  const student = await db.select({
      nomeCompleto: studenti.nomeCompleto,
      email: studenti.email,
  })
  .from(studenti)
  .where(eq(studenti.id, updated[0].idStudente))
  .limit(1);

  updated[0].studentName = student[0].nomeCompleto;
  updated[0].studentEmail = student[0].email;
  return json(updated[0]);
}