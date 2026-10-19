/* Nans Jullien — animations du portfolio */
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Découpe des titres en mots (révélation masquée) */
  const makeWord = (content, i) => {
    const w = document.createElement('span');
    w.className = 'word';
    const inner = document.createElement('span');
    inner.style.setProperty('--i', i);
    inner.append(content);
    w.append(inner);
    return w;
  };
  document.querySelectorAll('[data-split]').forEach(el => {
    let i = 0;
    const nodes = [...el.childNodes];
    el.textContent = '';
    nodes.forEach(n => {
      if (n.nodeType === Node.TEXT_NODE) {
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { el.append(' '); return; }
          el.append(makeWord(document.createTextNode(part), i++));
        });
      } else {
        el.append(makeWord(n, i++));
      }
    });
  });

  /* 2. Apparition au scroll */
  const auto = [
    '.hero-kicker', '.hero-sub', '.topo-kicker', '.topo-text', '.wall-sub', '.hero-actions', '.section-head', '.project',
    '.about-text', '.link-arrow', '.mail-big', '.contact-sub',
    '.project-back', '.project-tags', '.project-hero-visual', '.project-block',
    '.project-images > *', '.project-nav', '.about-grid > *', '.about-section',
    '.contact-lines a', '.contact-page > p'
  ].join(',');
  document.querySelectorAll(auto).forEach(el => el.classList.add('reveal'));
  document.querySelectorAll('.contact-lines a').forEach((a, i) => a.style.setProperty('--rd', `${i * 0.08}s`));

  const targets = document.querySelectorAll('.reveal, [data-split], .hold, .topo, .wall-board');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    targets.forEach(el => io.observe(el));
  } else {
    targets.forEach(el => el.classList.add('in'));
  }

  /* 3. Barre de progression */
  const bar = document.createElement('div');
  bar.className = 'progress';
  document.body.append(bar);
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    const h = root.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    nav && nav.classList.toggle('is-scrolled', scrollY > 30);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* 3b. Copier l'adresse email */
  let toast;
  const showToast = msg => {
    if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role','status'); document.body.append(toast); }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove('show'), 2200);
  };
  document.querySelectorAll('[data-copy]').forEach(btn => {
    const tgt = btn.querySelector('[data-copy-label]') || btn;
    const label = tgt.textContent;
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const t = document.createElement('textarea');
        t.value = text; document.body.append(t); t.select();
        document.execCommand('copy'); t.remove();
      }
      tgt.textContent = 'Copiée ✓';
      btn.classList.add('is-done');
      showToast('Adresse copiée dans le presse-papiers');
      setTimeout(() => { tgt.textContent = label; btn.classList.remove('is-done'); }, 2200);
    });
  });


  /* 3c. Horloge d'Aix + retour en haut */
  const clocks = document.querySelectorAll('[data-clock]');
  const tick = () => {
    const t = new Intl.DateTimeFormat('fr-FR', { hour:'2-digit', minute:'2-digit', timeZone:'Europe/Paris' }).format(new Date());
    clocks.forEach(c => { c.textContent = t; });
  };
  if (clocks.length) { tick(); setInterval(tick, 15000); }
  document.querySelectorAll('[data-top]').forEach(b => b.addEventListener('click', () => {
    scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }));




  /* 3d. Sangles : défilement lié au scroll */
  const tapes = document.querySelector('.tapes');
  if (tapes && !reduce) {
    tapes.classList.add('is-live');
    const tracks = [...tapes.querySelectorAll('.tape-track')].map(el => ({
      el, dir: +el.dataset.dir || 1, x: 0, half: el.scrollWidth / 2
    }));
    let lastY = scrollY, vel = 0, scrollDir = 1;
    addEventListener('resize', () => tracks.forEach(t => { t.half = t.el.scrollWidth / 2; }));
    const run = () => {
      const dy = scrollY - lastY; lastY = scrollY;
      if (dy !== 0) scrollDir = dy > 0 ? 1 : -1;
      vel += (Math.abs(dy) - vel) * 0.1;
      const speed = 0.6 + Math.min(vel, 60) * 0.18;
      tracks.forEach(t => {
        t.x -= speed * t.dir * scrollDir;
        if (t.x <= -t.half) t.x += t.half;
        if (t.x > 0) t.x -= t.half;
        t.el.style.transform = `translate3d(${t.x.toFixed(2)}px,0,0)`;
      });
      requestAnimationFrame(run);
    };
    run();
  }

  /* 4. Curseur + parallaxe des prises (souris uniquement) */
  if (reduce || !matchMedia('(pointer: fine)').matches) return;

  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  document.body.append(cursor);

  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.classList.add('on');
  }, { passive: true });
  document.addEventListener('mouseleave', () => cursor.classList.remove('on'));
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button')) cursor.classList.add('is-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button')) cursor.classList.remove('is-hover');
  });

  const holds = [...document.querySelectorAll('.hold')];
  const loop = () => {
    cx += (mx - cx) * 0.22;
    cy += (my - cy) * 0.22;
    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    const nx = mx / innerWidth - 0.5;
    const ny = my / innerHeight - 0.5;
    holds.forEach(h => {
      const d = +h.dataset.depth || 24;
      h.style.transform = `translate3d(${(-nx * d).toFixed(1)}px, ${(-ny * d).toFixed(1)}px, 0)`;
    });
    requestAnimationFrame(loop);
  };
  loop();
})();
