import { json, redirect } from '@sveltejs/kit';
import { OAuth2Client } from 'google-auth-library';
import { db } from '$lib/db/db';
import { studenti } from '$lib/db/models';

export async function GET({ url }) {
  const redirectUri = `${process.env.CF_PAGES_URL}/api/studenti/google/callback`;
  console.log('Google OAuth redirect URI:', redirectUri);
  
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  const authOptions = {
    access_type: 'offline',
    prompt: 'consent',
    scope: ['profile', 'email'],
  };
  
  // Restrict to specific Google Workspace domain if configured
  if (process.env.GOOGLE_ALLOWED_DOMAIN) {
    authOptions.hd = process.env.GOOGLE_ALLOWED_DOMAIN;
  }
  
  const authorizeUrl = client.generateAuthUrl(authOptions);
  throw redirect(302, authorizeUrl);
}