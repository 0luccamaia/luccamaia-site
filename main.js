(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const isDesktop = () => matchMedia('(min-width: 801px)').matches;

  /* Menu do celular: funciona mesmo sem o Motion e com movimento reduzido */
  const menu = $('#menu');
  const menuBtn = $('.menu-btn');
  const menuLabel = $('.menu-btn-label');

  function setMenu(open, returnFocus = true) {
    root.classList.toggle('menu-open', open);
    menu.inert = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuLabel.textContent = open ? 'Fechar' : 'Menu';
    if (open) $('a', menu).focus({ preventScroll: true });
    else if (returnFocus) menuBtn.focus({ preventScroll: true });
  }

  menuBtn.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('menu-open')) setMenu(false);
  });
  matchMedia('(min-width: 801px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false, false);
  });
  $$('a[href^="#"]', menu).forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      setMenu(false, false);
      const instant = matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Espera o html destravar antes de rolar até a seção.
      requestAnimationFrame(() => {
        $(link.getAttribute('href')).scrollIntoView({ behavior: instant ? 'auto' : 'smooth' });
      });
    });
  });

  /* Processo: um painel aberto de cada vez (no celular, dá para fechar todos) */
  const steps = $$('.step');
  function openStep(step) {
    steps.forEach((s) => {
      const on = s === step;
      s.classList.toggle('is-open', on);
      $('.step-toggle', s).setAttribute('aria-expanded', String(on));
    });
  }
  steps.forEach((step) => {
    const toggle = $('.step-toggle', step);
    toggle.addEventListener('click', () => {
      if (!step.classList.contains('is-open')) openStep(step);
      else if (!isDesktop()) openStep(null);
    });
    toggle.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse' && isDesktop()) openStep(step);
    });
  });
  matchMedia('(min-width: 801px)').addEventListener('change', (e) => {
    if (e.matches && !$('.step.is-open')) openStep(steps[0]);
  });

  /* Projetos: abrem em tela cheia; o diálogo nativo cuida do foco e da tecla Esc */
  const motionOn = () => window.Motion && root.classList.contains('js');
  const motionEase = [0.16, 1, 0.3, 1];

  function openProject(id) {
    const dialog = $(`#projeto-${id}`);
    $$('dialog[open]').forEach((d) => d.close());
    dialog.showModal();
    dialog.scrollTop = 0;
    if (!motionOn()) return;
    const { animate, inView } = window.Motion;
    animate(dialog, { clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'] }, { duration: 0.8, ease: [0.76, 0, 0.24, 1] });
    animate($('h2', dialog), { y: ['30%', '0%'], opacity: [0, 1] }, { duration: 1, ease: motionEase, delay: 0.25 });
    if (dialog.dataset.revealed) return;
    dialog.dataset.revealed = 'true';
    $$('figure, blockquote', dialog).forEach((el) => {
      el.style.opacity = 0;
      inView(el, () => {
        animate(el, { opacity: [0, 1], y: [48, 0] }, { duration: 0.9, ease: motionEase });
      }, { root: dialog, amount: 0.15 });
    });
  }

  $$('[data-project]').forEach((btn) => {
    btn.addEventListener('click', () => openProject(btn.dataset.project));
  });
  $$('.project-close').forEach((btn) => {
    btn.addEventListener('click', () => btn.closest('dialog').close());
  });

  /* Formulário: envia sem sair da página; sem script, o envio normal também funciona */
  const form = $('.lead-form');
  const formDone = $('.form-done');
  const formStatus = $('.form-status');
  const formSubmit = $('.form-submit');
  const formSubmitLabel = $('.form-submit-label');
  const contactEmail = 'studioluccamaia@gmail.com';

  function showFormError() {
    formStatus.hidden = false;
    formStatus.textContent = 'Não foi possível enviar agora. Tente de novo ou escreva para ';
    const mail = document.createElement('a');
    mail.href = `mailto:${contactEmail}`;
    mail.textContent = contactEmail;
    formStatus.append(mail, '.');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    form.classList.add('was-checked');
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const interests = data.getAll('Interesse[]');
    data.delete('Interesse[]');
    if (interests.length) data.set('Interesse', interests.join(', '));

    formStatus.hidden = true;
    formSubmit.disabled = true;
    formSubmitLabel.textContent = 'Enviando…';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      const result = await response.json();
      if (!response.ok || String(result.success) !== 'true') throw new Error(result.message);
      form.hidden = true;
      formDone.hidden = false;
      formDone.focus({ preventScroll: true });
      if (motionOn()) {
        window.Motion.animate(formDone, { opacity: [0, 1], y: [24, 0] }, { duration: 0.8, ease: motionEase });
      }
    } catch {
      showFormError();
    } finally {
      formSubmit.disabled = false;
      formSubmitLabel.textContent = 'Enviar';
    }
  });

  if (!root.classList.contains('js')) return;

  // Se o Motion não carregar, a página continua inteira, só que estática.
  if (!window.Motion) {
    root.classList.remove('js');
    return;
  }

  const { animate, scroll, inView, stagger } = window.Motion;
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const hasPointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const ease = motionEase;

  // Cor do cabeçalho conforme o fundo logo abaixo dele.
  const header = $('.site-header');
  const toned = $$('[data-tone]:not(.chapter)');
  function updateHeaderTone() {
    let tone = 'light';
    toned.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top <= 50 && r.bottom > 50) tone = el.dataset.tone;
    });
    header.classList.toggle('on-dark', tone === 'dark');
  }

  // Liga uma animação à rolagem de um trecho da página.
  const scrub = (el, keyframes, target, offset) =>
    scroll(animate(el, keyframes, { ease: 'linear', duration: 1 }), { target, offset });

  // Separa o texto em palavras para acendê-las uma a uma.
  function splitWords(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.append(' ');
        } else {
          const w = document.createElement('span');
          w.className = 'w';
          w.textContent = part;
          frag.append(w);
        }
      });
      node.replaceWith(frag);
    });
    return $$('.w', el);
  }

  // Mouse suavizado, compartilhado pelas paisagens.
  let px = 0, py = 0, cx = 0, cy = 0;
  if (hasPointer) {
    addEventListener('pointermove', (e) => {
      px = e.clientX / innerWidth - 0.5;
      py = e.clientY / innerHeight - 0.5;
    });
  }

  /* Entrada */
  const intro = $('.intro');
  const heroRidges = $$('.land-hero .ridge');
  async function playIntro() {
    await animate($('img', intro), { scale: [0.4, 1], opacity: [0, 1] }, { duration: 0.6, ease }).finished;
    animate($('img', intro), { rotate: '180deg' }, { duration: 0.6, ease });
    await animate(intro, { clipPath: ['inset(0 0 0% 0)', 'inset(0 0 100% 0)'] }, { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.15 }).finished;
    intro.remove();
  }
  playIntro();
  animate(heroRidges, { y: ['40%', '0%'] }, { duration: 2.2, ease, delay: stagger(0.09, { startDelay: 0.75 }) });
  animate('.sun', { opacity: [0, 1], scale: [0.6, 1] }, { duration: 2.4, ease, delay: 0.9 });
  animate('.land-hero .fog', { opacity: [0, 1] }, { duration: 2.5, delay: 1.2 });
  animate('.hero-title .line > span', { y: ['110%', '0%'] }, { duration: 1.2, ease, delay: stagger(0.12, { startDelay: 1.1 }) });
  animate('.hero-tag', { opacity: [0, 1], y: [12, 0] }, { duration: 0.9, ease, delay: 1.0 });
  animate('.hero-sub', { opacity: [0, 1], y: [12, 0] }, { duration: 0.9, ease, delay: 1.45 });
  animate('.hero-meta', { opacity: [0, 1] }, { duration: 1.2, delay: 1.7 });
  animate('.site-header', { opacity: [0, 1], y: [-12, 0] }, { duration: 0.8, delay: 1.3 });
  animate('.scroll-btn', { opacity: [0, 1], scale: [0.5, 1] }, { type: 'spring', stiffness: 220, damping: 16, delay: 1.6 });

  /* Capa: a moldura se abre, as montanhas ganham profundidade e a palavra sobe atrás delas */
  const heroTrack = $('.hero-track');
  const heroFrame = $('.hero-frame');
  const frameInset = isDesktop() ? 'inset(10px round 28px)' : 'inset(8px round 20px)';
  scrub(heroFrame, { clipPath: [frameInset, 'inset(0px round 0px)'] }, heroTrack, ['start start', '45% end']);
  scrub('.hero-word', { y: ['100%', '-12%'] }, heroTrack, ['start start', 'end end']);
  scrub('.hero-copy', { y: ['0vh', '-16vh'], opacity: [1, 0] }, heroTrack, ['start start', '50% end']);
  scrub('.hero-meta', { opacity: [1, 0] }, heroTrack, ['start start', '30% end']);

  // Paralaxe por profundidade: rolagem e mouse somados sem um sobrescrever o outro.
  function parallax(layers, progress, scrollDepth, mouseDepth) {
    layers.forEach((layer) => {
      const d = Number(layer.dataset.depth);
      layer.style.translate = `${cx * d * -mouseDepth}vw ${-progress * d * scrollDepth + cy * d * -mouseDepth * 0.5}vh`;
    });
  }
  const watched = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => watched.set(en.target, en.isIntersecting));
  });

  let heroProgress = 0;
  scroll((p) => { heroProgress = p; }, { target: heroTrack, offset: ['start start', 'end end'] });
  const sun = $('.sun');
  io.observe(heroTrack);

  /* Porque: um capítulo de cada vez, com o céu mudando junto */
  const manifesto = $('.manifesto');
  const manifestoTrack = $('.manifesto-track');
  const skyRidges = $$('.land-sky .ridge');
  const chapters = $$('.chapter');
  const chapterWords = chapters.map(splitWords);
  const chapterNow = $('.chapter-now');
  const fade = 0.12;
  // Céu (três tons) e quatro cordilheiras para cada capítulo: manhã, dia, entardecer, noite e o gradiente da marca.
  // A névoa clara só faz sentido nos céus claros.
  const fogs = [1, 1, 0.35, 0.12, 0.3];
  const palettes = [
    ['#eef3f5', '#dbe7ed', '#c4d8e1', '#b9cfd9', '#94b3c2', '#6890a4', '#2c566b'],
    ['#e3edf2', '#eef3f5', '#f7f9fa', '#c9d8df', '#a5bfcb', '#7c9fb0', '#41687b'],
    ['#0b3347', '#1f5d78', '#5f97ae', '#2b6680', '#1a4c63', '#0f3547', '#06202c'],
    ['#040607', '#0b1419', '#16252d', '#1a2930', '#121d23', '#0b1318', '#05090c'],
    ['#000000', '#004a6b', '#8cb9cc', '#00638e', '#004a6b', '#002c40', '#000000'],
  ].map((pal) => pal.map((hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))));
  const skyVars = ['--s1', '--s2', '--s3', '--r1', '--r2', '--r3', '--r4'];
  const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(' ')})`;
  const smoothstep = (t) => t * t * (3 - 2 * t);
  let manifestoProgress = 0;
  io.observe(manifestoTrack);

  scroll((p) => {
    manifestoProgress = p;
    const position = p * chapters.length;
    const current = Math.min(chapters.length - 1, Math.floor(position));
    chapters.forEach((chapter, i) => {
      const local = position - i;
      const isLast = i === chapters.length - 1;
      const visible = local >= 0 && (local < 1 || isLast);
      const enter = clamp01(local / fade);
      const leave = isLast ? 0 : clamp01((local - (1 - fade)) / fade);
      chapter.style.opacity = visible ? enter * (1 - leave) : 0;
      chapter.style.transform = `translateY(${(1 - enter) * 40 - leave * 40}px)`;
      const words = chapterWords[i];
      const lit = (local / 0.72) * (words.length + 2);
      words.forEach((w, j) => { w.style.opacity = 0.18 + clamp01(lit - j) * 0.82; });
    });

    // O céu passa para o próximo capítulo no último quinto de cada um.
    const frac = position - current;
    const next = Math.min(palettes.length - 1, current + 1);
    const t = smoothstep(clamp01((frac - 0.8) / 0.2));
    skyVars.forEach((name, i) => manifesto.style.setProperty(name, mix(palettes[current][i], palettes[next][i], t)));
    manifesto.style.setProperty('--fog', fogs[current] + (fogs[next] - fogs[current]) * t);

    manifesto.dataset.tone = chapters[current].dataset.tone;
    updateHeaderTone();
    chapterNow.textContent = String(current + 1).padStart(2, '0');
  }, { target: manifestoTrack, offset: ['start start', 'end end'] });

  /* Estudo: as dunas andam devagar */
  const studyTrack = $('.study-track');
  const duneLayers = $$('.land-dunes .ridge');
  let studyProgress = 0;
  io.observe(studyTrack);

  (function tick() {
    cx += (px - cx) * 0.06;
    cy += (py - cy) * 0.06;
    if (watched.get(heroTrack)) {
      parallax(heroRidges, heroProgress, 1.8, 0.5);
      sun.style.translate = `calc(-50% + ${cx * -0.6}vw) calc(40% + ${heroProgress * 14}vh)`;
    }
    if (watched.get(manifestoTrack)) parallax(skyRidges, manifestoProgress, 1.6, 0.35);
    if (watched.get(studyTrack)) parallax(duneLayers, studyProgress, 2.4, 0.3);
    requestAnimationFrame(tick);
  })();

  /* Sobre: foto gira com a rolagem e os números contam */
  scrub('.bio-photo', { rotate: ['-3deg', '2deg'] }, $('.bio-grid'), ['start end', 'end start']);
  scrub('.bio-photo img', { scale: [1.16, 1] }, $('.bio-grid'), ['start end', 'center center']);
  $$('.stat').forEach((stat, i) => {
    const value = $('dd', stat);
    const target = Number(value.dataset.count);
    const suffix = value.dataset.suffix || '';
    if (target) value.textContent = `0${suffix}`;
    inView(stat, () => {
      animate(stat, { opacity: [0, 1], y: [28, 0] }, { duration: 0.9, ease, delay: (i % 3) * 0.08 });
      if (target) {
        animate(0, target, {
          duration: 1.6,
          ease,
          onUpdate: (v) => { value.textContent = `${Math.round(v)}${suffix}`; },
        });
      }
    }, { amount: 0.6 });
  });

  // Frases grandes acendem conforme a rolagem.
  $$('.reveal-words').forEach((el) => {
    const words = splitWords(el);
    scroll((p) => {
      const lit = p * (words.length + 2);
      words.forEach((w, i) => { w.style.opacity = 0.16 + clamp01(lit - i) * 0.84; });
    }, { target: el, offset: ['start 88%', 'end 58%'] });
  });

  /* Estudo: Pensar, Expressar e Sustentar acendem em sequência */
  const studyWords = $$('.study-words span');
  scroll((p) => {
    studyProgress = p;
    const lit = p * (studyWords.length + 0.6);
    studyWords.forEach((word, i) => {
      const v = clamp01((lit - i) / 0.7);
      word.style.opacity = 0.14 + v * 0.86;
      word.style.transform = `translateX(${(1 - v) * -5}vw)`;
      word.style.color = v > 0 && v < 1 ? 'var(--mist)' : '';
    });
  }, { target: studyTrack, offset: ['start start', 'end end'] });

  /* Processo: os painéis entram em sequência */
  inView('.steps', () => {
    animate('.step', { opacity: [0, 1], y: [40, 0] }, { duration: 1, ease, delay: stagger(0.08) });
  }, { amount: 0.2 });
  inView('.process-intro', (el) => {
    animate(el, { opacity: [0, 1], y: [30, 0] }, { duration: 1, ease });
  });

  /* Projetos: trilho horizontal preso na tela (no celular vira lista) */
  const projectsTrack = $('.projects-track');
  const rail = $('.rail');
  const cards = $$('.card');
  const projectsTitle = $('.projects-title');
  const arts = $$('.art img');

  scroll((p) => {
    if (!isDesktop()) {
      rail.style.transform = projectsTitle.style.transform = '';
      cards.forEach((c) => { c.style.rotate = ''; });
      return;
    }
    const travel = rail.scrollWidth - innerWidth;
    rail.style.transform = `translateX(${-travel * p}px)`;
    projectsTitle.style.transform = `translateX(${-(projectsTitle.scrollWidth - innerWidth) * p}px)`;
    cards.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const fromCenter = (r.left + r.width / 2 - innerWidth / 2) / innerWidth;
      card.style.rotate = `${fromCenter * 5}deg`;
      arts[i].style.transform = `translateX(${Math.max(-6, Math.min(6, fromCenter * -9))}%)`;
    });
  }, { target: projectsTrack, offset: ['start start', 'end end'] });

  inView('.projects-title', () => {
    if (!isDesktop()) animate('.projects-title', { opacity: [0, 1], y: [40, 0] }, { duration: 0.9, ease });
  });
  cards.forEach((card) => {
    inView(card, () => {
      if (!isDesktop()) animate(card, { opacity: [0, 1], y: [60, 0], scale: [0.94, 1] }, { duration: 0.9, ease });
    }, { amount: 0.2 });
  });

  // Inclinação 3D dos cartões seguindo o mouse.
  if (hasPointer) {
    cards.forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        animate(card, { transform: `perspective(1200px) rotateY(${x * 8}deg) rotateX(${y * -8}deg)` }, { duration: 0.4, ease: 'easeOut' });
      });
      card.addEventListener('pointerleave', () => {
        animate(card, { transform: 'perspective(1200px) rotateY(0deg) rotateX(0deg)' }, { type: 'spring', stiffness: 160, damping: 14 });
      });
    });
  }

  /* Faixa: anda com a rolagem */
  scrub('.marquee-row', { x: ['0%', '-30%'] }, $('.marquee'), ['start end', 'end start']);

  /* Crença: do improvável à referência, pela linha do tempo */
  const flow = $('.flow');
  scrub('.flow-line i', { scaleX: [0, 1] }, flow, ['start 90%', 'center 55%']);
  scrub('.flow-item.is-soft', { opacity: [0, 1], x: [-30, 0] }, flow, ['start 95%', 'center 75%']);
  scrub('.flow-item.is-azure', { opacity: [0, 1], x: [30, 0], scale: [0.9, 1] }, flow, ['start 75%', 'center 55%']);
  $$('.belief-big .line > span').forEach((line, i) => {
    scrub(line, { y: ['120%', '0%'] }, $('.belief-big'), [`start ${88 - i * 6}%`, `center ${58 - i * 6}%`]);
  });

  /* Eu quero: o gradiente nasce do botão e toma a tela */
  const wantTrack = $('.want-track');
  const want = $('.want');
  const wantFill = $('.want-fill');
  scroll((p) => {
    wantFill.style.clipPath = `circle(${clamp01(p / 0.62) * 150}% at 92% 92%)`;
    want.dataset.tone = p > 0.22 ? 'dark' : 'light';
    updateHeaderTone();
  }, { target: wantTrack, offset: ['start start', 'end end'] });
  scrub('.land-want .ridge', { y: ['30%', '0%'] }, wantTrack, ['20% end', '80% end']);
  scrub('.want h2 .line > span', { y: ['115%', '0%'] }, wantTrack, ['start 40%', '55% end']);
  scrub('.want p', { opacity: [0, 1], y: [30, 0] }, wantTrack, ['35% end', '75% end']);
  $$('.contact-intro, .form-card').forEach((el, i) => {
    inView(el, () => {
      animate(el, { opacity: [0, 1], y: [48, 0] }, { duration: 0.9, ease, delay: i * 0.1 });
    }, { amount: 0.1 });
  });

  /* Cabeçalho: cor conforme o fundo e seção atual em destaque */
  const stops = ['#porque', '#sobre', '#processo', '#projetos', '#eu-quero', '#contato'].map((s) => $(s));
  const contact = $('#contato');
  const links = $$('.site-header nav a, .menu nav a');
  let lastY = scrollY;
  scroll((p) => {
    // Some ao descer para não cobrir o texto; volta ao subir e no fim da página.
    const goingDown = scrollY > lastY;
    if (scrollY !== lastY) header.classList.toggle('is-hidden', goingDown && scrollY > heroTrack.offsetHeight && p < 0.97);
    lastY = scrollY;

    updateHeaderTone();

    const active = stops.filter((s) => s.getBoundingClientRect().top <= innerHeight * 0.5).pop();
    root.classList.toggle('at-contact', contact.getBoundingClientRect().top < innerHeight * 0.7);
    // "Eu quero" abre o formulário, mas também fica ativo durante a transição.
    const activeId = active && active.id === 'eu-quero' ? 'contato' : active && active.id;
    links.forEach((a) => {
      if (activeId && a.getAttribute('href') === `#${activeId}`) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  });

  /* Botão: anel de progresso, próxima seção e efeito magnético */
  const btn = $('.scroll-btn');
  const ring = $('.scroll-btn-ring circle');
  const arrow = $('.scroll-btn-arrow');
  let atEnd = false;
  scroll((p) => {
    ring.style.strokeDashoffset = 1 - p;
    const end = p > 0.985;
    if (end !== atEnd) {
      atEnd = end;
      animate(arrow, { rotate: end ? '180deg' : '0deg' }, { type: 'spring', stiffness: 200, damping: 14 });
      btn.setAttribute('aria-label', end ? 'Voltar ao início' : 'Ir para a próxima seção');
    }
  });
  btn.addEventListener('click', () => {
    if (atEnd) return scrollTo({ top: 0, behavior: 'smooth' });
    const next = stops.find((s) => s.getBoundingClientRect().top > 8);
    (next || stops[stops.length - 1]).scrollIntoView({ behavior: 'smooth' });
  });
  // A seta já está girada 90° no CSS, então o eixo x dela aponta para baixo.
  animate(arrow, { x: [0, 4, 0] }, { duration: 1.8, repeat: Infinity, ease: 'easeInOut' });

  if (hasPointer) {
    const cursor = $('.cursor');
    let bx = 0, by = 0, magnet = false;
    addEventListener('pointermove', (e) => {
      animate(cursor, { x: e.clientX, y: e.clientY }, { duration: 0.18, ease: 'easeOut' });
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2 - bx);
      const dy = e.clientY - (r.top + r.height / 2 - by);
      const near = Math.hypot(dx, dy) < 130;
      if (near) {
        bx = dx * 0.35;
        by = dy * 0.35;
        animate(btn, { x: bx, y: by }, { type: 'spring', stiffness: 260, damping: 18 });
      } else if (magnet) {
        bx = by = 0;
        animate(btn, { x: 0, y: 0 }, { type: 'spring', stiffness: 180, damping: 12 });
      }
      magnet = near;
    });
    $$('a, button').forEach((el) => {
      el.addEventListener('pointerenter', () => animate(cursor, { scale: 3.4 }, { type: 'spring', stiffness: 300, damping: 20 }));
      el.addEventListener('pointerleave', () => animate(cursor, { scale: 1 }, { type: 'spring', stiffness: 300, damping: 20 }));
    });
  }
})();
