import { redirect } from '@sveltejs/kit';
import { isAdmin } from '$lib/isAdmin';
import { db } from '$lib/db/db';
import { studenti } from '$lib/db/models';
import { getConfig } from '$lib/config';

export async function load({ locals }) {
  if (!(await isAdmin(locals))) {
    throw redirect(302, '/studente/dashboard');
  }

  const config = await getConfig();

  try {
    // Get all students
    const allStudents = await db.select({
      id: studenti.id,
      nomeCompleto: studenti.nomeCompleto,
      email: studenti.email,
      classe: studenti.classe,
    }).from(studenti);

    // Group students by class
    const classiMap = {};
    allStudents.forEach(student => {
      const classe = student.classe || 'N/A';
      if (!classiMap[classe]) {
        classiMap[classe] = [];
      }
      classiMap[classe].push(student);
    });

    // Convert to array and sort
    const classi = Object.entries(classiMap)
      .map(([nome, students]) => ({
        nome,
        students: students.sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto)),
        count: students.length
      }))
      .sort((a, b) => {
        // Put "N/A" at the end
        if (a.nome === 'N/A') return 1;
        if (b.nome === 'N/A') return -1;
        return a.nome.localeCompare(b.nome);
      });

    return {
      pageName: 'Gestione Classi',
      classi,
      siteConfig: config
    };
  } catch (error) {
    console.error('Error loading classes:', error);
    return {
      pageName: 'Gestione Classi',
      classi: [],
      error: 'Errore durante il caricamento delle classi.'
    };
  }
}
