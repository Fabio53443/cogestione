import { getConfig } from '$lib/config';

export async function load({ locals }) {
  const config = await getConfig();
  
  if (locals.user) {
    return {
      user: locals.user.username,
      siteConfig: config
    }
  }
  
  return {
    siteConfig: config
  };
}