import { json } from '@sveltejs/kit';
import { db } from '$lib/db/db';
import { iscrizioni, studenti, corsi } from '$lib/db/models';
import { eq, and, inArray } from 'drizzle-orm';

export async function GET({ params, url }) {
  const courseId = parseInt(params.id);
  const hour = parseInt(url.searchParams.get('hour'));
  const day = parseInt(url.searchParams.get('day'));

  // Get course info to check if it's a multi-hour course
  const [course] = await db.select({
    length: corsi.length,
    nome: corsi.nome
  }).from(corsi).where(eq(corsi.id, courseId)).limit(1);

  const courseLength = course?.length || 1;

  // For multi-hour courses, get all students enrolled in the first hour of the block
  // (they will have enrollments for all hours, but we only need to display once)
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
    attendance[i].courseLength = courseLength;
  }

  return json({
    students: attendance,
    courseLength,
    courseName: course?.nome
  });
}

export async function PUT({ params, request }) {
  const courseId = parseInt(params.id);
  const { studentId, present, studentEnrollmentId } = await request.json();

  // Get course info to check if it's a multi-hour course
  const [course] = await db.select({
    length: corsi.length
  }).from(corsi).where(eq(corsi.id, courseId)).limit(1);

  const courseLength = course?.length || 1;

  // Get the enrollment record to find the student and day/hour
  const [enrollment] = await db.select()
    .from(iscrizioni)
    .where(eq(iscrizioni.id, studentEnrollmentId))
    .limit(1);

  if (!enrollment) {
    return json({ error: 'Enrollment not found' }, { status: 404 });
  }

  const { idStudente, giorno, ora } = enrollment;

  // For multi-hour courses, update ALL enrollment records for this student/course/day block
  const hoursToUpdate = [];
  for (let i = 0; i < courseLength; i++) {
    hoursToUpdate.push(ora + i);
  }

  // Update all hours in the block
  await db
    .update(iscrizioni)
    .set({ presente: present })
    .where(
      and(
        eq(iscrizioni.idStudente, idStudente),
        eq(iscrizioni.idCorso, courseId),
        eq(iscrizioni.giorno, giorno),
        inArray(iscrizioni.ora, hoursToUpdate)
      )
    );

  // Return the updated primary enrollment record
  const [updated] = await db.select()
    .from(iscrizioni)
    .where(eq(iscrizioni.id, studentEnrollmentId))
    .limit(1);

  const [student] = await db.select({
      nomeCompleto: studenti.nomeCompleto,
      email: studenti.email,
  })
  .from(studenti)
  .where(eq(studenti.id, updated.idStudente))
  .limit(1);

  updated.studentName = student.nomeCompleto;
  updated.studentEmail = student.email;
  updated.courseLength = courseLength;

  return json(updated);
}