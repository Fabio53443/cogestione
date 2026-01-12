import { json, redirect } from "@sveltejs/kit";
import PDFDocument from "pdfkit";
import { db } from "$lib/db/db";
import { studenti, corsi, iscrizioni } from "$lib/db/models";
import { eq } from "drizzle-orm";
import { isAdmin } from "$lib/isAdmin";
import { Readable } from 'stream';

// Add this function at the top level
function sanitizeFilename(filename) {
  return filename
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .replace(/[^a-zA-Z0-9-_\.]/g, '_') // Replace other special chars with underscore
    .trim();
}

export async function GET({ params, locals }) {
  if (!locals.user) {
    return json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdmin(locals))) {
    throw redirect(302, '/studente/dashboard');
  }

  // Parse request body for courseId
  const courseId = parseInt(params.id, 10);

  // Fetch course details
  const [course] = await db.select().from(corsi).where(eq(corsi.id, courseId));
  if (!course) {
    return json({ success: false, message: "Course not found" }, { status: 404 });
  }

  // Fetch iscrizioni joined with studenti
  const iscrizioniRows = await db
    .select({
      // fields from iscrizioni
      giorno: iscrizioni.giorno,
      ora: iscrizioni.ora,
      present: iscrizioni.presente,
      // fields from studenti
      nomeCompleto: studenti.nomeCompleto,
      email: studenti.email
    })
    .from(iscrizioni)
    .innerJoin(studenti, eq(iscrizioni.idStudente, studenti.id))
    .where(eq(iscrizioni.idCorso, courseId));

  // Group iscrizioni by day and shift
  const grouped = {};
  iscrizioniRows.forEach(item => {
    const { giorno, ora } = item;
    if (!grouped[giorno]) grouped[giorno] = {};
    if (!grouped[giorno][ora]) grouped[giorno][ora] = [];
    grouped[giorno][ora].push(item);
  });

  // Create PDF document with size limit options
  const doc = new PDFDocument({ bufferPages: false, size: 'A4' });
  
  // Create a readable stream from the PDF
  const stream = new ReadableStream({
    start(controller) {
      doc.on('data', (chunk) => controller.enqueue(chunk));
      doc.on('end', () => controller.close());
      doc.on('error', (err) => controller.error(err));

      // Add course details header with sanitized name
      doc.fontSize(18).text(sanitizeFilename(course.nome), { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Descrizione: ${course.descrizione || "N/A"}`);
      doc.text(`Aula: ${course.aula || "N/A"}`);
      doc.text(`Capienza: ${course.numPosti || "N/A"}`);
      doc.moveDown();
      doc.text("Aggiornato al: " + new Date().toLocaleString("it-IT"));
      doc.moveDown();

      // Iterate through grouped iscrizioni and add details
      for (const giorno of Object.keys(grouped).sort((a, b) => a - b)) {
        doc.fontSize(16).text(`Giorno: ${Number(giorno)+1}`);
        for (const ora of Object.keys(grouped[giorno]).sort((a, b) => a - b)) {
          doc.fontSize(10).text(`  Ora: ${Number(ora)+1}`);
          grouped[giorno][ora].forEach(item => {
            doc.text(` • ${item.nomeCompleto}  -- ${item.email}`);
          });
          doc.moveDown();
        }
        doc.moveDown();
      }

      // Finalize the PDF
      doc.end();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${sanitizeFilename(course.nome)}.pdf"`
    }
  });
}
