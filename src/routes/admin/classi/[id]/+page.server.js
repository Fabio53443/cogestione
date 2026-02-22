import { redirect } from '@sveltejs/kit';
import { isAdmin } from '$lib/isAdmin';
import { db } from '$lib/db/db';
import { studenti, iscrizioni, corsi } from '$lib/db/models';
import { eq, and } from 'drizzle-orm';
import { getConfig } from '$lib/config';

export async function load({ locals, params }) {
  if (!(await isAdmin(locals))) {
    throw redirect(302, '/studente/dashboard');
  }

  const config = await getConfig();
  const enabledDays = config?.days?.filter(d => d.enabled) || [];
  const enabledHours = config?.hours?.filter(h => h.enabled) || [];
  
  const classeName = decodeURIComponent(params.id);

  try {
    // Get all students in this class
    const classStudents = await db.select({
      id: studenti.id,
      nomeCompleto: studenti.nomeCompleto,
      email: studenti.email,
      classe: studenti.classe,
    }).from(studenti)
      .where(classeName === 'N/A' 
        ? eq(studenti.classe, null) 
        : eq(studenti.classe, classeName)
      )
      .orderBy(studenti.nomeCompleto);

    // Get all enrollments for these students with attendance info
    const studentIds = classStudents.map(s => s.id);
    
    let enrollments = [];
    if (studentIds.length > 0) {
      enrollments = await db.select({
        id: iscrizioni.id,
        idStudente: iscrizioni.idStudente,
        idCorso: iscrizioni.idCorso,
        ora: iscrizioni.ora,
        giorno: iscrizioni.giorno,
        presente: iscrizioni.presente,
        corsoNome: corsi.nome,
        corsoAula: corsi.aula,
      })
        .from(iscrizioni)
        .leftJoin(corsi, eq(iscrizioni.idCorso, corsi.id))
        .where(
          // Filter by student IDs - using OR conditions
          studentIds.length === 1 
            ? eq(iscrizioni.idStudente, studentIds[0])
            : undefined
        );
      
      // If more than one student, filter in JS (drizzle doesn't have easy inArray for this case)
      if (studentIds.length > 1) {
        const studentIdSet = new Set(studentIds);
        enrollments = enrollments.filter(e => studentIdSet.has(e.idStudente));
      }
    }

    // Build attendance matrix: studentId -> dayIndex -> hourIndex -> enrollment
    const attendanceMatrix = {};
    classStudents.forEach(student => {
      attendanceMatrix[student.id] = {};
      enabledDays.forEach((day, dayIdx) => {
        attendanceMatrix[student.id][dayIdx] = {};
        enabledHours.forEach((hour, hourIdx) => {
          attendanceMatrix[student.id][dayIdx][hourIdx] = null;
        });
      });
    });

    // Fill in the enrollments
    enrollments.forEach(enrollment => {
      const dayIdx = enabledDays.findIndex(d => d.id === enrollment.giorno);
      const hourIdx = enrollment.ora;
      
      if (dayIdx !== -1 && attendanceMatrix[enrollment.idStudente]) {
        attendanceMatrix[enrollment.idStudente][dayIdx][hourIdx] = {
          id: enrollment.id,
          corsoNome: enrollment.corsoNome,
          corsoAula: enrollment.corsoAula,
          presente: enrollment.presente,
        };
      }
    });

    return {
      pageName: `Gestione Classe / Presenze`,
      classeName,
      students: classStudents,
      attendanceMatrix,
      enabledDays,
      enabledHours,
      siteConfig: config
    };
  } catch (error) {
    console.error('Error loading class attendance:', error);
    return {
      pageName: `Presenze - ${classeName}`,
      classeName,
      students: [],
      attendanceMatrix: {},
      enabledDays,
      enabledHours,
      siteConfig: config,
      error: 'Errore durante il caricamento delle presenze.'
    };
  }
}
