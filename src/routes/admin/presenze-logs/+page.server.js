import { redirect } from '@sveltejs/kit';
import { isAdmin } from '$lib/isAdmin';
import { getConfig } from '$lib/config';

export async function load({ locals }) {
  if (!(await isAdmin(locals))) {
    throw redirect(302, '/studente/dashboard');
  }

  const config = await getConfig();

  return {
    pageName: 'Presenze Log',
    config
  };
}
