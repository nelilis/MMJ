/* PDF-Ausgabe: lokal im Browser, mit eingebetteter Barlow-Schrift. */
(function (root) {
  function buildWaiverPdf(jsPDF, data, fontBase64) {
    const pdf = new jsPDF({unit: 'mm', format: 'a4', compress: true});
    pdf.addFileToVFS('Barlow-Regular.ttf', fontBase64);
    pdf.addFont('Barlow-Regular.ttf', 'Barlow', 'normal');
    pdf.setFont('Barlow');
    pdf.setProperties({title: 'Haftungsausschluss - Panorama Compound', subject: data.documentId,
      author: 'Panorama Compund Slopestyle Verein', creator: 'Mad Mutti Jam Onlineformular'});
    const left = 20, width = 170, bottom = 274;
    let y = 20;
    function newPage() { pdf.addPage(); y = 22; }
    function room(height) { if (y + height > bottom) newPage(); }
    function text(value, size = 11, gap = 3) {
      pdf.setFontSize(size);
      const lines = pdf.splitTextToSize(String(value), width);
      const leading = size * 0.3528 * 1.45;
      for (const line of lines) {
        room(leading);
        pdf.text(line, left, y);
        y += leading;
      }
      y += gap;
    }
    function heading(value) {
      room(22);
      pdf.setTextColor(171, 50, 11);
      text(value, 12, 3);
      pdf.setTextColor(21, 22, 20);
    }
    pdf.setTextColor(171, 50, 11);
    text('PANORAMA COMPOUND / MUTTERS', 10, 3);
    pdf.setTextColor(21, 22, 20);
    text('Haftungsausschluss', 24, 3);
    text('Panorama Compund Slopestyle Verein', 11, 7);
    data.clauses.forEach((clause, index) => {
      heading(`${String(index + 1).padStart(2, '0')} / ${clause.title}`);
      text(clause.text, 10.5, 5);
    });
    newPage();
    text('Persönliche Angaben & Unterschrift', 20, 7);
    const fields = [
      ['Vorname', data.firstName], ['Nachname', data.lastName],
      ['E-Mail', data.email], ['Eigene Telefonnummer', data.phone],
      ['Notfall-Telefonnummer', data.emergency], ['Geburtsdatum', data.birthDate],
      ['Datum der Erklärung', data.date], ['Minderjährig', data.minor ? 'Ja' : 'Nein']
    ];
    if (data.minor) fields.push(['Erziehungsberechtigte Person', data.guardianName]);
    fields.forEach(([label, value]) => {
      pdf.setFontSize(11);
      const lines = pdf.splitTextToSize(value, width);
      room(7 + lines.length * 5.6);
      pdf.setTextColor(90, 91, 82);
      text(label, 9, 0);
      pdf.setTextColor(21, 22, 20);
      text(value, 11, 3);
    });
    room(76);
    heading(data.minor ? 'Unterschrift der erziehungsberechtigten Person' : 'Unterschrift');
    const imageWidth = Math.min(100, data.signature.width / data.signature.height * 32);
    const imageHeight = imageWidth * data.signature.height / data.signature.width;
    pdf.addImage(data.signature.url, data.signature.format, left, y, imageWidth, imageHeight);
    y += imageHeight + 5;
    text(data.minor ? data.guardianName : `${data.firstName} ${data.lastName}`, 11, 3);
    text('Ich habe den oben stehenden Haftungsausschluss gelesen und bestätige ihn mit meiner Unterschrift.', 10, 3);
    if (data.minor) text('Ich bestätige als erziehungsberechtigte Person die Erklärung für die oben genannte minderjährige Person.', 10, 3);
    text(`Erstellt am: ${data.createdAt}`, 9, 1);
    const pages = pdf.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      pdf.setPage(i);
      pdf.setDrawColor(210, 211, 202);
      pdf.line(left, 282, left + width, 282);
      pdf.setTextColor(90, 91, 82);
      pdf.setFontSize(8);
      pdf.text(`Dokument-ID: ${data.documentId}`, left, 288);
      pdf.text(`Seite ${i} / ${pages}`, 190, 288, {align: 'right'});
    }
    return pdf;
  }
  root.buildWaiverPdf = buildWaiverPdf;
  if (typeof module !== 'undefined') module.exports = buildWaiverPdf;
})(typeof window === 'undefined' ? globalThis : window);
