// ============================================
// COBA — shared interactions
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Hero "Beam" animation (landing page) ---------- */
  const curve = document.getElementById('beamCurve');
  const spark = document.getElementById('beamSpark');
  const ring = document.getElementById('beamRing');
  const receivedAmt = document.getElementById('receivedAmt');
  const receivedStatus = document.getElementById('receivedStatus');

  if (curve && spark) {
    const pathLength = curve.getTotalLength();
    const duration = 1600; // ms for the spark to travel
    const pause = 1800; // ms to pause once received before looping
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animateBeam(startTime) {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // ease-in-out
      const point = curve.getPointAtLength(eased * pathLength);
      spark.setAttribute('cx', point.x);
      spark.setAttribute('cy', point.y);
      spark.setAttribute('opacity', 1);

      if (t < 1) {
        requestAnimationFrame(() => animateBeam(startTime));
      } else {
        // arrived: show ring pulse + update receiver card
        spark.setAttribute('opacity', 0);
        ring.setAttribute('cx', point.x);
        ring.setAttribute('cy', point.y);
        pulseRing();
        if (receivedAmt) receivedAmt.textContent = '₦45,000.00';
        if (receivedStatus) receivedStatus.style.opacity = 1;

        setTimeout(() => {
          if (receivedAmt) receivedAmt.textContent = '₦0.00';
          if (receivedStatus) receivedStatus.style.opacity = 0;
          if (!reduceMotion) requestAnimationFrame(() => animateBeam(performance.now()));
        }, pause);
      }
    }

    function pulseRing() {
      let r = 6, opacity = 0.9;
      ring.setAttribute('opacity', opacity);
      const grow = () => {
        r += 1.6;
        opacity -= 0.045;
        ring.setAttribute('r', r);
        ring.setAttribute('opacity', Math.max(opacity, 0));
        if (opacity > 0) requestAnimationFrame(grow);
        else { ring.setAttribute('r', 6); }
      };
      requestAnimationFrame(grow);
    }

    if (!reduceMotion) {
      requestAnimationFrame(() => animateBeam(performance.now()));
    } else {
      // Static reduced-motion state: show a completed transfer
      const endPoint = curve.getPointAtLength(pathLength);
      spark.setAttribute('cx', endPoint.x);
      spark.setAttribute('cy', endPoint.y);
      spark.setAttribute('opacity', 1);
      if (receivedAmt) receivedAmt.textContent = '₦45,000.00';
      if (receivedStatus) receivedStatus.style.opacity = 1;
    }
  }

  /* ---------- Password show/hide toggle ---------- */
  document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.input-wrap').querySelector('input');
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      btn.textContent = isPass ? 'Hide' : 'Show';
    });
  });

  /* ---------- Password strength meter (signup) ---------- */
  const passInput = document.getElementById('password');
  const meter = document.getElementById('strengthMeter');
  const hint = document.getElementById('strengthHint');

  if (passInput && meter) {
    const bars = meter.querySelectorAll('span');
    const colors = ['#D64545', '#FFC72C', '#1E6FEB', '#1B8A5A'];
    const labels = ['Too weak', 'Getting there', 'Good', 'Strong'];

    passInput.addEventListener('input', () => {
      const val = passInput.value;
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

  /* ---------- Validation helpers ---------- */
  function setInvalid(fieldEl, invalid) {
    if (!fieldEl) return;
    fieldEl.classList.toggle('invalid', invalid);
  }

  function isValidEmailOrPhone(val) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^[0-9+\-\s()]{7,}$/;
    return emailRe.test(val) || phoneRe.test(val);
  }
  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }
  function isValidPhone(val) {
    return /^[0-9+\-\s()]{7,}$/.test(val);
  }

  /* ---------- Login form ---------- */
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email');
      const password = document.getElementById('password');
      let valid = true;

      if (!isValidEmailOrPhone(email.value.trim())) {
        setInvalid(document.getElementById('emailField'), true);
        valid = false;
      } else {
        setInvalid(document.getElementById('emailField'), false);
      }

      if (password.value.trim().length === 0) {
        setInvalid(document.getElementById('passField'), true);
        valid = false;
      } else {
        setInvalid(document.getElementById('passField'), false);
      }

      if (valid) {
        const msg = document.getElementById('formMsg');
        document.getElementById('formMsgText').textContent = 'Logged in successfully — redirecting…';
        msg.classList.add('show');
        loginForm.querySelector('button[type="submit"]').textContent = 'Logging in…';
      }
    });
  }

  /* ---------- Signup form ---------- */
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      const firstName = document.getElementById('firstName');
      const lastName = document.getElementById('lastName');
      const email = document.getElementById('email');
      const phone = document.getElementById('phone');
      const password = document.getElementById('password');
      const terms = document.getElementById('terms');

      setInvalid(document.getElementById('firstField'), firstName.value.trim().length === 0);
      if (firstName.value.trim().length === 0) valid = false;

      setInvalid(document.getElementById('lastField'), lastName.value.trim().length === 0);
      if (lastName.value.trim().length === 0) valid = false;

      const emailOk = isValidEmail(email.value.trim());
      setInvalid(document.getElementById('emailField'), !emailOk);
      if (!emailOk) valid = false;

      const phoneOk = isValidPhone(phone.value.trim());
      setInvalid(document.getElementById('phoneField'), !phoneOk);
      if (!phoneOk) valid = false;

      const passOk = password.value.length >= 8;
      setInvalid(document.getElementById('passField'), !passOk);
      if (!passOk) valid = false;

      if (!terms.checked) {
        valid = false;
        terms.closest('.checkbox-row').style.color = '#D64545';
      } else {
        terms.closest('.checkbox-row').style.color = '';
      }

      if (valid) {
        const msg = document.getElementById('formMsg');
        msg.classList.add('show');
        signupForm.querySelector('button[type="submit"]').textContent = 'Creating account…';
      }
    });
  }

});
