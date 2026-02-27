import { redirect } from '@sveltejs/kit';
import { getConfig } from '$lib/config';

export async function load( { locals }) {
  if (locals.user && locals.user.role == 'docente') {
    return redirect(302, '/docenti/dashboard');
      }
  if (locals.user && locals.user.role == 'studente') {
    return redirect(302, '/studente/dashboard');
      }

    const config = await getConfig();

    return {
      pageName: config.eventName || 'Autogestione', 
    };
  }