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
