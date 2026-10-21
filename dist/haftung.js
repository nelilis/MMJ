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
    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
    }
  });
})();
