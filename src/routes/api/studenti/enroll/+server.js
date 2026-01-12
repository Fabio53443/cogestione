import { json } from '@sveltejs/kit';
import { db } from '$lib/db/db';
import { iscrizioni, corsi } from '$lib/db/models';
import { eq, and } from 'drizzle-orm';
import { getConfig } from '$lib/config';

export const POST = async ({ locals, request }) => {
  // Check if registration is open
  const config = await getConfig();
  if (!config.registrationOpen) {
    return json({ success: false, message: 'Le iscrizioni sono chiuse.' }, { status: 401 });
  }
  
  // Check deadline
  if (config.registrationDeadline && new Date() > new Date(config.registrationDeadline)) {
    return json({ success: false, message: 'Il termine per le iscrizioni è scaduto.' }, { status: 401 });
  }

  try {
    if (!locals.user || locals.user.role !== 'studente') {
      return json({ success: false, message: 'Unauthorized.' }, { status: 401 });
    }
    const { idCorso, giorno, ora } = await request.json();

    if (!idCorso || giorno === undefined || ora === undefined) {
      return json({ success: false, message: 'Missing enrollment data.' }, { status: 400 });
    }

    // Fetch course details
    const course = await db.select().from(corsi).where(eq(corsi.id, idCorso)).limit(1);

    if (course.length === 0) {
      return json({ success: false, message: 'Course not found.' }, { status: 404 });
    }

    const courseLength = course[0].length;
    const enabledHours = config.hours.filter(h => h.enabled);
    const numHours = enabledHours.length;

    // Check for overlapping courses
    for (let i = 0; i < courseLength; i++) {
      // Check if the hour is within bounds
      if (ora + i >= numHours) {
        return json({ success: false, message: 'Il corso non può essere prenotato in questo orario.' }, { status: 400 });
      }
      
      const conflictingEnrollment = await db.select().from(iscrizioni).where(
        and(
          eq(iscrizioni.idStudente, locals.user.id),
          eq(iscrizioni.giorno, giorno),
          eq(iscrizioni.ora, ora + i)
        )
      ).limit(1);

      if (conflictingEnrollment.length > 0) {
        return json({ success: false, message: 'Sei già iscritto ad un corso in questa ora/giorno' }, { status: 400 });
      }

      // Check availability in the course schedule
      if (course[0].schedule[giorno][ora + i] <= 0) {
        return json({ success: false, message: 'No available slots for the selected time.' }, { status: 400 });
      }
    }

    // Proceed with enrollment
    for (let i = 0; i < courseLength; i++) {
      await db.insert(iscrizioni).values({
        idStudente: locals.user.id,
        idCorso,
        giorno,
        ora: ora + i
      });

      // Update the course schedule to decrement the available slots
      course[0].schedule[giorno][ora + i] -= 1;
    }
    await db.update(corsi).set({ schedule: course[0].schedule }).where(eq(corsi.id, idCorso));

    return json({ success: true, message: 'Enrollment successful.' });
  } catch (error) {
    console.error('Enrollment Error:', error);
    return json({ success: false, message: 'Enrollment failed.' }, { status: 500 });
  }
};

export const DELETE = async ({ locals, request }) => {
  // Check if registration is open
  const config = await getConfig();
  if (!config.registrationOpen) {
    return json({ success: false, message: 'Le iscrizioni sono chiuse.' }, { status: 401 });
  }
  
  // Check deadline
  if (config.registrationDeadline && new Date() > new Date(config.registrationDeadline)) {
    return json({ success: false, message: 'Il termine per le iscrizioni è scaduto.' }, { status: 401 });
  }

  try {
    if (!locals.user || locals.user.role !== 'studente') {
      return json({ success: false, message: 'Unauthorized.' }, { status: 401 });
    }
    const { idCorso, giorno, ora } = await request.json();

    if (!idCorso || giorno === undefined || ora === undefined) {
      return json({ success: false, message: 'Missing unenrollment data.' }, { status: 400 });
    }

    // Fetch course details
    const course = await db.select().from(corsi).where(eq(corsi.id, idCorso)).limit(1);

    if (course.length === 0) {
      return json({ success: false, message: 'Course not found.' }, { status: 404 });
    }

    const courseLength = course[0].length;

    // Check if the student is enrolled in the course
    for (let i = 0; i < courseLength; i++) {
      const enrollment = await db.select().from(iscrizioni).where(
        and(
          eq(iscrizioni.idStudente, locals.user.id),
          eq(iscrizioni.idCorso, idCorso),
          eq(iscrizioni.giorno, giorno),
          eq(iscrizioni.ora, ora + i)
        )
      ).limit(1);

      if (enrollment.length === 0) {
        return json({ success: false, message: 'Not enrolled in the specified course at the specified time.' }, { status: 400 });
      }

      // Proceed with unenrollment
      await db.delete(iscrizioni).where(
        and(
          eq(iscrizioni.idStudente, locals.user.id),
          eq(iscrizioni.idCorso, idCorso),
          eq(iscrizioni.giorno, giorno),
          eq(iscrizioni.ora, ora + i)
        )
      );

      // Update the course schedule to increment the available slots
      course[0].schedule[giorno][ora + i] += 1;
    }
    await db.update(corsi).set({ schedule: course[0].schedule }).where(eq(corsi.id, idCorso));

    return json({ success: true, message: 'Unenrollment successful.' });
  } catch (error) {
    console.error('Unenrollment Error:', error);
    return json({ success: false, message: 'Unenrollment failed.' }, { status: 500 });
  }
};