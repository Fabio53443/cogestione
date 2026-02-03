import { json } from '@sveltejs/kit';
import { isAdmin } from '$lib/isAdmin';
import { db } from '$lib/db/db';
import { studenti, iscrizioni, corsi } from '$lib/db/models';
import { eq, and } from 'drizzle-orm';
import { getConfig } from '$lib/config';
import PDFDocument from 'pdfkit';

export async function GET({ url, locals }) {
  if (!(await isAdmin(locals))) {
    return json({ success: false, message: 'Non autorizzato.' }, { status: 401 });
  }

  const classe = url.searchParams.get('classe');
  const dayParam = url.searchParams.get('day');

  if (!classe) {
    return json({ success: false, message: 'Classe non specificata.' }, { status: 400 });
  }

  try {
    const config = await getConfig();
    const enabledDays = config.days.filter(d => d.enabled).sort((a, b) => a.id - b.id);
    const enabledHours = config.hours.filter(h => h.enabled).sort((a, b) => a.id - b.id);

    // Get students in this class
    const classStudents = await db.select({
      id: studenti.id,
      nomeCompleto: studenti.nomeCompleto,
      email: studenti.email,
    })
    .from(studenti)
    .where(classe === 'N/A' ? eq(studenti.classe, null) : eq(studenti.classe, classe));

    if (classStudents.length === 0) {
      return json({ success: false, message: 'Nessuno studente trovato in questa classe.' }, { status: 404 });
    }

    // Get all enrollments for these students
    const studentIds = classStudents.map(s => s.id);
    
    // Build attendance data for each student
    const attendanceData = [];
    
    for (const student of classStudents) {
      const studentEnrollments = await db.select({
        ora: iscrizioni.ora,
        giorno: iscrizioni.giorno,
        presente: iscrizioni.presente,
        corsoNome: corsi.nome,
      })
      .from(iscrizioni)
      .leftJoin(corsi, eq(iscrizioni.idCorso, corsi.id))
      .where(eq(iscrizioni.idStudente, student.id));

      attendanceData.push({
        student,
        enrollments: studentEnrollments
      });
    }

    // Filter by day if specified
    const daysToInclude = dayParam !== null 
      ? enabledDays.filter(d => d.id === parseInt(dayParam))
      : enabledDays;

    // Create PDF
    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 40,
      bufferPages: true
    });

    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));

    // Title
    doc.fontSize(18).font('Helvetica-Bold')
      .text(`Presenze Classe ${classe}`, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica')
      .text(`${config.schoolName} - ${config.eventName}`, { align: 'center' });
    doc.moveDown(1);

    // For each day
    for (const day of daysToInclude) {
      doc.fontSize(14).font('Helvetica-Bold')
        .text(day.name, { underline: true });
      doc.moveDown(0.5);

      // Table header
      const tableTop = doc.y;
      const colWidths = {
        nome: 150,
        ore: (doc.page.width - 80 - 150) / enabledHours.length
      };

      // Draw header
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Studente', 40, tableTop, { width: colWidths.nome });
      
      let xPos = 40 + colWidths.nome;
      for (let hourIndex = 0; hourIndex < enabledHours.length; hourIndex++) {
        const hour = enabledHours[hourIndex];
        doc.text(hour.label.replace(' ora', '°'), xPos, tableTop, { 
          width: colWidths.ore, 
          align: 'center' 
        });
        xPos += colWidths.ore;
      }

      doc.moveDown(0.3);
      let yPos = doc.y;

      // Draw line under header
      doc.moveTo(40, yPos).lineTo(doc.page.width - 40, yPos).stroke();
      yPos += 5;

      // Draw rows
      doc.font('Helvetica').fontSize(8);
      
      for (const { student, enrollments } of attendanceData.sort((a, b) => 
        a.student.nomeCompleto.localeCompare(b.student.nomeCompleto)
      )) {
        // Check if we need a new page
        if (yPos > doc.page.height - 60) {
          doc.addPage();
          yPos = 40;
        }

        doc.text(student.nomeCompleto, 40, yPos, { width: colWidths.nome });
        
        xPos = 40 + colWidths.nome;
        for (let hourIndex = 0; hourIndex < enabledHours.length; hourIndex++) {
          // Match by the index position (ora) and day
          const enrollment = enrollments.find(e => e.giorno === day.id && e.ora === hourIndex);
          let status = '-';
          if (enrollment) {
            if (enrollment.presente === true) {
              status = 'P';
            } else if (enrollment.presente === false) {
              status = 'A';
            } else {
              status = '?';
            }
          }
          doc.text(status, xPos, yPos, { width: colWidths.ore, align: 'center' });
          xPos += colWidths.ore;
        }
        
        yPos += 15;
      }

      doc.y = yPos;
      doc.moveDown(1);

      // Add page break between days (except for last day)
      if (daysToInclude.indexOf(day) < daysToInclude.length - 1) {
        doc.addPage();
      }
    }

    // Legend
    doc.moveDown(1);
    doc.fontSize(8).font('Helvetica')
      .text('Legenda: \nP = Presente, \nA = Assente, \n? = Non registrato, \n- = Non iscritto', { align: 'left' });

      // aggiungi data generazione
    doc.moveDown(2);
    const generationDate = new Date();
    const formattedDate = generationDate.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    doc.fontSize(8).font('Helvetica-Oblique')
      .text(`Generato il: ${formattedDate}`, { align: 'left' });
    // Finalize PDF
    doc.end();

    // Wait for PDF to finish
    await new Promise(resolve => doc.on('end', resolve));

    const pdfBuffer = Buffer.concat(chunks);

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="presenze_${classe}${dayParam !== null ? `_giorno${parseInt(dayParam) + 1}` : ''}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return json({ success: false, message: 'Errore durante la generazione del PDF.' }, { status: 500 });
  }
}
