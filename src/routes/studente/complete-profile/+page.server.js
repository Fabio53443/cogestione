import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db/db';
import { studenti } from '$lib/db/models';
import { eq } from 'drizzle-orm';

export async function load({ locals }) {
  if (!locals.user || locals.user.role !== 'studente') {
    throw redirect(302, '/login');
  }

  // Check if user already has classe set
  const user = await db.select({ classe: studenti.classe })
    .from(studenti)
    .where(eq(studenti.id, locals.user.id));

  if (user[0]?.classe) {
    throw redirect(302, '/studente/dashboard');
  }

  return {
    pageName: 'Completa il tuo profilo',
    user: locals.user
  };
}
