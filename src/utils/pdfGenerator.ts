import { jsPDF } from 'jspdf';
import { ScoutPlayer, TacticalSetup, TacticalPlayer } from '../types';

const DEFAULT_CLUB_CRESTS: Record<string, string> = {};

// Helper to get image as Base64 with CORS handling
function getBase64ImageFromUrl(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataURL);
        } else {
          resolve(null);
        }
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = url;
  });
}

export async function exportPlayerToPDF(player: ScoutPlayer) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  let y = 15;

  // Helper to add footer page numbering and signature area
  function addPageFooter(pageNumber: number) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Ficha de Scouting Oficial - Preselección Nacional | Generado el ${new Date().toLocaleDateString('es-ES')}`,
      15,
      pageHeight - 12
    );
    doc.text(`Página ${pageNumber}`, pageWidth - 25, pageHeight - 12);
    // Draw a thin borderline
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(15, pageHeight - 16, pageWidth - 15, pageHeight - 16);
  }

  // Header Bar background (Navy Blue / Slate accent)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(15, y, pageWidth - 30, 26, 'F');

  // RFEF/National style Accent Strip (Emerald Green)
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(15, y + 26, pageWidth - 30, 2, 'F');

  // Header Texts
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('DIRECCIÓN DE SCOUTING & PRESELECCIÓN RECTORA', 22, y + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('INFORME TÉCNICO INDIVIDUAL DE RENDIMIENTO DEPORTIVO', 22, y + 15);
  doc.text(`Expediente ID: ${player.id} - Confidencial para Cuerpo Técnico`, 22, y + 20);

  y += 38;

  // --- SECTION 1: IDENTITY BOX ---
  // Try loading player photo
  const photoBase64 = await getBase64ImageFromUrl(player.photo).catch(() => null);

  // Try loading club crest photo
  const showCrest = player.currentClub && player.currentClub !== 'Agente Libre';
  const crestUrl = showCrest ? (player.clubCrestUrl || DEFAULT_CLUB_CRESTS[player.currentClub] || '') : '';
  const crestBase64 = crestUrl ? await getBase64ImageFromUrl(crestUrl).catch(() => null) : null;

  doc.setFillColor(248, 250, 252); // slate-50 background for details box
  doc.setDrawColor(226, 232, 240); // slate-200 boundary
  doc.setLineWidth(0.3);
  doc.rect(15, y, pageWidth - 30, 48, 'FD');

  // Draw Club Crest inside a subtle badge circle on the top right
  if (showCrest) {
    if (crestBase64) {
      try {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(203, 213, 225); // slate-300
        doc.setLineWidth(0.2);
        doc.circle(181, y + 11.5, 8, 'FD'); // circular container for club crest
        doc.addImage(crestBase64, 'JPEG', 175.5, y + 6, 11, 11);
      } catch (e) {
        // fallback empty outline if image format issue
      }
    } else {
      // Draw a fallback clean vector shield outline on top-right
      try {
        doc.setDrawColor(203, 213, 225); // slate-300
        doc.setLineWidth(0.3);
        // Draw small shield representing club logo
        doc.line(177, y + 5, 185, y + 5);
        doc.line(185, y + 5, 185, y + 12);
        doc.line(185, y + 12, 181, y + 17);
        doc.line(181, y + 17, 177, y + 12);
        doc.line(177, y + 12, 177, y + 5);
      } catch (e) {
        // ignore
      }
    }
  }

  if (photoBase64) {
    try {
      // Draw circular boundary or a clean frame for the picture
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.5);
      doc.rect(20, y + 4, 32, 40, 'D');
      doc.addImage(photoBase64, 'JPEG', 20.5, y + 4.5, 31, 39);
    } catch (e) {
      // Fallback circular monogram if drawing failed
      drawMonogramPlaceholder(doc, player, y + 4);
    }
  } else {
    drawMonogramPlaceholder(doc, player, y + 4);
  }

  // Player Basic Details Column (starts x=58)
  const xDetail = 58;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  const fullName = `${player.firstName} ${player.lastName}`.toUpperCase();
  doc.text(fullName, xDetail, y + 9);

  // Position specific badge label text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(16, 185, 129); // emerald text
  doc.text(`${player.positionFull} (${player.position})`, xDetail, y + 14);

  // Row of details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600

  doc.setFont('helvetica', 'bold');
  doc.text('EDAD:', xDetail, y + 22);
  doc.setFont('helvetica', 'normal');
  doc.text(`${player.age} años`, xDetail + 14, y + 22);

  doc.setFont('helvetica', 'bold');
  doc.text('CLUB ACTUAL:', xDetail + 45, y + 22);
  doc.setFont('helvetica', 'normal');
  doc.text(player.currentClub || 'Agente Libre', xDetail + 77, y + 22);

  doc.setFont('helvetica', 'bold');
  doc.text('LATERAL:', xDetail, y + 28);
  doc.setFont('helvetica', 'normal');
  doc.text(player.preferredFoot, xDetail + 20, y + 28);

  doc.setFont('helvetica', 'bold');
  doc.text('NACIONALIDAD:', xDetail + 45, y + 28);
  doc.setFont('helvetica', 'normal');
  doc.text(player.nationality || 'Española', xDetail + 77, y + 28);

  // Rating Badge Container within details box
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.rect(xDetail, y + 33, pageWidth - 30 - 48, 11, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('VALORACIÓN DEL SCOUT GRUPO ELITE:', xDetail + 4, y + 40);

  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129); // emerald green
  doc.text(`${player.rating.toFixed(1)} / 10`, xDetail + 82, y + 40);

  y += 56;

  // Track page numbers manually
  let pageNum = 1;
  addPageFooter(pageNum);

  // --- SECTION 2: ATTRIBUTE METRICS RATING ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('I. ANÁLISIS DE ATRIBUTOS CLAVE (KPI)', 15, y);

  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.4);
  doc.line(15, y + 2, 85, y + 2);

  y += 8;

  // Grid for attributes: 2 columns (Speed, Agility, Shooting, Defending, Passing, Physical)
  const attributes = [
    { label: 'Velocidad (Speed)', val: player.attributes?.speed ?? 75, icon: 'VEL' },
    { label: 'Agilidad (Agility)', val: player.attributes?.agility ?? 75, icon: 'AGI' },
    { label: 'Disparo (Shooting)', val: player.attributes?.shooting ?? 70, icon: 'DIS' },
    { label: 'Defensa (Defending)', val: player.attributes?.defending ?? 65, icon: 'DEF' },
    { label: 'Pase (Passing)', val: player.attributes?.passing ?? 70, icon: 'PAS' },
    { label: 'Físico (Physical)', val: player.attributes?.physical ?? 78, icon: 'FIS' }
  ];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);

  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    const isEven = i % 2 === 0;
    const xPos = isEven ? 18 : 110;
    const yOffset = Math.floor(i / 2) * 11;

    doc.setTextColor(71, 85, 105);
    doc.text(`${attr.icon} - ${attr.label.toUpperCase()}:`, xPos, y + yOffset + 4);

    doc.setTextColor(15, 23, 42);
    doc.text(`${attr.val}/100`, xPos + 58, y + yOffset + 4);

    // Draw visual progress bar background
    doc.setFillColor(226, 232, 240); // slate-200 track
    doc.rect(xPos + 2, y + yOffset + 6, 75, 2, 'F');

    // Draw value progress bar
    if (attr.val >= 85) {
      doc.setFillColor(16, 185, 129); // Emerald for elite
    } else if (attr.val >= 70) {
      doc.setFillColor(14, 165, 233); // Sky blue for high
    } else {
      doc.setFillColor(100, 116, 139); // Gray
    }
    doc.rect(xPos + 2, y + yOffset + 6, (75 * attr.val) / 100, 2, 'F');
  }

  y += 38;

  // --- SECTION 3: CORE CAMPAIGN STATISTICS ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('II. ESTADÍSTICAS GENERALES DE CAMPAÑA', 15, y);

  doc.setLineWidth(0.4);
  doc.line(15, y + 2, 90, y + 2);

  y += 8;

  // Draw statistics layout box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, y, pageWidth - 30, 28, 'FD');

  const statsList = [
    { title: 'GOLES', value: player.stats?.goals ?? 0 },
    { title: 'ASISTENCIAS', value: player.stats?.assists ?? 0 },
    { title: 'MINUTOS JUGADOS', value: `${player.stats?.minutesPlayed ?? 0}'` },
    { title: 'EFICACIA PASE', value: `${player.stats?.passesAccuracy ?? 84}%` },
    { title: 'ENTRADAS / TACKLES', value: player.stats?.tackles ?? 0 },
    { title: 'PASES REALIZADOS', value: player.stats?.passes ?? 0 },
    { title: 'AMARILLAS / ROJAS', value: `${player.stats?.cardsYellow ?? 0} / ${player.stats?.cardsRed ?? 0}` }
  ];

  doc.setFontSize(8);
  for (let idx = 0; idx < statsList.length; idx++) {
    const item = statsList[idx];
    const column = idx % 4;
    const row = Math.floor(idx / 4);
    const xPos = 20 + column * 44;
    const yOffset = row * 12;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(item.title, xPos, y + yOffset + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(String(item.value), xPos, y + yOffset + 10);
    doc.setFontSize(8);
  }

  y += 36;

  // Calculated KPIs per 90'
  const minPlayed = player.stats?.minutesPlayed ?? 0;
  const goals90 = minPlayed > 0 ? (((player.stats?.goals ?? 0) * 90) / minPlayed).toFixed(2) : '0.00';
  const assists90 = minPlayed > 0 ? (((player.stats?.assists ?? 0) * 90) / minPlayed).toFixed(2) : '0.00';

  doc.setFillColor(240, 253, 250); // green-50
  doc.setDrawColor(204, 251, 241); // green-100
  doc.rect(15, y, pageWidth - 30, 11, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('MÉTRICAS ESTIMATIVAS DE PRODUCTIVIDAD (CADA 90 MINUTOS):', 20, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(`GOLES x90: ${goals90} | ASISTENCIAS x90: ${assists90} | CONTRIBUCIÓN DIRECTA: ${Number(player.stats?.goals ?? 0) + Number(player.stats?.assists ?? 0)} PAC`, 108, y + 7);

  y += 18;

  // --- SECTION 4: INITIAL SCOUT REPORT AND FOLLOW-UP LOGS ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('III. INFORME TÁCTICO INICIAL Y SEGUIMIENTO', 15, y);

  doc.setLineWidth(0.4);
  doc.line(15, y + 2, 92, y + 2);

  y += 8;

  // Initial Notes Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, y, pageWidth - 30, 18, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('OBSERVACIONES DE CAPTACIÓN INICIAL:', 19, y + 5);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  // Wrap text smoothly to prevent overflow
  const wrappedNotes = doc.splitTextToSize(player.notes || 'Ninguna observación redactada.', pageWidth - 42);
  doc.text(wrappedNotes, 19, y + 10);

  y += 24;

  // Check if y is getting too high for remaining comments
  if (y > 230) {
    doc.addPage();
    pageNum++;
    y = 20;
    addPageFooter(pageNum);
  }

  // Follow-up continuous timeline logs
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('BITÁCORA DE SEGUIMIENTO TEMPORAL Y COMENTARIOS DEL STAFF:', 15, y);
  y += 6;

  if (player.followUpHistory && player.followUpHistory.length > 0) {
    for (const log of player.followUpHistory) {
      if (y > 260) {
        doc.addPage();
        pageNum++;
        y = 20;
        addPageFooter(pageNum);
      }

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(241, 245, 249);
      doc.rect(15, y, pageWidth - 30, 14, 'FD');

      // Date + Author Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(16, 185, 129); // emerald
      doc.text(`FECHA: ${log.date}`, 19, y + 5);

      doc.setTextColor(71, 85, 105);
      doc.text(`POR: ${log.author.toUpperCase()}`, pageWidth - 90, y + 5);

      // Note text wrapper
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      const wrappedLogText = doc.splitTextToSize(`"${log.note}"`, pageWidth - 40);
      doc.text(wrappedLogText, 19, y + 10);

      y += 18;
    }
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Ningún informe adicional registrado en la bitácora de seguimiento continuo.', 18, y + 3);
    y += 10;
  }

  // Add pages depending on tables
  if (y > 210) {
    doc.addPage();
    pageNum++;
    y = 20;
    addPageFooter(pageNum);
  } else {
    y += 4;
  }

  // --- SECTION 5: REGISTERED HISTORIC MATCHES ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('IV. HISTORIAL DE PARTIDOS REGISTRADOS', 15, y);

  doc.setLineWidth(0.4);
  doc.line(15, y + 2, 88, y + 2);

  y += 8;

  const matches = player.matchHistory ?? [];

  if (matches.length > 0) {
    // Draw Table Header
    doc.setFillColor(15, 23, 42); // slate-900 background
    doc.rect(15, y, pageWidth - 30, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('FECHA', 18, y + 5);
    doc.text('OPONENTE RIVAL', 38, y + 5);
    doc.text('COMPETICIÓN', 75, y + 5);
    doc.text('MIN', 125, y + 5);
    doc.text('G/A', 137, y + 5);
    doc.text('NOTA PARTIDO', 155, y + 5);
    doc.text('COMENTARIO', 178, y + 5);

    y += 7;

    for (let mIdx = 0; mIdx < matches.length; mIdx++) {
      if (y > 265) {
        doc.addPage();
        pageNum++;
        y = 20;
        addPageFooter(pageNum);

        // Re-draw Table Header
        doc.setFillColor(15, 23, 42);
        doc.rect(15, y, pageWidth - 30, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text('FECHA', 18, y + 5);
        doc.text('OPONENTE RIVAL', 38, y + 5);
        doc.text('COMPETICIÓN', 75, y + 5);
        doc.text('MIN', 125, y + 5);
        doc.text('G/A', 137, y + 5);
        doc.text('NOTA PARTIDO', 155, y + 5);
        doc.text('COMENTARIO', 178, y + 5);
        y += 7;
      }

      const match = matches[mIdx];
      
      // Alternate row backgrounds
      if (mIdx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(15, y, pageWidth - 30, 9, 'F');

      // Borders
      doc.setDrawColor(230, 235, 242);
      doc.setLineWidth(0.15);
      doc.line(15, y + 9, pageWidth - 15, y + 9);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);

      doc.text(match.date || 'N/A', 18, y + 6);
      
      doc.setFont('helvetica', 'bold');
      doc.text(match.opponent.toUpperCase(), 38, y + 6);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(match.competition || 'LaLiga', 75, y + 6);

      doc.text(`${match.minutes}'`, 125, y + 6);
      doc.text(`${match.goals ?? 0}g / ${match.assists ?? 0}a`, 137, y + 6);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(match.rating >= 8.0 ? 16 : 71, match.rating >= 8.0 ? 185 : 85, match.rating >= 8.0 ? 129 : 105);
      doc.text(`${match.rating.toFixed(1)}/10`, 155, y + 6);

      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 116, 139);
      const shortNotes = match.notes ? (match.notes.length > 20 ? match.notes.substring(0, 17) + '...' : match.notes) : '-';
      doc.text(shortNotes, 178, y + 6);

      y += 9;
    }
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Ningún partido de seguimiento registrado oficialmente.', 18, y + 3);
    y += 10;
  }

  // Let's add the signature block or medic list
  if (y > 218) {
    doc.addPage();
    pageNum++;
    y = 20;
    addPageFooter(pageNum);
  } else {
    y += 10;
  }

  // --- SECTION 6: INJURIES & CLINICAL REPORT ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('V. HISTORIAL CLINICO DE LESIONES (MÉDICO)', 15, y);

  doc.setLineWidth(0.4);
  doc.line(15, y + 2, 95, y + 2);

  y += 8;

  const injuries = player.injuryHistory ?? [];

  if (injuries.length > 0) {
    // Draw Table Header
    doc.setFillColor(15, 23, 42); // slate-900 background
    doc.rect(15, y, pageWidth - 30, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('FECHA BAJA', 18, y + 5);
    doc.text('DIAGNÓSTICO CLINICO', 44, y + 5);
    doc.text('DURACIÓN PREVISTA', 105, y + 5);
    doc.text('GRAVEDAD', 145, y + 5);
    doc.text('ESTADO ACTUAL', 172, y + 5);

    y += 7;

    for (let iIdx = 0; iIdx < injuries.length; iIdx++) {
      if (y > 265) {
        doc.addPage();
        pageNum++;
        y = 20;
        addPageFooter(pageNum);

        doc.setFillColor(15, 23, 42);
        doc.rect(15, y, pageWidth - 30, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text('FECHA BAJA', 18, y + 5);
        doc.text('DIAGNÓSTICO CLINICO', 44, y + 5);
        doc.text('DURACIÓN PREVISTA', 105, y + 5);
        doc.text('GRAVEDAD', 145, y + 5);
        doc.text('ESTADO ACTUAL', 172, y + 5);
        y += 7;
      }

      const injury = injuries[iIdx];

      if (iIdx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(15, y, pageWidth - 30, 9, 'F');

      doc.setDrawColor(230, 235, 242);
      doc.setLineWidth(0.15);
      doc.line(15, y + 9, pageWidth - 15, y + 9);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);

      doc.text(injury.date || 'N/A', 18, y + 6);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(190, 24, 74); // dark pink/red for diagnoses
      doc.text(injury.type.toUpperCase(), 44, y + 6);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(injury.duration || 'N/A', 105, y + 6);

      // Severity styling text
      doc.setFont('helvetica', 'bold');
      if (injury.severity === 'Alta') {
        doc.setTextColor(220, 38, 38); // red
        doc.text('Grave (Alta)', 145, y + 6);
      } else if (injury.severity === 'Media') {
        doc.setTextColor(217, 119, 6); // yellow-600
        doc.text('Soportable', 145, y + 6);
      } else {
        doc.setTextColor(16, 185, 129); // green
        doc.text('Precaución', 145, y + 6);
      }

      // Status styling
      if (injury.status === 'Disponible') {
        doc.setTextColor(16, 185, 129); // emerald
        doc.text('DISPONIBLE', 172, y + 6);
      } else if (injury.status === 'Recuperación') {
        doc.setTextColor(217, 119, 6); // amber
        doc.text('READAPTACIÓN', 172, y + 6);
      } else {
        doc.setTextColor(220, 38, 38); // red
        doc.text('LESIONADO', 172, y + 6);
      }

      y += 9;
    }
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Historial médico nacional impecable. Ninguna lesión traumática activa registrada.', 18, y + 3);
    y += 10;
  }

  // Bottom Signature Block at the absolute end of the PDF
  if (y > 230) {
    doc.addPage();
    pageNum++;
    y = 20;
    addPageFooter(pageNum);
  } else {
    y += 10;
  }

  // Draw final structural decorative layout signature box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, y, pageWidth - 30, 24, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('FIRMAS RESPONSABLES DE REPORTE Y AVAL DE SEGUIMIENTO TÉCNICO:', 20, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Coordinador de Scouting y Captación', 20, y + 16);
  doc.text('Director Técnico General de Selecciones', pageWidth / 2 + 10, y + 16);

  // Sign lines
  doc.setLineWidth(0.2);
  doc.setDrawColor(148, 163, 184);
  doc.line(20, y + 13, 75, y + 13);
  doc.line(pageWidth / 2 + 10, y + 13, pageWidth - 25, y + 13);

  addPageFooter(pageNum);

  // Save Document with customized local file name
  const formattedFileName = `INFORME_SCOUT_${player.lastName.toUpperCase()}_${player.firstName.toUpperCase()}.pdf`;
  doc.save(formattedFileName);
}

// Draw professional vector circle moniker placeholder for CORS issues or blank user photographs
function drawMonogramPlaceholder(doc: jsPDF, player: ScoutPlayer, yPos: number) {
  const init = `${player.firstName.charAt(0)}${player.lastName.charAt(0)}`.toUpperCase();
  
  // Outer circle with golden or green ring
  doc.setFillColor(15, 23, 42); // slate navy background
  doc.setDrawColor(16, 185, 129); // emerald green ring boundary
  doc.setLineWidth(0.8);
  doc.circle(36, yPos + 20, 16, 'FD');

  // Text inside
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(init, 31, yPos + 21.5);
}

// Convert Hex colors safely to RGB
function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return [isNaN(r) ? 16 : r, isNaN(g) ? 185 : g, isNaN(b) ? 129 : b];
}

export async function exportTacticsToPDF(tactic: TacticalSetup) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  let y = 15;

  // Header Bar background (Navy Blue / Slate accent)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(15, y, pageWidth - 30, 24, 'F');

  // Emerald green accent strip
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(15, y + 24, pageWidth - 30, 1.5, 'F');

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('DIRECCIÓN TÉCNICA - RFFPA ANALYTICS BOARD', 22, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`PIZARRA TÁCTICA Y SISTEMA DE CAMPAÑA: ${tactic.name.toUpperCase()}`, 22, y + 14);
  doc.text(`Exportación Confidencial para Analistas y Scouting Local`, 22, y + 18);

  y += 34;

  // --- SECTION: TACTIC OVERVIEW BLOCK ---
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.rect(15, y, pageWidth - 30, 20, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('I. AJUSTES GENERALES DEL ESQUEMA', 20, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // slate-600

  doc.text('SISTEMA TÁCTICO:', 20, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // emerald
  doc.text(tactic.formation || '4-3-3', 49, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('COLOR EQUIPO:', 80, y + 13);
  doc.setFillColor(...hexToRgb(tactic.teamColor || '#10B981'));
  doc.circle(104, y + 12.5, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text(tactic.teamColor.toUpperCase(), 108, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('COLOR RIVAL:', 138, y + 13);
  doc.setFillColor(...hexToRgb(tactic.opponentColor || '#EF4444'));
  doc.circle(160, y + 12.5, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text(tactic.opponentColor.toUpperCase(), 164, y + 13);

  y += 28;

  // --- SECTION: SOCCER PITCH DRAWING ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('II. MAPA DE DISTRIBUCIÓN Y POSICIONAMIENTO EN EL CAMPO', 15, y);

  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.4);
  doc.line(15, y + 1.5, 122, y + 1.5);

  y += 6;

  // Let's draw the actual soccer pitch
  const pitchX = 15;
  const pitchY = y;
  const pitchWidth = 180; // Full printable width
  const pitchHeight = 120; // 3:2 aspect ratio is perfect for landscape pitch inside portrait page

  // Draw Field Background
  doc.setFillColor(15, 46, 31); // Dark soccer green background
  doc.setDrawColor(4, 120, 87); // emerald-700
  doc.setLineWidth(0.5);
  doc.rect(pitchX, pitchY, pitchWidth, pitchHeight, 'FD');

  // Draw Boundary markings (White color)
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.3);
  // Outer Box (offset by 3mm inside)
  const pad = 4;
  doc.rect(pitchX + pad, pitchY + pad, pitchWidth - pad * 2, pitchHeight - pad * 2, 'D');

  // Mid-field separator
  doc.line(pitchX + pitchWidth / 2, pitchY + pad, pitchX + pitchWidth / 2, pitchY + pitchHeight - pad);

  // Center Circle
  doc.circle(pitchX + pitchWidth / 2, pitchY + pitchHeight / 2, 16, 'D');
  doc.circle(pitchX + pitchWidth / 2, pitchY + pitchHeight / 2, 0.8, 'FD'); // Spot

  // Left Penalty Box
  doc.rect(pitchX + pad, pitchY + pitchHeight / 2 - 22, 24, 44, 'D'); // Big Box
  doc.rect(pitchX + pad, pitchY + pitchHeight / 2 - 9, 8, 18, 'D'); // Short Box
  doc.circle(pitchX + pad + 18, pitchY + pitchHeight / 2, 0.8, 'FD'); // Penalty Spot
  // arc
  // draw path is tricky so we display simple circle segment
  
  // Right Penalty Box
  doc.rect(pitchX + pitchWidth - pad - 24, pitchY + pitchHeight / 2 - 22, 24, 44, 'D'); // Big Box
  doc.rect(pitchX + pitchWidth - pad - 8, pitchY + pitchHeight / 2 - 9, 8, 18, 'D'); // Short Box
  doc.circle(pitchX + pitchWidth - pad - 18, pitchY + pitchHeight / 2, 0.8, 'FD'); // Penalty Spot

  // Draw Players on the pitch!
  // Map x and y from coordinates (percentages) to drawing area
  const players = tactic.players ?? [];

  for (const player of players) {
    // Normalizing player.x & player.y from relative percentage to mapped coordinates
    // We want some margin padding so that players aren't drawn strictly onto the border line
    const mappedX = pitchX + pad + (player.x / 100) * (pitchWidth - pad * 2);
    const mappedY = pitchY + pad + (player.y / 100) * (pitchHeight - pad * 2);

    // Circle background based on IsOpponent
    const color = player.isOpponent ? tactic.opponentColor : tactic.teamColor;
    const [r, g, b] = hexToRgb(color);

    // Draw player shadow/glow ring
    doc.setFillColor(r, g, b);
    doc.setDrawColor(255, 255, 255); // White border
    doc.setLineWidth(0.4);
    doc.circle(mappedX, mappedY, 3.8, 'FD');

    // Number text inside
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(String(player.number), mappedX, mappedY + 1, { align: 'center' });

    // Player name/role popover description
    doc.setFillColor(15, 23, 42); // slate dark background text box
    doc.setDrawColor(71, 85, 105); // slate-600 border
    doc.setLineWidth(0.15);
    
    // Short role tag abbreviation or short name
    const textLabel = player.name || player.roleName || String(player.number);
    const labelWidth = doc.getTextWidth(textLabel) + 3;
    
    doc.rect(mappedX - labelWidth / 2, mappedY + 4.5, labelWidth, 4.2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(255, 255, 255);
    doc.text(textLabel, mappedX, mappedY + 7.5, { align: 'center' });
  }

  y += pitchHeight + 8;

  // --- SECTION: TACTICAL CONSIGNAS / NOTES ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('III. CONSIGNAS E INSTRUCCIONES LOGÍSTICAS DE JUEGO', 15, y);

  doc.setLineWidth(0.4);
  doc.line(15, y + 1.5, 120, y + 1.5);

  y += 6;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, y, pageWidth - 30, 32, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('INSTRUCCIONES CLAVE REDACTADAS POR EL PREPARADOR:', 19, y + 5);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const notesWrapped = doc.splitTextToSize(tactic.notes || 'Ninguna consigna o instrucción táctica adicional ha sido documentada en esta pizarra.', pageWidth - 42);
  doc.text(notesWrapped, 19, y + 10);

  y += 42;

  // --- FOOTER AND SIGNATURE ---
  // Page number footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Sistema de Captación y Pizarra Táctica Oficial | Generado el ${new Date().toLocaleDateString('es-ES')}`,
    15,
    pageHeight - 12
  );
  doc.text('Página 1', pageWidth - 25, pageHeight - 12);
  
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(15, pageHeight - 16, pageWidth - 15, pageHeight - 16);

  // Signatures
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, y, pageWidth - 30, 24, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('AUTORIZACIÓN Y AVAL DEL SISTEMA TÁCTICO DE SELECCIÓN:', 20, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Entrenador / Seleccionador Oficial', 20, y + 16);
  doc.text('Coordinador Técnico General RFFPA', pageWidth / 2 + 10, y + 16);

  doc.setLineWidth(0.2);
  doc.setDrawColor(148, 163, 184);
  doc.line(20, y + 13, 75, y + 13);
  doc.line(pageWidth / 2 + 10, y + 13, pageWidth - 25, y + 13);


  // Save PDF Document
  const formattedFileName = `PIZARRA_TACTICA_${tactic.name.replace(/\s+/g, '_').toUpperCase()}.pdf`;
  doc.save(formattedFileName);
}
