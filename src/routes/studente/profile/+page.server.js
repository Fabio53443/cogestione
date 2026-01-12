import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db/db.js';
import { eq } from 'drizzle-orm';
import { studenti } from '$lib/db/models.js';

export async function load({ locals }) {
  if (!locals.user || locals.user.role !== 'studente') {
    throw redirect(302, '/');
  }

  try {
    const user = await db.select().from(studenti).where(eq(studenti.id, locals.user.id));
    
    if (!user[0]) {
      throw redirect(302, '/login');
    }
    
    return {
      pageName: 'Il tuo profilo',
      user: locals.user,
      nomeCompleto: user[0].nomeCompleto,
      email: user[0].email,
      classe: user[0].classe,
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return {
      pageName: 'Il tuo profilo',
      user: locals.user,
      error: 'Si è verificato un errore durante il caricamento del profilo.'
    };
  }
}