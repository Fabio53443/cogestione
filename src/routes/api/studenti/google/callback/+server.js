import { json, redirect } from '@sveltejs/kit';
import { OAuth2Client } from 'google-auth-library';
import { db } from '$lib/db/db';
import { studenti } from '$lib/db/models';
import { count, eq } from 'drizzle-orm';
import { SignJWT } from 'jose';
import { TextEncoder } from 'util';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

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

  // Insert or update user (use email as unique constraint)
  await db.insert(studenti).values({
    nomeCompleto: name,
    email,
    hashedPass: googleId,
    googleId,
    admin: isFirstUser,
  }).onConflictDoUpdate({
    target: studenti.email,
    set: { nomeCompleto: name, googleId, hashedPass: googleId }
  });

  // Get the user's ID and classe from database
  const user = await db.select({ id: studenti.id, classe: studenti.classe })
    .from(studenti)
    .where(eq(studenti.email, email));

  // Generate JWT token directly
  const token = await new SignJWT({ 
    username: email, 
    id: user[0].id, 
    role: 'studente', 
    nome_completo: name 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('36h')
    .sign(secret);

  cookies.set('token', token, { path: '/', httpOnly: false });
  
  // If user doesn't have classe set, redirect to complete profile
  if (!user[0].classe) {
    throw redirect(302, '/studente/complete-profile');
  }
  
  throw redirect(302, '/studente/dashboard');
}