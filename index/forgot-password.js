// ============================================
// COBA — Forgot password flow
// Static-site simulation: request -> verify code -> new password -> success
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const steps = {
    1: document.getElementById('step1'),
    2: document.getElementById('step2'),
    3: document.getElementById('step3'),
    4: document.getElementById('step4'),
  };
  if (!steps[1]) return; // not on this page

  function goToStep(n) {
    Object.values(steps).forEach(el => el.hidden = true);
    steps[n].hidden = false;
    steps[n].querySelector('input, button')?.focus();
  }

  function setInvalid(fieldEl, invalid) {
    if (fieldEl) fieldEl.classList.toggle('invalid', invalid);
  }

  /* ---------- Step 1: request reset ---------- */
  const requestForm = document.getElementById('requestForm');
  const reqInput = document.getElementById('reqInput');
  const destinationText = document.getElementById('destinationText');

  function isValidEmailOrPhone(val) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^[0-9+\-\s()]{7,}$/;
    return emailRe.test(val) || phoneRe.test(val);
  }

  requestForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = reqInput.value.trim();
    const valid = isValidEmailOrPhone(val);
    setInvalid(document.getElementById('reqField'), !valid);
    if (!valid) return;

    destinationText.textContent = val;
    goToStep(2);
  });

  /* ---------- Step 2: verify code ---------- */
  const codeForm = document.getElementById('codeForm');
  const codeInput = document.getElementById('codeInput');
  const backToStep1 = document.getElementById('backToStep1');
  const resendBtn = document.getElementById('resendBtn');

  codeInput.addEventListener('input', () => {
    codeInput.value = codeInput.value.replace(/[^0-9]/g, '').slice(0, 6);
  });

  codeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const valid = codeInput.value.trim().length === 6;
    setInvalid(document.getElementById('codeField'), !valid);
    if (!valid) return;
    goToStep(3);
  });

  backToStep1.addEventListener('click', () => goToStep(1));

  resendBtn.addEventListener('click', () => {
    resendBtn.textContent = 'Code sent!';
    resendBtn.disabled = true;
    setTimeout(() => {
      resendBtn.textContent = 'Resend code';
      resendBtn.disabled = false;
    }, 2500);
  });

  /* ---------- Step 3: new password ---------- */
  const newPassForm = document.getElementById('newPassForm');
  const newPassword = document.getElementById('newPassword');
  const confirmPassword = document.getElementById('confirmPassword');
  const meter = document.getElementById('strengthMeter');
  const hint = document.getElementById('strengthHint');

  document.getElementById('toggleNewPass').addEventListener('click', function () {
    const isPass = newPassword.type === 'password';
    newPassword.type = isPass ? 'text' : 'password';
    this.textContent = isPass ? 'Hide' : 'Show';
  });
  document.getElementById('toggleConfirmPass').addEventListener('click', function () {
    const isPass = confirmPassword.type === 'password';
    confirmPassword.type = isPass ? 'text' : 'password';
    this.textContent = isPass ? 'Hide' : 'Show';
  });

  if (newPassword && meter) {
    const bars = meter.querySelectorAll('span');
    const colors = ['#D64545', '#FFC72C', '#1E6FEB', '#1B8A5A'];
    const labels = ['Too weak', 'Getting there', 'Good', 'Strong'];

    newPassword.addEventListener('input', () => {
      const val = newPassword.value;
      let score = 0;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
      if (/\d/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      bars.forEach((bar, i) => {
        bar.style.background = i < score ? colors[Math.max(score - 1, 0)] : '#E2E8F0';
      });
      hint.textContent = val.length === 0
        ? 'Use 8+ characters with a number and a symbol.'
        : labels[Math.max(score - 1, 0)];
    });
  }

  newPassForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const passOk = newPassword.value.length >= 8;
    setInvalid(document.getElementById('newPassField'), !passOk);
    if (!passOk) valid = false;

    const matchOk = confirmPassword.value.length > 0 && confirmPassword.value === newPassword.value;
    setInvalid(document.getElementById('confirmPassField'), !matchOk);
    if (!matchOk) valid = false;

    if (valid) goToStep(4);
  });
});
