import { redirect } from '@sveltejs/kit';
import { LOGIN_METHOD } from '$env/static/private';

export function load({ locals }) {
  if (locals.user && locals.user.role === 'studente') {
    throw redirect(302, '/studente/dashboard/');
  }
  if (locals.user && locals.user.role === 'docente') {
    throw redirect(302, '/docenti/dashboard/');
  }
  return {
    pageName: 'Login dello studente',
    loginMethod: LOGIN_METHOD || 'email',
  };
}