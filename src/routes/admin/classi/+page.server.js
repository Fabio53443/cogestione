import { redirect } from '@sveltejs/kit';
import { isAdmin } from '$lib/isAdmin';
import { db } from '$lib/db/db';
import { studenti, iscrizioni } from '$lib/db/models';
import { eq, count } from 'drizzle-orm';
import { getConfig } from '$lib/config';

export async function load({ locals }) {
  if (!(await isAdmin(locals))) {
    throw redirect(302, '/studente/dashboard');
  }

  const config = await getConfig();
  const enabledDays = config?.days?.filter(d => d.enabled) || [];
  const enabledHours = config?.hours?.filter(h => h.enabled) || [];
  const totalSlots = enabledDays.length * enabledHours.length;

  try {
    // Get all students
    const allStudents = await db.select({
      id: studenti.id,
      nomeCompleto: studenti.nomeCompleto,
      email: studenti.email,
      classe: studenti.classe,
      note: studenti.note,
    }).from(studenti);

    // Get enrollment counts per student
    const enrollmentCounts = await db
      .select({
        idStudente: iscrizioni.idStudente,
        enrollmentCount: count(iscrizioni.id),
      })
      .from(iscrizioni)
      .groupBy(iscrizioni.idStudente);

    // Create a map of student id -> enrollment count
    const enrollmentMap = {};
    enrollmentCounts.forEach(e => {
      enrollmentMap[e.idStudente] = Number(e.enrollmentCount);
    });

    // Group students by class with holes calculation
    const classiMap = {};
    allStudents.forEach(student => {
      const classe = student.classe || 'N/A';
      if (!classiMap[classe]) {
        classiMap[classe] = [];
      }
      const enrollments = enrollmentMap[student.id] || 0;
      const holes = totalSlots - enrollments;
      classiMap[classe].push({
        ...student,
        enrollments,
        holes: holes > 0 ? holes : 0
      });
    });

    // Convert to array and sort
    const classi = Object.entries(classiMap)
      .map(([nome, students]) => {
        const sortedStudents = students.sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto));
        const totalHoles = students.reduce((acc, s) => acc + s.holes, 0);
        const studentsWithHoles = students.filter(s => s.holes > 0).length;
        return {
          nome,
          students: sortedStudents,
          count: students.length,
          totalHoles,
          studentsWithHoles,
          averageHoles: students.length > 0 ? Math.round((totalHoles / students.length) * 10) / 10 : 0
        };
      })
      .sort((a, b) => {
        // Put "N/A" at the end
        if (a.nome === 'N/A') return 1;
        if (b.nome === 'N/A') return -1;
        return a.nome.localeCompare(b.nome);
      });

    // Calculate worst classes (by average holes)
    const worstClasses = [...classi]
      .filter(c => c.nome !== 'N/A')
      .sort((a, b) => b.averageHoles - a.averageHoles)
      .slice(0, 5);

    return {
      pageName: 'Gestione Classi',
      classi,
      worstClasses,
      totalSlots,
      siteConfig: config
    };
  } catch (error) {
    console.error('Error loading classes:', error);
    return {
      pageName: 'Gestione Classi',
      classi: [],
      worstClasses: [],
      totalSlots,
      error: 'Errore durante il caricamento delle classi.'
    };
  }
}
