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

// ============================================
// COBA — Google / Apple sign-in simulation
// Demo-only front-end flow (no real OAuth backend).
// See note at bottom for what's needed to go live.
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('oauthOverlay');
  const modal = document.getElementById('oauthModal');
  if (!overlay || !modal) return; // not on an auth page

  const googleAccounts = [
    { name: 'Tomi Adebayo', email: 'tomi.adebayo@gmail.com', color: '#1E6FEB' },
    { name: 'Zainab Bello', email: 'zainab.bello@gmail.com', color: '#EA9C00' }
  ];
  const appleAccount = { name: 'Tomi Adebayo', email: 'tomi.adebayo@icloud.com' };
  let hideEmail = false;

  function openOverlay() {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
  }
  function closeOverlay() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }

  function initials(name) {
    return name.split(' ').map(p => p.charAt(0)).join('').slice(0, 2).toUpperCase();
  }

  function renderGoogleChooser() {
    modal.className = 'oauth-modal';
    modal.innerHTML = `
      <div class="oauth-modal-header">
        <svg class="provider-logo" viewBox="0 0 48 48" width="36" height="36">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.5 0 10.5-2.1 14.3-5.5l-6.6-5.6C29.7 34.7 27 35.5 24 35.5c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.6 39.6 16.3 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.6 5.6C39.5 37.5 44 31.3 44 24c0-1.3-.1-2.7-.4-3.5z"/>
        </svg>
        <h3>Sign in with Google</h3>
        <p>Choose an account to continue to Coba</p>
      </div>
      <div class="oauth-account-list">
        ${googleAccounts.map((a, i) => `
          <button type="button" class="oauth-account" data-i="${i}">
            <span class="oauth-avatar" style="background:${a.color}">${initials(a.name)}</span>
            <span>
              <span class="oauth-account-name">${a.name}</span>
              <span class="oauth-account-email">${a.email}</span>
            </span>
          </button>`).join('')}
        <button type="button" class="oauth-account" id="oauthUseOther">
          <span class="oauth-avatar" style="background:#5f6368;">+</span>
          <span><span class="oauth-account-name">Use another account</span></span>
        </button>
      </div>
      <p class="oauth-demo-note">Demo chooser — no real Google account is contacted.</p>
      <div class="oauth-footer"><button type="button" class="oauth-cancel" id="oauthCancel">Cancel</button></div>
    `;

    modal.querySelectorAll('.oauth-account[data-i]').forEach(btn => {
      btn.addEventListener('click', () => {
        const acc = googleAccounts[Number(btn.getAttribute('data-i'))];
        runGoogleSignIn(acc);
      });
    });
    document.getElementById('oauthUseOther').addEventListener('click', () => {
      runGoogleSignIn(googleAccounts[0]);
    });
    document.getElementById('oauthCancel').addEventListener('click', closeOverlay);
  }

  function runGoogleSignIn(acc) {
    renderLoading('google');
    setTimeout(() => finishOAuth('Google', acc.name, acc.email), 1000);
  }

  function renderAppleSheet() {
    modal.className = 'oauth-modal apple-theme';
    const emailDisplay = hideEmail ? 'Hidden — Coba gets a private relay address' : appleAccount.email;
    modal.innerHTML = `
      <div class="oauth-modal-header">
        <svg class="provider-logo" viewBox="0 0 24 24" width="30" height="30" fill="#fff">
          <path d="M16.365 1.43c0 1.14-.462 2.25-1.15 3.03-.78.9-2.05 1.6-3.06 1.52-.13-1.1.44-2.26 1.13-3 .78-.87 2.13-1.53 3.08-1.55zm3.6 16.6c-.55 1.28-.82 1.85-1.53 2.98-.99 1.58-2.39 3.56-4.13 3.58-1.54.02-1.94-1.01-4.03-1-2.09.01-2.53 1.02-4.07 1-1.74-.02-3.06-1.79-4.05-3.37-2.78-4.4-3.07-9.57-1.35-12.31 1.22-1.95 3.15-3.09 4.96-3.09 1.85 0 3.01 1.02 4.53 1.02 1.48 0 2.37-1.03 4.53-1.03 1.6 0 3.3.87 4.51 2.38-3.97 2.18-3.33 7.85.6 9.84z"/>
        </svg>
        <h3>Sign in with Apple</h3>
        <p>Continue as ${appleAccount.name}</p>
      </div>
      <div class="oauth-account-list">
        <button type="button" class="oauth-account" id="oauthAppleContinue">
          <span class="oauth-avatar" style="background:#1E6FEB;">${initials(appleAccount.name)}</span>
          <span>
            <span class="oauth-account-name">${appleAccount.name}</span>
            <span class="oauth-account-email">${emailDisplay}</span>
          </span>
        </button>
      </div>
      <div class="oauth-hide-email-row">
        <span>Hide my email from Coba</span>
        <button type="button" class="oauth-toggle ${hideEmail ? 'on' : ''}" id="oauthHideEmailToggle" aria-label="Toggle hide my email"></button>
      </div>
      <p class="oauth-demo-note">Demo sheet — no real Apple ID is contacted.</p>
      <div class="oauth-footer"><button type="button" class="oauth-cancel" id="oauthCancel">Cancel</button></div>
    `;

    document.getElementById('oauthHideEmailToggle').addEventListener('click', () => {
      hideEmail = !hideEmail;
      renderAppleSheet();
    });
    document.getElementById('oauthAppleContinue').addEventListener('click', () => {
      const email = hideEmail ? 'k3f8s1p2@privaterelay.appleid.com' : appleAccount.email;
      renderLoading('apple');
      setTimeout(() => finishOAuth('Apple', appleAccount.name, email), 1000);
    });
    document.getElementById('oauthCancel').addEventListener('click', closeOverlay);
  }

  function renderLoading(provider) {
    modal.className = 'oauth-modal' + (provider === 'apple' ? ' apple-theme' : '');
    modal.innerHTML = `
      <div class="oauth-loading">
        <div class="oauth-spinner"></div>
        <p>Connecting to ${provider === 'apple' ? 'Apple' : 'Google'}…</p>
      </div>`;
  }

  function finishOAuth(provider, name, email) {
    closeOverlay();
    const parts = name.split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');

    // Signup page: prefill fields + show success
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      const firstEl = document.getElementById('firstName');
      const lastEl = document.getElementById('lastName');
      const emailEl = document.getElementById('email');
      const termsEl = document.getElementById('terms');
      if (firstEl) firstEl.value = firstName || '';
      if (lastEl) lastEl.value = lastName || '';
      if (emailEl) emailEl.value = email;
      if (termsEl) termsEl.checked = true;

      const msg = document.getElementById('formMsg');
      const msgText = document.getElementById('formMsgText');
      if (msg && msgText) {
        msgText.textContent = `Account created with ${provider} — welcome to Coba!`;
        msg.classList.add('show');
      }
      const submitBtn = signupForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = 'Redirecting…';
      return;
    }

    // Login page: straight to success
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      const msg = document.getElementById('formMsg');
      const msgText = document.getElementById('formMsgText');
      if (msg && msgText) {
        msgText.textContent = `Signed in with ${provider} as ${email} — redirecting…`;
        msg.classList.add('show');
      }
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = 'Redirecting…';
    }
  }

  document.querySelectorAll('[data-oauth="google"]').forEach(btn => {
    btn.addEventListener('click', () => { renderGoogleChooser(); openOverlay(); });
  });
  document.querySelectorAll('[data-oauth="apple"]').forEach(btn => {
    btn.addEventListener('click', () => { hideEmail = false; renderAppleSheet(); openOverlay(); });
  });

  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeOverlay(); });
});
