import { json } from "@sveltejs/kit";
import { db } from "$lib/db/db";
import { studenti } from "$lib/db/models";
import { inArray, eq } from "drizzle-orm";
import { isAdmin } from "$lib/isAdmin";

export async function POST({ request, locals }) {
    if (!(await isAdmin(locals))) {
        return json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { studentIds, note, overwrite } = body;

        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            return json({ success: false, message: "No students selected" }, { status: 400 });
        }

        if (note === undefined) {
            return json({ success: false, message: "Note is required" }, { status: 400 });
        }

        const trimmedNote = note.trim();

        if (overwrite) {
            // Overwrite mode: simple bulk update
            await db
                .update(studenti)
                .set({ note: trimmedNote || null })
                .where(inArray(studenti.id, studentIds));
        } else {
            // Append mode: fetch existing and update one by one
            const existingStudents = await db
                .select({ id: studenti.id, note: studenti.note })
                .from(studenti)
                .where(inArray(studenti.id, studentIds));

            // In Drizzle, we don't have a simple way to do bulk updates with dynamic values per row, 
            // so we use a transaction or execute them sequentially.
            await db.transaction(async (tx) => {
                for (const student of existingStudents) {
                    let newNote = trimmedNote;
                    if (student.note) {
                        // Append to existing note with a blank line separation if there's new text,
                        // or keep existing note if the new note is empty
                        newNote = trimmedNote ? `${student.note}\n\n${trimmedNote}` : student.note;
                    }

                    await tx
                        .update(studenti)
                        .set({ note: newNote || null })
                        .where(eq(studenti.id, student.id));
                }
            });
        }

        return json({ success: true, message: "Note aggiornate con successo" });
    } catch (error) {
        console.error("Bulk Notes API Error:", error);
        return json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
