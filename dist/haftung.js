(() => {
  const form = document.getElementById('waiver-form');
  const birth = document.getElementById('waiver-birth');
  const date = document.getElementById('waiver-date');
  const minor = document.getElementById('waiver-minor');
  const guardian = document.getElementById('guardian-fields');
  const signature = document.getElementById('waiver-signature');
  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  date.value = localDate;
  date.max = localDate;
  birth.max = localDate;
  document.getElementById('waiver-text-value').value = document.getElementById('waiver-terms').innerText;
  form.querySelector('button[type="submit"]').disabled = false;

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
    signature.setCustomValidity('');
  }
  birth.addEventListener('input', updateGuardian);
  minor.addEventListener('change', updateGuardian);
  form.addEventListener('input', () => signature.setCustomValidity(''));
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

  form.addEventListener('submit', (event) => {
    updateGuardian();
    const inputs = [...form.querySelectorAll('input[required]:not(:disabled)')];
    inputs.forEach(input => {
      if (!['checkbox', 'date'].includes(input.type)) input.value = input.value.trim();
    });
    const normalize = value => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('de');
    const expectedName = minor.checked
      ? document.getElementById('guardian-name').value
      : `${document.getElementById('waiver-first').value} ${document.getElementById('waiver-last').value}`;
    if (normalize(signature.value) !== normalize(expectedName)) {
      signature.setCustomValidity('Bitte gib den vollständigen Namen der bestätigenden Person wie oben ein.');
    }
    attachment.setCustomValidity('');
    if (inkLength >= 20) {
      try {
        const encoded = canvas.toDataURL('image/png').split(',')[1];
        const bytes = Uint8Array.from(atob(encoded), char => char.charCodeAt(0));
        const transfer = new DataTransfer();
        transfer.items.add(new File([bytes], 'unterschrift.png', {type: 'image/png'}));
        attachment.files = transfer.files;
        if (!attachment.files.length) throw new Error('Unterschrift fehlt');
      } catch (error) {
        attachment.setCustomValidity('Die gezeichnete Unterschrift kann in diesem Browser nicht angehängt werden. Bitte lade stattdessen ein Bild deiner Unterschrift hoch.');
        status.textContent = 'Bitte die Unterschrift über das Bildfeld hochladen; der Browser unterstützt den Zeichenversand nicht.';
      }
    } else if (!attachment.files.length) {
      attachment.setCustomValidity('Bitte unterschreibe im Feld oder lade ein Bild deiner Unterschrift hoch.');
      status.textContent = 'Unterschrift fehlt. Bitte im Feld unterschreiben oder ein Bild hochladen.';
    }
    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
    }
  });
})();
