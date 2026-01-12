import { json } from "@sveltejs/kit";
import { db } from "$lib/db/db";
import { studenti, corsi, professori, iscrizioni } from "$lib/db/models";
import { eq } from "drizzle-orm";

export async function POST({ request, locals }) {
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
    
    const corso = await db.select().from(corsi).where(eq(corsi.id, id));
    // Delete all related registrations first
    await db.delete(iscrizioni).where(eq(iscrizioni.idCorso, id));

    await db.delete(corsi).where(eq(corsi.id, id));
    
    return json({ success: true, message: 'Course deleted successfully' });
} catch (error) {
    console.error('Error:', error);
    return json({ success: false, message: 'Something went wrong' }, { status: 500 });
}

}
