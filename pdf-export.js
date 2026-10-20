// ============================================================
// PRC PPCR - PDF Export
// Generates a printable PDF matching the official form
// Includes interactive body map + print-friendly crop marks
// ============================================================

async function exportToPDF(reportData) {
  if (!window.jspdf) {
    alert('PDF library not loaded. Check your internet connection.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageW = 210;
  const pageH = 297;
  const margin = 10;
  let y = margin;

  // ---------- HELPERS ----------
  function newPageIfNeeded(space = 30) {
    if (y > pageH - space) { doc.addPage(); y = margin; }
  }

  function sectionHeader(title, rgb) {
    newPageIfNeeded(40);
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.rect(margin, y, pageW - margin * 2, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(title, margin + 2, y + 5);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    y += 9;
  }

  function field(label, value, x, width) {
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(label, x, y);
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    const val = value !== null && value !== undefined && value !== '' ? String(value) : '—';
    const lines = doc.splitTextToSize(val, width || 60);
    doc.text(lines, x, y + 4);
  }

  function checkbox(label, checked, x) {
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(x, y - 3, 3, 3);
    if (checked) {
      doc.setLineWidth(0.5);
      doc.line(x + 0.5, y - 1.5, x + 1.2, y - 0.5);
      doc.line(x + 1.2, y - 0.5, x + 2.5, y - 2.5);
    }
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.text(label, x + 4, y);
  }

  // ============================================================
  // BODY MAP RENDERER
  // ============================================================
  function drawBodyMap(injuredParts, offsetX, offsetY, widthMM) {
    const scale = widthMM / 200;
    const mapHeightMM = 400 * scale;

    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.setFont(undefined, 'bold');
    doc.text('Injured Body Map', offsetX, offsetY);
    doc.setFont(undefined, 'normal');

    const mapY = offsetY + 3;
    const px = (x) => offsetX + x * scale;
    const py = (yy) => mapY + yy * scale;
    const sz = (s) => s * scale;

    const parts = [
      { key: 'Head',      type: 'circle', cx: 100, cy: 40,  r: 25 },
      { key: 'Neck',      type: 'rect',   x: 90,  y: 65,  w: 20, h: 15, rx: 3 },
      { key: 'Chest',     type: 'rect',   x: 60,  y: 80,  w: 80, h: 60, rx: 5 },
      { key: 'Abdomen',   type: 'rect',   x: 65,  y: 140, w: 70, h: 50, rx: 5 },
      { key: 'Pelvis',    type: 'rect',   x: 70,  y: 190, w: 60, h: 30, rx: 5 },
      { key: 'Left Arm',  type: 'rect',   x: 25,  y: 80,  w: 30, h: 100, rx: 10 },
      { key: 'Right Arm', type: 'rect',   x: 145, y: 80,  w: 30, h: 100, rx: 10 },
      { key: 'Left Leg',  type: 'rect',   x: 70,  y: 220, w: 25, h: 120, rx: 8 },
      { key: 'Right Leg', type: 'rect',   x: 105, y: 220, w: 25, h: 120, rx: 8 },
    ];

    parts.forEach((p) => {
      const isInjured = Array.isArray(injuredParts) && injuredParts.includes(p.key);

      if (isInjured) {
        doc.setFillColor(220, 38, 38);
        doc.setDrawColor(153, 27, 27);
      } else {
        doc.setFillColor(229, 231, 235);
        doc.setDrawColor(156, 163, 175);
      }
      doc.setLineWidth(0.3);

      if (p.type === 'circle') {
        doc.circle(px(p.cx), py(p.cy), sz(p.r), 'FD');
      } else if (p.rx) {
        doc.roundedRect(px(p.x), py(p.y), sz(p.w), sz(p.h), sz(p.rx), sz(p.rx), 'FD');
      } else {
        doc.rect(px(p.x), py(p.y), sz(p.w), sz(p.h), 'FD');
      }
    });

    const legendY = mapY + mapHeightMM + 3;
    doc.setLineWidth(0.3);
    doc.setFillColor(229, 231, 235);
    doc.setDrawColor(156, 163, 175);
    doc.rect(offsetX, legendY, 3, 3, 'FD');
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text('Normal', offsetX + 5, legendY + 2.5);

    doc.setFillColor(220, 38, 38);
    doc.setDrawColor(153, 27, 27);
    doc.rect(offsetX + 22, legendY, 3, 3, 'FD');
    doc.text('Injured', offsetX + 27, legendY + 2.5);

    return mapHeightMM + 8;
  }

  // ============================================================
  // HEADER
  // ============================================================
  doc.setFillColor(220, 38, 38);
  doc.rect(0, 0, pageW, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('PHILIPPINE RED CROSS', margin, 9);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('National Headquarters, Bonifacio Drive, Port Area, Manila', margin, 14);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('PRE HOSPITAL PATIENT CARE REPORT (PPCR)', pageW - margin, 9, { align: 'right' });
  doc.setFontSize(8);
  doc.text(`Serial No: ${reportData.serial_no || '________'}`, pageW - margin, 15, { align: 'right' });
  y = 25;
  doc.setTextColor(0, 0, 0);

  // ============================================================
  // 1. INCIDENT
  // ============================================================
  sectionHeader('1. INCIDENT INFORMATION', [220, 38, 38]);
  const inc = reportData.incident_data || {};
  field('Nature of Call:', inc.nature_of_call, margin, 45);
  field('Type of Emergency:', inc.type_of_emergency, margin + 50, 45);
  field('Date/Time:', `${inc.call_date || ''} ${inc.call_time || ''}`, margin + 100, 45);
  field('Location:', inc.location, margin + 150, 40);
  y += 11;
  field('Mobile:', inc.mobile, margin, 45);
  field('At Scene:', inc.at_scene, margin + 50, 45);
  field('At Patient:', inc.at_patient, margin + 100, 45);
  field('Depart Scene:', inc.depart_scene, margin + 150, 40);
  y += 11;
  field('At Arrival:', inc.at_arrival, margin, 45);
  field('At Handover:', inc.at_handover, margin + 50, 45);
  field('Clear:', inc.clear_time, margin + 100, 45);
  field('Station:', inc.station_code, margin + 150, 40);
  y += 11;
  field('Ambulance Unit:', inc.ambulance_unit, margin, 45);
  field('Response Area:', inc.response_area, margin + 50, 45);
  field('Facility Type:', inc.facility_type, margin + 100, 45);
  y += 12;

  // ============================================================
  // 2. PATIENT
  // ============================================================
  sectionHeader('2. PATIENT INFORMATION', [37, 99, 235]);
  const pat = reportData.patient_data || {};
  field('Patient Name:', pat.name, margin, 80);
  field('Age:', pat.age, margin + 85, 20);
  field('Gender:', pat.gender, margin + 110, 25);
  field('Contact:', pat.contact, margin + 140, 50);
  y += 11;
  field('Address:', pat.address, margin, 130);
  field('NOK:', pat.nok, margin + 135, 50);
  y += 11;
  field('NOK Contact:', pat.nok_contact, margin, 80);
  field('Time of Onset:', pat.time_onset, margin + 85, 50);
  field('Date of Onset:', pat.date_onset, margin + 140, 50);
  y += 11;
  checkbox('Treatment Refused', pat.treatment_refused, margin);
  checkbox('Transport Refused', pat.transport_refused, margin + 45);
  checkbox('Treat at Scene', pat.treat_scene, margin + 90);
  checkbox('Stood Down', pat.stood_down, margin + 135);
  y += 12;

  // ============================================================
  // 3. PRIMARY SURVEY
  // ============================================================
  sectionHeader('3. PRIMARY SURVEY', [234, 88, 12]);
  const ps = reportData.primary_survey || {};
  doc.setFontSize(8);
  doc.text('C-Spine:', margin, y);
  checkbox('Suspected', ps.cspine === 'Suspected', margin + 20);
  checkbox('Not Indicated', ps.cspine === 'Not Indicated', margin + 55);
  y += 6;
  doc.text('Airway:', margin, y);
  checkbox('Clear', ps.airway === 'Clear', margin + 20);
  checkbox('Partial', ps.airway === 'Partially Obstructed', margin + 42);
  checkbox('Obstructed', ps.airway === 'Obstructed', margin + 78);
  y += 6;
  doc.text('Breathing:', margin, y);
  checkbox('Normal', ps.breathing === 'Normal', margin + 22);
  checkbox('Fast', ps.breathing === 'Fast', margin + 50);
  checkbox('Slow', ps.breathing === 'Slow', margin + 70);
  checkbox('Absent', ps.breathing === 'Absent', margin + 90);
  y += 6;
  doc.text('Pulse:', margin, y);
  checkbox('Present', ps.pulse === 'Present', margin + 20);
  checkbox('Absent', ps.pulse === 'Absent', margin + 50);
  checkbox('Haemorrhage', ps.pulse === 'Haemorrhage', margin + 78);
  y += 6;
  doc.text('Skin:', margin, y);
  checkbox('Normal', ps.skin === 'Normal', margin + 20);
  checkbox('Pale', ps.skin === 'Pale', margin + 50);
  checkbox('Flushed', ps.skin === 'Flushed', margin + 72);
  checkbox('Cyanosed', ps.skin === 'Cyanosed', margin + 98);
  y += 6;
  doc.text('Cap-Refill:', margin, y);
  checkbox('< 2 SEC', ps.caprefill === '< 2 SEC', margin + 25);
  checkbox('> 2 SEC', ps.caprefill === '> 2 SEC', margin + 58);
  y += 12;

  // ============================================================
  // 4. VITAL SIGNS
  // ============================================================
  sectionHeader('4. VITAL SIGNS', [5, 150, 105]);
  const vs = reportData.vital_signs || {};
  doc.autoTable({
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: [5, 150, 105], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    head: [['Observation', 'Time (1)', 'Time (2)', 'Time (3)']],
    body: [
      ['Pulse Rate & Rhythm', vs.pulse_1 || '', vs.pulse_2 || '', vs.pulse_3 || ''],
      ['Respiratory Rate', vs.rr_1 || '', vs.rr_2 || '', vs.rr_3 || ''],
      ['Respiratory Quality', vs.rq_1 || '', vs.rq_2 || '', vs.rq_3 || ''],
      ['SpO2', vs.spo2_1 || '', vs.spo2_2 || '', vs.spo2_3 || ''],
      ['Blood Pressure', vs.bp_1 || '', vs.bp_2 || '', vs.bp_3 || ''],
      ['Temperature', vs.temp_1 || '', vs.temp_2 || '', vs.temp_3 || ''],
      ['Pupils', vs.pupils_1 || '', vs.pupils_2 || '', vs.pupils_3 || ''],
      ['Pain Score', vs.pain_1 || '', vs.pain_2 || '', vs.pain_3 || ''],
      ['Blood Glucose', vs.bg_1 || '', vs.bg_2 || '', vs.bg_3 || ''],
      ['GCS (E/V/M/Total)', `${vs.gcs_eye || '-'}/${vs.gcs_verbal || '-'}/${vs.gcs_motor || '-'}/${vs.gcs_total || '-'}`, '', ''],
    ]
  });
  y = doc.lastAutoTable.finalY + 6;

  // ============================================================
  // 5. CARE MANAGEMENT
  // ============================================================
  sectionHeader('5. CARE MANAGEMENT', [147, 51, 234]);
  const cm = reportData.care_management || {};
  const cmList = cm.checked || [];

  const cmCols = [
    { title: 'Airway', items: ['Manoeuvre', 'Suction', 'Manual FB Clearance', 'OPA / NPA'] },
    { title: 'Breathing', items: ['Pocket Mask', 'BVM', 'Simple Facemask', 'NRB Mask', 'Nasal Cannula', 'SAO2 Monitoring'] },
    { title: 'Circulation', items: ['Chest Compression', 'Defibrillation', 'Haemorrhage Control'] },
    { title: 'Immobilization', items: ['Cervical Collar', 'Spinal Board', 'Rigid Splint', 'Traction Splint', 'SAM Splint', 'KED/Half Board'] },
    { title: 'Wound Care', items: ['Minor Injury TX', 'Bleeding Control', 'Cleaning/Disinfecting', 'Dressing'] },
    { title: 'Miscellaneous', items: ['Cold/Warm Compress', 'Positioning'] },
  ];

  const startY = y;
  cmCols.forEach((col, idx) => {
    const colX = margin + (idx % 3) * 65;
    const rowY = startY + Math.floor(idx / 3) * 32;
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text(col.title + ':', colX, rowY);
    doc.setFont(undefined, 'normal');
    col.items.forEach((item, i) => {
      const savedY = y;
      y = rowY + 5 + i * 4;
      checkbox(item, cmList.includes(item), colX);
      y = savedY;
    });
  });
  y += 70;

  // ============================================================
  // 6. PATIENT ASSESSMENT (WITH BODY MAP)
  // ============================================================
  if (y > pageH - 100) { doc.addPage(); y = margin; }
  sectionHeader('6. PATIENT ASSESSMENT & SECONDARY SURVEY', [13, 148, 136]);

  const pa = reportData.patient_assessment || {};
  const sample = reportData.sample_history || {};

  const sectionStartY = y;

  doc.setFontSize(8);
  doc.text('LOC Loss before Arrival:', margin, y);
  checkbox('Yes', pa.loc_loss === 'Yes', margin + 45);
  checkbox('No', pa.loc_loss === 'No', margin + 65);
  y += 6;
  doc.text('Consciousness upon Arrival:', margin, y);
  y += 4;
  checkbox('Alert', pa.loc_arrival === 'Alert', margin + 5);
  checkbox('Verbal', pa.loc_arrival === 'Verbal Response', margin + 25);
  checkbox('Painful', pa.loc_arrival === 'Painful Stimuli', margin + 50);
  checkbox('Unresponsive', pa.loc_arrival === 'Unresponsiveness', margin + 75);
  y += 8;

  field('Burn Classification:', pa.burn_class, margin, 40);
  field('Burn %:', pa.burn_percent, margin + 65, 30);
  y += 11;

  doc.setFontSize(8);
  doc.text('Injured Parts:', margin, y);
  y += 4;
  const partsText = (pa.injured_parts || []).join(', ') || 'None marked';
  const partsLines = doc.splitTextToSize(partsText, 90);
  doc.text(partsLines, margin, y);
  y += partsLines.length * 4 + 4;

  doc.setFont(undefined, 'bold');
  doc.text('Physical Exam Findings:', margin, y);
  doc.setFont(undefined, 'normal');
  y += 5;

  const examItems = ['B Burn', 'C Contusion', 'D Dislocation', 'F Fracture', 'N Numbness', 'P Pain', 'R Rash', 'S Swelling', 'W Wound'];
  const examStartY = y;
  examItems.forEach((item, i) => {
    const x = margin + (i % 5) * 38;
    const rowY = examStartY + Math.floor(i / 5) * 5;
    const savedY = y;
    y = rowY;
    checkbox(item, (pa.exam_findings || []).includes(item), x);
    y = savedY;
  });
  y += 12;

  const bodyMapX = margin + 148;
  const bodyMapY = sectionStartY;
  const bodyMapWidth = 38;
  const bodyMapHeight = drawBodyMap(pa.injured_parts || [], bodyMapX, bodyMapY, bodyMapWidth);

  const bodyMapBottom = bodyMapY + bodyMapHeight;
  if (y < bodyMapBottom) y = bodyMapBottom;
  y += 4;

  doc.setFont(undefined, 'bold');
  doc.text('SAMPLE History:', margin, y);
  doc.setFont(undefined, 'normal');
  y += 5;
  const sampleLabels = {
    S: 'Signs & Symptoms',
    A: 'Allergies',
    M: 'Medications',
    P: 'Past Med Hx',
    L: 'Last Intake',
    E: 'Event',
  };
  ['S', 'A', 'M', 'P', 'L', 'E'].forEach((letter) => {
    newPageIfNeeded(10);
    doc.setFontSize(8);
    const text = `${letter} - ${sampleLabels[letter]}: ${sample[letter.toLowerCase()] || '—'}`;
    const lines = doc.splitTextToSize(text, pageW - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 4;
  });
  y += 6;

  // ============================================================
  // 7. NATURE OF ILLNESS
  // ============================================================
  if (y > pageH - 60) { doc.addPage(); y = margin; }
  sectionHeader('7. NATURE OF ILLNESS & MECHANISM OF INJURY', [217, 119, 6]);
  const ni = reportData.nature_illness || {};
  const mech = reportData.mechanism || {};
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text('Nature of Illness:', margin, y);
  doc.setFont(undefined, 'normal');
  y += 5;
  const niList = ['Cardiac', 'Neurological', 'OB/Gynae', 'Respiratory', 'Trauma', 'Medical', 'General'];
  const niStartY = y;
  niList.forEach((n, i) => {
    const x = margin + (i % 4) * 48;
    const rowY = niStartY + Math.floor(i / 4) * 5;
    const savedY = y;
    y = rowY;
    checkbox(n, (ni.checked || []).includes(n), x);
    y = savedY;
  });
  y += 12;
  doc.setFont(undefined, 'bold');
  doc.text('Mechanism of Injury:', margin, y);
  doc.setFont(undefined, 'normal');
  y += 5;
  const mechList = ['Assault', 'Attack/Bite', 'Chemical Poisoning', 'Drowning', 'Electrocution', 'Excessive Heat', 'Fall', 'Firearm Injury', 'KTA Bicycle', 'KTA Motorbike', 'KTA Pedestrian', 'KTA Vehicle', 'Water/Transport', 'Injury to Child', 'Machinery'];
  const mechStartY = y;
  mechList.forEach((m, i) => {
    const x = margin + (i % 3) * 63;
    const rowY = mechStartY + Math.floor(i / 3) * 5;
    const savedY = y;
    y = rowY;
    checkbox(m, (mech.checked || []).includes(m), x);
    y = savedY;
  });
  y += Math.ceil(mechList.length / 3) * 5 + 10;

  // ============================================================
  // 8. NARRATIVE
  // ============================================================
  sectionHeader('8. NARRATIVE & SPECIAL CIRCUMSTANCES', [79, 70, 229]);
  const narr = reportData.narrative || {};
  doc.setFontSize(8);
  doc.text('Narrative Notes:', margin, y);
  y += 4;
  const noteLines = doc.splitTextToSize(narr.notes || '—', pageW - margin * 2);
  doc.text(noteLines, margin, y);
  y += noteLines.length * 4 + 6;

  newPageIfNeeded(40);
  doc.setFont(undefined, 'bold');
  doc.text('Recognition of Death:', margin, y);
  doc.setFont(undefined, 'normal');
  y += 5;
  const deathList = ['Decomposition', 'Rigor Mortis', 'Incineration', 'Decapitation', 'Pooling', 'Incompatible with life'];
  const deathStartY = y;
  deathList.forEach((d, i) => {
    const x = margin + (i % 3) * 63;
    const rowY = deathStartY + Math.floor(i / 3) * 5;
    const savedY = y;
    y = rowY;
    checkbox(d, (narr.death_indicators || []).includes(d), x);
    y = savedY;
  });
  y += 12;

  doc.setFont(undefined, 'bold');
  doc.text('Cessation of Resuscitation:', margin, y);
  doc.setFont(undefined, 'normal');
  y += 6;
  const cess = reportData.cessation || {};
  field('Coronary Disease:', cess.coronary, margin, 40);
  field('Collapse Witnessed:', cess.collapse, margin + 55, 40);
  y += 10;
  const cessFields = [
    ['Time of Collapse', cess.time_collapse],
    ['Time of Chest Pain', cess.time_chestpain],
    ['Time CPR Commenced', cess.time_cpr],
    ['Time First Analysis', cess.time_analysis],
    ['Defibrillation', cess.time_defib],
    ['Duration of CPR', cess.time_duration],
    ['Spontaneous Pulse', cess.time_pulse],
    ['Transferred To', cess.time_transferred],
    ['Hospital CPR in Progress', cess.time_hospital_cpr],
  ];
  const cessStartY = y;
  cessFields.forEach(([label, val], i) => {
    const x = margin + (i % 3) * 63;
    const rowY = cessStartY + Math.floor(i / 3) * 7;
    const savedY = y;
    y = rowY;
    field(label + ':', val, x, 60);
    y = savedY;
  });
  y += 25;

  newPageIfNeeded(50);
  doc.setFont(undefined, 'bold');
  doc.text('Refusal of Treatment and/or Transport:', margin, y);
  y += 4;
  doc.setFontSize(6);
  doc.setFont(undefined, 'italic');
  const legalText =
    'I, the undersigned have been advised that the medical assistance on my behalf is necessary and that refusal of said medical assistance and/or transportation for further treatment may result in death, or impair my health condition. Nevertheless, I refuse to accept treatment and/or transport and assume all risk and consequences of my decision and release the PNRC Safety services Ambulance Crew from any liability arising from my refusal.';
  const legalLines = doc.splitTextToSize(legalText, pageW - margin * 2);
  doc.text(legalLines, margin, y);
  y += legalLines.length * 3 + 5;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  const refu = reportData.refusal || {};
  field('Patient Signature:', refu.patient_sig, margin, 80);
  field('Witness:', refu.witness1, margin + 90, 50);
  y += 11;
  field('Date Signed:', refu.date_signed, margin, 60);
  field('Witness:', refu.witness2, margin + 70, 60);
  y += 12;

  // ============================================================
  // 9. PROVIDER
  // ============================================================
  sectionHeader('9. PROVIDER INFORMATION', [71, 85, 105]);
  const prov = reportData.provider_info || {};
  field('Provider Name:', prov.name, margin, 60);
  field('License No.:', prov.license, margin + 65, 45);
  field('Date/Time:', prov.datetime, margin + 115, 65);
  y += 12;
  field('Receiving Name:', prov.receiving_name, margin, 60);
  field('License No.:', prov.receiving_license, margin + 65, 45);
  field('Date/Time:', prov.receiving_datetime, margin + 115, 65);
  y += 14;

  // ============================================================
  // ADDITIONAL INFO
  // ============================================================
  newPageIfNeeded(25);
  sectionHeader('ADDITIONAL INFORMATION', [225, 29, 72]);
  const addInfo = reportData.additional_info || '—';
  const addLines = doc.splitTextToSize(addInfo, pageW - margin * 2);
  doc.text(addLines, margin, y);
  y += addLines.length * 4 + 10;

  // ============================================================
  // DIGITAL SIGNATURES
  // ============================================================
  const sigs = reportData.signatures || {};
  const sigKeys = ['patient', 'provider', 'receiving'];
  if (sigKeys.some((k) => sigs[k])) {
    newPageIfNeeded(50);
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text('Digital Signatures:', margin, y);
    y += 5;
    doc.setFont(undefined, 'normal');
    const sigLabels = {
      patient: 'Patient',
      provider: 'Provider',
      receiving: 'Receiving Provider',
    };
    sigKeys.forEach((key, i) => {
      if (sigs[key]) {
        const x = margin + i * 65;
        doc.setFontSize(7);
        doc.text(sigLabels[key] + ':', x, y);
        try {
          doc.addImage(sigs[key], 'PNG', x, y + 2, 55, 18);
        } catch (e) {
          console.warn('Failed to add signature image', key, e);
        }
      }
    });
    y += 25;
  }

  // ============================================================
  // PRINT-FRIENDLY CROP MARKS
  // ============================================================
  const totalPages2 = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages2; i++) {
    doc.setPage(i);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(5, 5, 10, 5);
    doc.line(5, 5, 5, 10);
    doc.line(205, 292, 200, 292);
    doc.line(205, 292, 205, 287);
  }

  // ============================================================
  // FOOTER
  // ============================================================
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `PPCR | Generated: ${new Date().toLocaleString()} | Page ${i} of ${totalPages}`,
      pageW / 2,
      pageH - 5,
      { align: 'center' }
    );
  }

  const filename = `PPCR_${reportData.serial_no || 'DRAFT'}_${Date.now()}.pdf`;
  doc.save(filename);
  return filename;
}

window.exportToPDF = exportToPDF;

console.log('📄 pdf-export.js loaded (with body map + crop marks)');