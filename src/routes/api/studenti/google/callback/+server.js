import { json, redirect } from '@sveltejs/kit';
import { OAuth2Client } from 'google-auth-library';
import { db } from '$lib/db/db';
import { studenti } from '$lib/db/models';
import { count } from 'drizzle-orm';

export async function GET({ url, cookies }) {
  const redirectUri = `${process.env.CF_PAGES_URL}/api/studenti/google/callback`;
  
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  const code = url.searchParams.get('code');
  if (!code) {
    return json({ success: false, message: 'No code returned from Google.' });
  }
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  const payload = ticket.getPayload();
  const email = payload.email;
  const name = payload.name;
  const googleId = payload.sub;

  // Check if this is the first user - make them admin
  const userCount = await db.select({ count: count() }).from(studenti);
  const isFirstUser = userCount[0].count === 0;

  // Insert or update user
  await db.insert(studenti).values({
    nomeCompleto: name,
    email,
    hashedPass: 'google_sso',
    googleId,
    admin: isFirstUser,
  }).onConflictDoUpdate({
    target: studenti.googleId,
    set: { nomeCompleto: name, email }
  });

  //call the login endpoint to get the token
  const response = await fetch(`${process.env.CF_PAGES_URL}/api/studenti/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: email,
      password: googleId,
    })
  });
  const data = await response.json();
  cookies.set('token', data.token, { path: '/', httpOnly: true });
  throw redirect(302, '/studente/dashboard');
}