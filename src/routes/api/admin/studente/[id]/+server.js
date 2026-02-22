import { json } from "@sveltejs/kit";
import { db } from "$lib/db/db";
import { studenti, iscrizioni, corsi } from "$lib/db/models";
import { eq } from "drizzle-orm";
import { isAdmin } from "$lib/isAdmin";

export async function GET({ params, locals }) {
  if (!(await isAdmin(locals))) {
    return json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const studentId = parseInt(params.id);

    // Get student info
    const [student] = await db
      .select()
      .from(studenti)
      .where(eq(studenti.id, studentId));

    if (!student) {
      return json({ success: false, message: "Student not found" }, { status: 404 });
    }

    // Get all enrollments with course details
    const enrollments = await db
      .select({
        id: iscrizioni.id,
        ora: iscrizioni.ora,
        giorno: iscrizioni.giorno,
        presente: iscrizioni.presente,
        idCorso: iscrizioni.idCorso,
        corsoNome: corsi.nome,
        corsoAula: corsi.aula,
        corsoLength: corsi.length,
      })
      .from(iscrizioni)
      .innerJoin(corsi, eq(iscrizioni.idCorso, corsi.id))
      .where(eq(iscrizioni.idStudente, studentId));

    return json({
      success: true,
      student: {
        id: student.id,
        nomeCompleto: student.nomeCompleto,
        email: student.email,
        classe: student.classe,
        sdo: student.sdo,
        admin: student.admin,
      },
      enrollments,
    });
  } catch (error) {
    console.error("Admin Student API Error:", error);
    return json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update student details (classe, etc.)
export async function PUT({ params, locals, request }) {
  if (!(await isAdmin(locals))) {
    return json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const studentId = parseInt(params.id);
    const body = await request.json();

    // Get student info
    const [student] = await db
      .select()
      .from(studenti)
      .where(eq(studenti.id, studentId));

    if (!student) {
      return json({ success: false, message: "Student not found" }, { status: 404 });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (body.classe !== undefined) {
      updateData.classe = body.classe || null; // Allow empty string to set null
    }

    if (Object.keys(updateData).length === 0) {
      return json({ success: false, message: "No fields to update" }, { status: 400 });
    }

    const [updatedStudent] = await db
      .update(studenti)
      .set(updateData)
      .where(eq(studenti.id, studentId))
      .returning();

    return json({
      success: true,
      message: "Studente aggiornato con successo",
      student: {
        id: updatedStudent.id,
        nomeCompleto: updatedStudent.nomeCompleto,
        email: updatedStudent.email,
        classe: updatedStudent.classe,
        sdo: updatedStudent.sdo,
        admin: updatedStudent.admin,
      },
    });
  } catch (error) {
    console.error("Admin Student Update API Error:", error);
    return json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
