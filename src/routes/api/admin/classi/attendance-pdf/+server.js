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
      sdo: studenti.sdo,
      note: studenti.note,
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

    // Helper function to draw legend
    function drawLegend() {
      doc.moveDown(1.5);
      
      const boxX = 40;
      const boxY = doc.y;
      const boxWidth = doc.page.width - 80;
      const boxHeight = 38;
      const boxRadius = 4;
      
      // Draw background rectangle with dashed stroke
      doc.save();
      doc.roundedRect(boxX, boxY, boxWidth, boxHeight, boxRadius)
         .fill('#f0f0f0');
      doc.roundedRect(boxX, boxY, boxWidth, boxHeight, boxRadius)
         .dash(3, { space: 2 })
         .lineWidth(1)
         .stroke('#999999');
      doc.restore();
      
      // "Legenda" title centred
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#333333');
      doc.text('Legenda', boxX, boxY + 5, { width: boxWidth, align: 'center' });
      
      // Legend items row
      const itemsY = boxY + 20;
      const legendItems = [
        { label: 'P = Presente', color: '#22c55e' },
        { label: 'A = Assente', color: '#ef4444' },
        { label: '? = Non registrato', color: '#eab308' },
        { label: '- = Non iscritto', color: '#6b7280' }
      ];
      
      const totalItemsWidth = legendItems.length * 95;
      let legendX = boxX + (boxWidth - totalItemsWidth) / 2;
      
      for (const item of legendItems) {
        doc.save();
        doc.circle(legendX + 4, itemsY + 3, 4).fill(item.color);
        doc.restore();
        doc.fillColor('#333333').fontSize(7).font('Helvetica');
        doc.text(item.label, legendX + 12, itemsY, { continued: false });
        doc.y = itemsY;
        legendX += 95;
      }
      
      doc.y = boxY + boxHeight + 5;
    }

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
        if (yPos > doc.page.height - 80) {
          doc.addPage();
          yPos = 40;
        }

        doc.fillColor('black');
        doc.text(student.nomeCompleto, 40, yPos, { width: colWidths.nome, continued: false, lineBreak: false });
        
        // Show SdO badge next to name
        if (student.sdo) {
          const nameWidth = doc.widthOfString(student.nomeCompleto);
          const badgeX = 40 + Math.min(nameWidth + 4, colWidths.nome - 25);
          doc.save();
          doc.roundedRect(badgeX, yPos - 1, 22, 11, 2).fill('#7c3aed');
          doc.fontSize(6).font('Helvetica-Bold').fillColor('#ffffff');
          doc.text('SdO', badgeX + 2, yPos + 1, { width: 18, align: 'center', lineBreak: false });
          doc.restore();
          doc.font('Helvetica').fontSize(8);
        }
        
        xPos = 40 + colWidths.nome;
        for (let hourIndex = 0; hourIndex < enabledHours.length; hourIndex++) {
          // Match by the index position (ora) and day
          const enrollment = enrollments.find(e => e.giorno === day.id && e.ora === hourIndex);
          let status = '-';
          let bgColor = '#6b7280'; // gray
          let textColor = '#9ca3af';
          
          if (enrollment) {
            if (enrollment.presente === true) {
              status = 'P';
              bgColor = '#22c55e'; // green
              textColor = '#ffffff';
            } else if (enrollment.presente === false) {
              status = 'A';
              bgColor = '#ef4444'; // red
              textColor = '#ffffff';
            } else {
              status = '?';
              bgColor = '#eab308'; // yellow
              textColor = '#ffffff';
            }
          }
          
          // Draw colored circle background
          const cellCenterX = xPos + colWidths.ore / 2;
          const cellCenterY = yPos + 4;
          const circleRadius = 6;
          
          doc.save();
          doc.circle(cellCenterX, cellCenterY, circleRadius)
             .fill(bgColor);
          doc.restore();
          
          // Draw status text centered on circle
          doc.fillColor(textColor);
          doc.fontSize(7).font('Helvetica-Bold');
          doc.text(status, xPos, yPos + 1, { width: colWidths.ore, align: 'center' });
          doc.font('Helvetica').fontSize(8);
          
          xPos += colWidths.ore;
        }
        
        // Reset fill color for next row
        doc.fillColor('black');

        // Show note if present (tight under the name)
        if (student.note) {
          yPos += 12;
          if (yPos > doc.page.height - 80) {
            doc.addPage();
            yPos = 40;
          }
          doc.save();
          doc.fontSize(6).font('Helvetica-Oblique').fillColor('#6b7280');
          const noteWidth = colWidths.nome - 12;
          const noteStr = `Nota: ${student.note}`;
          doc.text(noteStr, 52, yPos, { width: noteWidth, lineBreak: true });
          const noteHeight = doc.heightOfString(noteStr, { width: noteWidth });
          doc.restore();
          doc.font('Helvetica').fontSize(8);
          yPos += noteHeight + 3;
        } else {
          yPos += 15;
        }
      }

      doc.y = yPos;
      
      // Draw legend after each table
      drawLegend();
      
      doc.moveDown(0.5);

      // Add page break between days (except for last day)
      if (daysToInclude.indexOf(day) < daysToInclude.length - 1) {
        doc.addPage();
      }
    }

    // aggiungi data generazione
    doc.moveDown(1);
    const generationDate = new Date();
    const formattedDate = generationDate.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    doc.fontSize(8).font('Helvetica-Oblique').fillColor('black')
      .text(`Generato il: ${formattedDate}`, { align: 'left' });

    // Add page numbers and header to all pages
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      
      // Add class name header on pages after the first
      if (i == 0) {
        doc.save();
        doc.fontSize(9).font('Helvetica').fillColor('#999999');
        doc.text(
          `${i + 1} di ${totalPages}`,
          40,
          15,
          { width: doc.page.width - 80, align: 'right', lineBreak: false }
        );
        doc.restore();
      }
      // Add class name header on pages after the first
      if (i > 0) {
        doc.save();
        doc.fontSize(9).font('Helvetica').fillColor('#999999');
        doc.text(
          `Classe ${classe} - ${i + 1} di ${totalPages}`,
          40,
          15,
          { width: doc.page.width - 80, align: 'right', lineBreak: false }
        );
        doc.restore();
      }
    }

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
