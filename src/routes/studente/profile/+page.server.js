import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db/db.js';
import { eq } from 'drizzle-orm';
import { studenti } from '$lib/db/models.js';

export async function load({ locals }) {
  if (!locals.user || locals.user.role !== 'studente') {
    throw redirect(302, '/');
  }

  try {
    const [user] = await db.select().from(studenti).where(eq(studenti.id, locals.user.id));
    
    if (!user) {
      throw redirect(302, '/login');
    }

    // Check if user has a classe, redirect to complete profile if not
    if (!user.classe) {
      throw redirect(302, '/studente/complete-profile');
    }
    
    return {
      pageName: 'Il tuo profilo',
      user: locals.user,
      nomeCompleto: user.nomeCompleto,
      email: user.email,
      classe: user.classe,
    };
  } catch (error) {
    if (error.status === 302) throw error; // Re-throw redirects
    console.error('Error fetching profile:', error);
    return {
      pageName: 'Il tuo profilo',
      user: locals.user,
      error: 'Si è verificato un errore durante il caricamento del profilo.'
    };
  }
}