import { json } from '@sveltejs/kit'; // To send JSON responses
import { db } from '$lib/db/db'; // Assuming you're using Drizzle ORM for your database
import bcrypt from 'bcryptjs'; // For hashing passwords
import { professori, studenti, iscrizioni, corsi } from '$lib/db/models';
import { eq } from 'drizzle-orm';

export const POST = async ({ request, locals }) => {
    try {
        const formData = await request.json();
        const { nome, email, password } = formData;

          if (!locals.user) {
            return json({ success: false, message: "Unauthorized" }, { status: 401 });
          }
        
          const user = await db
            .select({
              admin: studenti.admin,
            })
            .from(studenti)
            .where(eq(studenti.id, locals.user.id));
        
          if (!user[0].admin) {
            throw redirect(302, "/studente/dashboard");
          }
          
        

        if ( !nome || !email || !password) {
            return json({ success: false, message: 'Riempi tutti i campi.' }, { status: 400 });
        }
        // Log the form data for debugging

        const hashedPassword = await bcrypt.hash(password, 10);
        // Insert the new user into the database
        await db.insert(professori).values({
            nomeCompleto: nome,
            email,
            hashedPass: hashedPassword
        });

        return json({ success: true, message: 'User registered successfully!' });
    } catch (error) {
        console.error('Registration Error:', error);

        // Handle uniqueness violation for username or email
        if (error.code === '23505') {
            return json({ success: false, message: 'Username or email already exists.' }, { status: 400 });
        }

        return json({ success: false, message: 'Registration failed.' }, { status: 500 });
    }
};

export const DELETE = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const user = await db
    .select({
      admin: studenti.admin,
    })
    .from(studenti)
    .where(eq(studenti.id, locals.user.id));

  if (!user[0].admin) {
    throw redirect(302, "/studente/dashboard");
  }
  
  try {
    const { id } = await request.json();
    //delete all related iscrizioni for courses taught by the teacher
    const corsiDocente = await db.select().from(corsi).where(eq(corsi.docente, id));
    for (const corso of corsiDocente) {
        await db.delete(iscrizioni).where(eq(iscrizioni.idCorso, corso.id));
    }
    //delete the courses
    await db.delete(corsi).where(eq(corsi.docente, id));
    //delete the teacher
    await db.delete(professori).where(eq(professori.id, id));
    
    return json({ success: true, message: 'Course deleted successfully' });
} catch (error) {
    console.error('Error:', error);
    return json({ success: false, message: 'Something went wrong' }, { status: 500 });
}

}
