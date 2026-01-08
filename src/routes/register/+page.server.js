import { redirect } from '@sveltejs/kit';

export function load({ locals }) {
  // Redirect if already logged in
  if (locals.user && locals.user.role === 'studente') {
    throw redirect(302, '/studente/dashboard');
  }
  if (locals.user && locals.user.role === 'docente') {
    throw redirect(302, '/docenti/dashboard');
  }
  
  return {
    pageName: 'Registrazione studente'
  };
}