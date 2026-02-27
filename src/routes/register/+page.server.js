import { redirect } from '@sveltejs/kit';
import { LOGIN_METHOD } from '$env/static/private';

export function load({ locals }) {
  // Redirect if already logged in
  if (locals.user && locals.user.role === 'studente') {
    throw redirect(302, '/studente/dashboard');
  }
  if (locals.user && locals.user.role === 'docente') {
    throw redirect(302, '/docenti/dashboard');
  }
  
  // If using Google auth, redirect to login page (no separate registration needed)
  const loginMethod = LOGIN_METHOD || 'email';
  if (loginMethod === 'google') {
    throw redirect(302, '/login');
  }
  
  return {
    pageName: 'Registrazione studente',
    loginMethod,
  };
}