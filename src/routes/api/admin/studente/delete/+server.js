import { json } from "@sveltejs/kit";
import { db } from "$lib/db/db";
import { studenti, iscrizioni } from "$lib/db/models";
import { eq } from "drizzle-orm";

export async function POST({ request, locals }) {
  if (!locals.user) {
    return json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  
  // Check if user is admin
  const user = await db
    .select({
      admin: studenti.admin,
    })
    .from(studenti)
    .where(eq(studenti.id, locals.user.id));

  if (!user[0]?.admin) {
    return json({ success: false, message: "Non autorizzato" }, { status: 403 });
  }
  
  try {
    const { id } = await request.json();
    
    // Prevent deleting yourself
    if (id === locals.user.id) {
      return json({ success: false, message: "Non puoi eliminare te stesso" }, { status: 400 });
    }
    
    // Check if student exists
    const student = await db.select().from(studenti).where(eq(studenti.id, id));
    if (student.length === 0) {
      return json({ success: false, message: "Studente non trovato" }, { status: 404 });
    }
    
    // Delete all related registrations first (cascade)
    await db.delete(iscrizioni).where(eq(iscrizioni.idStudente, id));

    // Delete the student
    await db.delete(studenti).where(eq(studenti.id, id));
    
    return json({ success: true, message: 'Studente eliminato con successo' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return json({ success: false, message: 'Errore durante l\'eliminazione' }, { status: 500 });
  }
}
