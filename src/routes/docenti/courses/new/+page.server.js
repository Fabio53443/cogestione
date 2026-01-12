import { redirect } from '@sveltejs/kit';
import { isAdmin } from '$lib/isAdmin';
import { getConfig } from '$lib/config';

export async function load({ locals }) {
  if (!locals.user || locals.user.role !== 'docente' && !isAdmin(locals.user)) {
    throw redirect(302, '/');
  }
  
  const config = await getConfig();
  
  return {
    pageName: 'Nuovo corso',
    siteConfig: config
  };
}