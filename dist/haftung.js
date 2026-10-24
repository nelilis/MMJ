(() => {
  const form = document.getElementById('waiver-form');
  const birth = document.getElementById('waiver-birth');
  const date = document.getElementById('waiver-date');
  const minor = document.getElementById('waiver-minor');
  const guardian = document.getElementById('guardian-fields');
  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  date.value = localDate;
  date.max = localDate;
  birth.max = localDate;
  document.getElementById('waiver-text-value').value = document.getElementById('waiver-terms').innerText;
  const createButton = document.getElementById('pdf-create');
  createButton.disabled = false;

  function updateGuardian() {
    let underage = false;
    if (birth.value && birth.validity.valid) {
      const [year, month, day] = birth.value.split('-').map(Number);
      const eighteenthBirthday = new Date(year + 18, month - 1, day);
      underage = eighteenthBirthday > new Date(today.getFullYear(), today.getMonth(), today.getDate());
      minor.checked = underage;
    }
    guardian.hidden = !minor.checked;
    guardian.disabled = !minor.checked;
  }
  birth.addEventListener('input', updateGuardian);
  minor.addEventListener('change', updateGuardian);
  const canvas = document.getElementById('signature-canvas');
  const context = canvas.getContext('2d');
  const attachment = document.getElementById('signature-file');
  const status = document.getElementById('signature-status');
  let drawing = false;
  let pointer = null;
  let inkLength = 0;
  let previous = null;

  function clearDrawing() {
    drawing = false;
    pointer = null;
    previous = null;
    inkLength = 0;
    if (context) {
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = '#151614';
      context.lineWidth = 4;
      context.lineCap = 'round';
      context.lineJoin = 'round';
    }
  }
  function point(event) {
    const rect = canvas.getBoundingClientRect();
    return {x: (event.clientX - rect.left) * canvas.width / rect.width,
      y: (event.clientY - rect.top) * canvas.height / rect.height};
  }
  clearDrawing();
  canvas.addEventListener('pointerdown', event => {
    if (!context || !event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    attachment.value = '';
    attachment.setCustomValidity('');
    drawing = true;
    pointer = event.pointerId;
    previous = point(event);
    canvas.setPointerCapture(pointer);
  });
  canvas.addEventListener('pointermove', event => {
    if (!drawing || event.pointerId !== pointer) return;
    event.preventDefault();
    const next = point(event);
    context.beginPath();
    context.moveTo(previous.x, previous.y);
    context.lineTo(next.x, next.y);
    context.stroke();
    inkLength += Math.hypot(next.x - previous.x, next.y - previous.y);
    previous = next;
    status.textContent = inkLength >= 20 ? 'Unterschrift erfasst.' : 'Bitte im Feld unterschreiben.';
  });
  function endDrawing(event) {
    if (event.pointerId !== pointer) return;
    drawing = false;
    pointer = null;
  }
  canvas.addEventListener('pointerup', endDrawing);
  canvas.addEventListener('pointercancel', endDrawing);
  canvas.addEventListener('lostpointercapture', endDrawing);
  document.getElementById('signature-clear').addEventListener('click', () => {
    clearDrawing();
    attachment.value = '';
    attachment.setCustomValidity('');
    status.textContent = 'Unterschrift gelöscht. Bitte erneut unterschreiben oder ein Bild hochladen.';
  });
  attachment.addEventListener('change', () => {
    attachment.setCustomValidity('');
    const file = attachment.files[0];
    if (!file) {
      status.textContent = inkLength >= 20 ? 'Unterschrift erfasst.' : 'Noch keine Unterschrift vorhanden.';
      return;
    }
    clearDrawing();
    if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 2 * 1024 * 1024 || !file.size) {
      attachment.value = '';
      attachment.setCustomValidity('Bitte ein PNG- oder JPG-Bild mit maximal 2 MB auswählen.');
      status.textContent = 'Das Bild konnte nicht übernommen werden. Bitte ein PNG- oder JPG-Bild mit maximal 2 MB auswählen.';
      attachment.reportValidity();
      return;
    }
    status.textContent = 'Unterschrift als Bild ausgewählt.';
  });

  const pdfFile = document.getElementById('pdf-file');
  const review = document.getElementById('pdf-review');
  const confirm = document.getElementById('pdf-confirm');
  const sendButton = document.getElementById('pdf-send');
  const pdfStatus = document.getElementById('pdf-status');
  const preview = document.getElementById('pdf-preview');
  const documentId = document.getElementById('pdf-document-id');
  let revision = 0;
  let generatedRevision = -1;
  let pdfUrl = null;
  let creating = false;
  let fontPromise;

  function invalidatePdf() {
    revision++;
    generatedRevision = -1;
    confirm.checked = false;
    confirm.disabled = true;
    sendButton.disabled = true;
    pdfFile.value = '';
    documentId.value = '';
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      pdfUrl = null;
      pdfStatus.textContent = 'Die Angaben wurden geändert. Bitte erstelle und prüfe das PDF erneut.';
    }
    review.hidden = true;
    preview.querySelectorAll('canvas').forEach(canvas => { canvas.width = 0; canvas.height = 0; });
    preview.replaceChildren();
    preview.setAttribute('aria-busy', 'false');
    document.getElementById('pdf-open').removeAttribute('href');
    document.getElementById('pdf-download').removeAttribute('href');
  }
  form.addEventListener('input', event => {
    if (event.target !== confirm) invalidatePdf();
  });
  canvas.addEventListener('pointerdown', invalidatePdf);
  document.getElementById('signature-clear').addEventListener('click', invalidatePdf);
  attachment.addEventListener('change', invalidatePdf);
  confirm.addEventListener('change', () => {
    sendButton.disabled = !confirm.checked || generatedRevision !== revision;
  });

  function base64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 8192) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    }
    return btoa(binary);
  }
  function loadFont() {
    if (!fontPromise) {
      fontPromise = fetch('../assets/fonts/Barlow-Regular.ttf').then(response => {
        if (!response.ok) throw new Error('Schrift konnte nicht geladen werden.');
        return response.arrayBuffer();
      }).then(base64).catch(error => { fontPromise = null; throw error; });
    }
    return fontPromise;
  }
  async function signatureImage() {
    if (inkLength >= 20) return {url: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height, format: 'PNG'};
    const file = attachment.files[0];
    if (!file || !['image/png', 'image/jpeg'].includes(file.type) || !file.size || file.size > 2 * 1024 * 1024) {
      throw new Error('Bitte unterschreibe im Feld oder lade ein PNG-/JPG-Bild mit maximal 2 MB hoch.');
    }
    const url = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Das Unterschriftsbild konnte nicht gelesen werden.'));
      reader.readAsDataURL(file);
    });
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Das Unterschriftsbild ist ungültig. Bitte wähle ein anderes Bild.'));
      img.src = url;
    });
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 20000000) {
      throw new Error('Das Unterschriftsbild ist zu groß oder ungültig. Bitte ein kleineres Bild wählen.');
    }
    return {url, width: image.naturalWidth, height: image.naturalHeight, format: file.type === 'image/png' ? 'PNG' : 'JPEG'};
  }
  function formattedDate(value) { return value.split('-').reverse().join('.'); }
  createButton.addEventListener('click', async () => {
    if (creating) return;
    updateGuardian();
    form.querySelectorAll('input[required]:not(:disabled)').forEach(input => {
      if (!['checkbox', 'date', 'file'].includes(input.type)) input.value = input.value.trim();
    });
    // Die Freigabe wird erst nach der PDF-Vorschau benötigt.
    invalidatePdf();
    attachment.setCustomValidity('');
    if (!form.reportValidity()) return;
    creating = true;
    createButton.disabled = true;
    const currentRevision = revision;
    pdfStatus.textContent = 'Dein unterschriebenes PDF wird erstellt …';
    try {
      if (!window.jspdf || !window.buildWaiverPdf) throw new Error('Die PDF-Funktion konnte nicht geladen werden. Bitte lade die Seite erneut.');
      const data = {
        documentId: crypto.randomUUID(),
        firstName: document.getElementById('waiver-first').value,
        lastName: document.getElementById('waiver-last').value,
        email: document.getElementById('waiver-email').value,
        phone: document.getElementById('waiver-phone').value,
        emergency: document.getElementById('waiver-emergency').value,
        birthDate: formattedDate(birth.value), date: formattedDate(date.value),
        minor: minor.checked, guardianName: guardian.disabled ? '' : document.getElementById('guardian-name').value,
        createdAt: new Date().toLocaleString('de-AT'),
        clauses: [...document.querySelectorAll('.waiver-clause')].map(clause => ({
          title: clause.querySelector('h3').textContent.replace(/^\s*\d+\s*/, ''),
          text: clause.querySelector('p').textContent
        }))
      };
      const [signature, font] = await Promise.all([signatureImage(), loadFont()]);
      if (currentRevision !== revision) throw new Error('Die Angaben wurden während der Erstellung geändert. Bitte erstelle das PDF erneut.');
      data.signature = signature;
      const pdf = window.buildWaiverPdf(window.jspdf.jsPDF, data, font);
      const blob = pdf.output('blob');
      if (blob.size > 9 * 1024 * 1024) throw new Error('Das PDF ist zu groß für den Versand. Bitte verwende ein kleineres Unterschriftsbild.');
      const filename = `haftungsausschluss-${date.value}-${data.documentId.slice(0, 8)}.pdf`;
      pdfUrl = URL.createObjectURL(blob);
      preview.textContent = 'Alle PDF-Seiten werden für die Vorschau geladen …';
      const download = document.getElementById('pdf-download');
      download.href = pdfUrl;
      download.download = filename;
      document.getElementById('pdf-open').href = pdfUrl;
      review.hidden = false;
      document.getElementById('pdf-review-title').focus();
      try {
        await window.renderWaiverPreview(blob, preview, () => currentRevision === revision);
      } catch (error) {
        if (currentRevision === revision) {
          preview.replaceChildren();
          preview.textContent = 'Die Vorschau konnte nicht geladen werden. Bitte öffne oder lade das PDF über die Links unten und prüfe dort alle Seiten vor dem Versand.';
          preview.setAttribute('aria-busy', 'false');
        }
      }
      if (currentRevision !== revision) throw new Error('Die Angaben wurden geändert. Bitte erstelle und prüfe das PDF erneut.');
      try {
        const transfer = new DataTransfer();
        transfer.items.add(new File([blob], filename, {type: 'application/pdf'}));
        pdfFile.files = transfer.files;
        if (!pdfFile.files.length) throw new Error('Kein PDF angehängt.');
      } catch (error) {
        throw new Error('Dein Browser unterstützt den direkten PDF-Versand nicht. Lade das PDF herunter und sende es als Anhang an panoramacompound@gmail.com.');
      }
      documentId.value = data.documentId;
      generatedRevision = currentRevision;
      confirm.disabled = false;
      pdfStatus.textContent = 'PDF erstellt. Bitte prüfe das Dokument und bestätige es unten vor dem Versand.';
    } catch (error) {
      pdfStatus.textContent = error.message || 'Das PDF konnte nicht erstellt werden. Bitte versuche es erneut.';
    } finally {
      creating = false;
      createButton.disabled = false;
    }
  });

  form.addEventListener('submit', event => {
    if (creating || generatedRevision !== revision || !confirm.checked || !pdfFile.files.length || !form.checkValidity()) {
      event.preventDefault();
      pdfStatus.textContent = 'Bitte erstelle das aktuelle PDF, prüfe es und bestätige anschließend den Versand.';
      form.reportValidity();
    }
  });
  // Enter in einem Textfeld soll nicht unbeabsichtigt zur Versandseite wechseln.
  form.addEventListener('keydown', event => {
    if (event.key === 'Enter' && event.target.tagName === 'INPUT' && !['checkbox', 'file'].includes(event.target.type)) {
      event.preventDefault();
      createButton.click();
    }
  });
})();
