import { json, redirect } from "@sveltejs/kit";
import PDFDocument from "pdfkit";
import { db } from "$lib/db/db";
import { studenti, corsi, iscrizioni } from "$lib/db/models";
import { eq } from "drizzle-orm";
import { isAdmin } from "$lib/isAdmin";
import archiver from 'archiver';

function sanitizeFilename(filename) {
    return filename
        .replace(/[^\x00-\x7F]/g, '')
        .replace(/[^a-zA-Z0-9-_\.]/g, '_')
        .trim();
}

async function generateCoursePDF(course, iscrizioniRows) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        const doc = new PDFDocument({ bufferPages: false, size: 'A4', margins: { top: 20, left: 20, right: 20, bottom: 20 } });

        doc.on('data', chunks.push.bind(chunks));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.fontSize(14).text(sanitizeFilename(course.nome), { underline: true });
        doc.moveDown();
        doc.fontSize(10).text(`Descrizione: ${course.descrizione || "N/A"}`);
        doc.text(`Aula: ${course.aula || "N/A"}`);
        doc.text(`Capienza: ${course.numPosti || "N/A"}`);
        doc.moveDown();
        doc.text("Aggiornato al: " + new Date().toLocaleString("it-IT"));
        doc.moveDown();

        // Group by day and shift
        const grouped = {};
        iscrizioniRows.forEach(item => {
            const { giorno, ora } = item;
            if (!grouped[giorno]) grouped[giorno] = {};
            if (!grouped[giorno][ora]) grouped[giorno][ora] = [];
            grouped[giorno][ora].push(item);
        });

        for (const giorno of Object.keys(grouped).sort()) {
            doc.fontSize(12).text(`Giorno: ${Number(giorno)+1}`);
            for (const ora of Object.keys(grouped[giorno]).sort()) {
                const numIscritti = grouped[giorno][ora].length;
                doc.fontSize(10).text(`  Ora: ${Number(ora)+2} - Iscritti: ${numIscritti}/${course.numPosti || "N/A"}`);
                grouped[giorno][ora].forEach(item => {
                    doc.text(` • ${item.nomeCompleto}  -- ${item.email}`);
                });
                doc.moveDown();
            }
            doc.moveDown();
        }

        doc.end();
    });
}

export async function POST({ request, locals }) {
    if (!locals.user || !(await isAdmin(locals))) {
        return json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { courseIds } = await request.json();
    
    if (!Array.isArray(courseIds) || courseIds.length === 0) {
        return json({ success: false, message: "Invalid course IDs" }, { status: 400 });
    }

    try {
        // Create a PassThrough stream for collecting ZIP data
        const { PassThrough } = await import('stream');
        const outputStream = new PassThrough();

        // Create ZIP archive
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(outputStream);

        // Process each course
        for (const courseId of courseIds) {
            const [course] = await db
                .select()
                .from(corsi)
                .where(eq(corsi.id, courseId));

            if (!course) continue;

            const iscrizioniRows = await db
                .select({
                    giorno: iscrizioni.giorno,
                    ora: iscrizioni.ora,
                    nomeCompleto: studenti.nomeCompleto,
                    email: studenti.email
                })
                .from(iscrizioni)
                .innerJoin(studenti, eq(iscrizioni.idStudente, studenti.id))
                .where(eq(iscrizioni.idCorso, courseId));

            const pdfBuffer = await generateCoursePDF(course, iscrizioniRows);
            archive.append(pdfBuffer, { 
                name: `${sanitizeFilename(course.nome)}_iscrizioni.pdf` 
            });
        }

        // Finalize the archive
        archive.finalize();

        // Convert the stream to a Response
        return new Response(
            new ReadableStream({
                start(controller) {
                    outputStream.on('data', (chunk) => controller.enqueue(chunk));
                    outputStream.on('end', () => controller.close());
                    outputStream.on('error', (err) => controller.error(err));
                }
            }), {
                headers: {
                    'Content-Type': 'application/zip',
                    'Content-Disposition': 'attachment; filename="iscrizioni_corsi.zip"'
                }
            }
        );

    } catch (error) {
        console.error(error);
        return json({ 
            success: false, 
            message: "Error generating PDFs" 
        }, { status: 500 });
    }
}
