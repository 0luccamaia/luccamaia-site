(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const motion = window.Motion && root.classList.contains('js') ? window.Motion : null;
  const ease = [0.16, 1, 0.3, 1];

  /* Uma pergunta por vez; sem script, o formulário aparece inteiro e envia normalmente */
  const form = $('.bf-form');
  const steps = $$('.bf-step', form);
  const bar = $('.bf-bar i');
  const count = $('.bf-count b');
  const hint = $('.bf-hint');
  const back = $('.bf-back');
  const next = $('.bf-next');
  const submit = $('.bf-submit');
  const submitLabel = $('.bf-submit-label');
  const status = $('.bf-status');
  const done = $('.bf-done');
  const questions = steps.length - 1;
  const contactEmail = 'studioluccamaia@gmail.com';
  let current = 0;
  let busy = false;

  form.classList.add('bf-ready');

  function render() {
    steps.forEach((step, i) => step.classList.toggle('is-current', i === current));
    form.classList.toggle('is-intro', current === 0);
    back.hidden = current === 0;
    next.hidden = current === 0 || current === steps.length - 1;
    submit.hidden = current !== steps.length - 1;
    count.textContent = String(Math.max(1, current)).padStart(2, '0');
    const progress = current / questions;
    if (motion) motion.animate(bar, { scaleX: progress }, { duration: 0.8, ease });
    else bar.style.transform = `scaleX(${progress})`;
  }

  function stepIsValid(step) {
    hint.hidden = true;
    if (step.dataset.min) {
      const ok = $$('input:checked', step).length >= Number(step.dataset.min);
      if (!ok) {
        hint.textContent = 'Marque pelo menos uma opção.';
        hint.hidden = false;
      }
      return ok;
    }
    const invalid = $$('input, textarea', step).find((el) => !el.checkValidity());
    if (!invalid) return true;
    if (invalid.type === 'radio') {
      hint.textContent = 'Escolha uma opção para continuar.';
      hint.hidden = false;
    } else {
      invalid.reportValidity();
    }
    return false;
  }

  function focusStep(step) {
    const field = $('input:checked, input:not([type="hidden"]), textarea, .bf-start', step);
    if (field) field.focus({ preventScroll: true });
  }

  async function go(to) {
    if (busy || to < 0 || to >= steps.length || to === current) return;
    const from = steps[current];
    if (to > current && !stepIsValid(from)) {
      if (motion) motion.animate(from, { x: [0, -10, 8, -5, 0] }, { duration: 0.45 });
      return;
    }
    hint.hidden = true;
    const dir = to > current ? 1 : -1;
    busy = true;
    if (motion) await motion.animate(from, { opacity: 0, y: -24 * dir }, { duration: 0.28, ease: 'easeIn' }).finished;
    current = to;
    render();
    const step = steps[current];
    if (motion) {
      motion.animate(step, { opacity: [0, 1], y: [32 * dir, 0] }, { duration: 0.7, ease });
      motion.animate($$('.opt, .bf-text, .field', step), { opacity: [0, 1], y: [14, 0] }, { duration: 0.6, ease, delay: motion.stagger(0.04, { startDelay: 0.1 }) });
    }
    busy = false;
    focusStep(step);
  }

  $('.bf-start', form).addEventListener('click', () => go(1));
  next.addEventListener('click', () => go(current + 1));
  back.addEventListener('click', () => go(current - 1));

  // Escolha única avança sozinha, com uma pausa para ver a marcação.
  form.addEventListener('change', (e) => {
    // "Só eu" e "Nada ainda" não combinam com as outras opções do grupo.
    if (e.target.type === 'checkbox' && e.target.checked) {
      const exclusive = e.target.hasAttribute('data-only');
      $$(`input[name="${e.target.name}"]`, form).forEach((box) => {
        if (box !== e.target && (exclusive || box.hasAttribute('data-only'))) box.checked = false;
      });
    }
    if (e.target.type !== 'radio') return;
    hint.hidden = true;
    const at = current;
    setTimeout(() => { if (current === at) go(current + 1); }, 320);
  });
  form.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.target.tagName === 'TEXTAREA' && e.shiftKey) return;
    if (e.target.tagName === 'BUTTON') return;
    e.preventDefault();
    if (current < steps.length - 1) go(current + 1);
    else form.requestSubmit();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!stepIsValid(steps[current])) return;

    // Junta as respostas de múltipla escolha em uma linha só, na ordem das perguntas.
    const raw = new FormData(form);
    const data = new FormData();
    raw.forEach((value, key) => {
      if (!key.endsWith('[]')) return data.append(key, value);
      const name = key.slice(0, -2);
      if (!data.has(name)) data.append(name, raw.getAll(key).join(', '));
    });
    const company = data.get('Empresa');
    if (company) data.set('subject', `Novo pré-briefing: ${company}`);

    status.hidden = true;
    submit.disabled = true;
    submitLabel.textContent = 'Enviando…';
    try {
      const response = await fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: data });
      const result = await response.json();
      if (!response.ok || String(result.success) !== 'true') throw new Error(result.message);
      form.hidden = true;
      done.hidden = false;
      done.focus({ preventScroll: true });
      if (motion) motion.animate(done, { opacity: [0, 1], y: [24, 0] }, { duration: 0.9, ease });
    } catch {
      status.hidden = false;
      status.textContent = 'Não foi possível enviar agora. Tente de novo ou escreva para ';
      const mail = document.createElement('a');
      mail.href = `mailto:${contactEmail}`;
      mail.textContent = contactEmail;
      status.append(mail, '.');
    } finally {
      submit.disabled = false;
      submitLabel.textContent = 'Enviar pré-briefing';
    }
  });

  render();

  if (!motion) return;
  const { animate, stagger } = motion;
  animate('.land-briefing', { opacity: [0, 1], scale: [1.08, 1] }, { duration: 2, ease });
  animate('.bf-card', { opacity: [0, 1], y: [40, 0] }, { duration: 1.1, ease, delay: 0.3 });
  animate('.bf-intro > *', { opacity: [0, 1], y: [20, 0] }, { duration: 0.9, ease, delay: stagger(0.08, { startDelay: 0.5 }) });
  animate('.site-header', { opacity: [0, 1], y: [-12, 0] }, { duration: 0.8, delay: 0.4 });
})();
