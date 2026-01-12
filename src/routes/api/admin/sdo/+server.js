import { json } from "@sveltejs/kit";
import { db } from "$lib/db/db";
import { studenti } from "$lib/db/models";
import { eq } from "drizzle-orm";

export async function POST({ locals, request }) {
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

  const { id } = await request.json();

  if (!id) {
    return json({ success: false, message: "Id is required" }, { status: 400 });
  }
  // promote the student to admin or demote if already admin; don't do if it's self 
  if (id == locals.user.id) {
    return json({ success: false, message: 'Non puoi cambiare il tuo stesso stato!' });
  }
try {
    const student = await db.select().from(studenti).where(eq(studenti.id, id));
    if (student.length === 0) {
        return json({ success: false, message: 'Student not found' }, { status: 404 });
    }
    const newStatus = !student[0].sdo;
    await db.update(studenti).set({ sdo: newStatus }).where(eq(studenti.id, id));
  return json({ success: true, message: 'Status changed successfully' });
} catch (error) {
    console.error('Error:', error);
    return json({ success: false, message: 'Something went wrong' }, { status: 500 });
}  

}
