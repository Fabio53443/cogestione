import { json } from "@sveltejs/kit";
import { db } from "$lib/db/db";
import { studenti, corsi, professori, iscrizioni } from "$lib/db/models";
import { ConsoleLogWriter, eq } from "drizzle-orm";

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
    const { id, dayIndex, timeIndex } = await request.json();
    
    // Get the current course schedule (free seats)
    const corso = await db
      .select({
        schedule: corsi.schedule
      })
      .from(corsi)
      .where(eq(corsi.id, id))
      .limit(1);

    if (!corso[0]) {
      return json({ success: false, message: 'Course not found' }, { status: 404 });
    }

    let schedule = corso[0].schedule;
   schedule[dayIndex][timeIndex] = 0;
    // Update the course schedule
    await db.update(corsi).set({ schedule }).where(eq(corsi.id, id));
  
    return json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return json({ success: false, message: 'Something went wrong' }, { status: 500 });
  }
}
