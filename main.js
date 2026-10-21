/* Nans Jullien — animations du portfolio */
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 0. Statistiques de visite (GoatCounter, sans cookies)
     Pour activer : crée un compte gratuit sur goatcounter.com, puis mets ton code ci-dessous.
     Exemple : const GOATCOUNTER = 'nansjullien'; */
  const GOATCOUNTER = '';
  if (GOATCOUNTER && location.hostname !== 'localhost') {
    const gc = document.createElement('script');
    gc.async = true;
    gc.src = 'https://gc.zgo.at/count.js';
    gc.dataset.goatcounter = `https://${GOATCOUNTER}.goatcounter.com/count`;
    document.head.append(gc);
  }

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
    '.hero-kicker', '.hero-sub', '.topo-kicker', '.topo-text', '.reach-sub', '.reach-row', '.hero-facts', '.hero-actions', '.section-head', '.pindex li',
    '.link-arrow',
    '.project-back', '.project-tags', '.project-hero-visual', '.project-block',
    '.project-images > *', '.project-nav', '.about-grid > *', '.about-section', '.about-cta', '.reach-portrait'
  ].join(',');
  document.querySelectorAll(auto).forEach(el => el.classList.add('reveal'));
  document.querySelectorAll('.reach-row').forEach(row => row.style.setProperty('--rd', `${[...row.parentElement.children].indexOf(row) * 0.08}s`));

  const targets = document.querySelectorAll('.reveal, [data-split], .hold, .topo');
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
  const nav = document.querySelector('.nav');
  (nav || document.body).append(bar);
  const onScroll = () => {
    const h = root.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    nav && nav.classList.toggle('is-scrolled', scrollY > 30);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* 3c. Retour en haut */
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
    let lastY = scrollY, vel = 0, scrollDir = 1, visible = true, raf = 0;
    addEventListener('resize', () => tracks.forEach(t => { t.half = t.el.scrollWidth / 2; }));
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(run);
    }).observe(tapes);
    const run = () => {
      if (!visible) { raf = 0; return; }
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
      raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
  }

  /* 3e. Navigation : prise qui suit la section active */
  const ind = document.querySelector('.nav-ind');
  if (ind) {
    const links = [...document.querySelectorAll('.nav-links a')];
    const moveTo = a => {
      if (!a) { ind.classList.remove('on'); return; }
      const box = a.parentElement.getBoundingClientRect(), r = a.getBoundingClientRect();
      ind.style.setProperty('--ix', `${r.left - box.left + r.width / 2 - 4.5}px`);
      ind.style.setProperty('--ir', `${(links.indexOf(a) + 1) * 70}deg`);
      ind.classList.add('on');
    };
    const current = () => links.find(a => a.classList.contains('is-active') || a.getAttribute('aria-current') === 'page');
    const sections = links.map(a => a.getAttribute('href')).filter(h => h.startsWith('#')).map(h => document.querySelector(h)).filter(Boolean);
    if (sections.length) {
      const spyScroll = () => {
        const mid = innerHeight * 0.4;
        let hit = null;
        sections.forEach(sec => { const r = sec.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) hit = sec; });
        links.forEach(a => a.classList.toggle('is-active', !!hit && a.getAttribute('href') === '#' + hit.id));
        moveTo(current());
      };
      addEventListener('scroll', spyScroll, { passive: true });
      spyScroll();
    } else {
      moveTo(current());
    }
    links.forEach(a => {
      a.addEventListener('mouseenter', () => moveTo(a));
      a.addEventListener('mouseleave', () => moveTo(current()));
    });
    addEventListener('resize', () => moveTo(current()));
    document.fonts && document.fonts.ready.then(() => moveTo(current()));
  }


  /* 3f. Index des projets : aperçu qui suit la souris */
  const pf = document.querySelector('.pfloat');
  if (pf && matchMedia('(pointer: fine)').matches) {
    let px = 0, py = 0, fx = 0, fy = 0, active = false, raf2 = 0;
    const follow = () => {
      fx += (px - fx) * 0.18; fy += (py - fy) * 0.18;
      pf.style.transform = `translate3d(${fx + 36}px, ${fy - 96}px, 0)`;
      raf2 = active || Math.abs(px - fx) > .5 ? requestAnimationFrame(follow) : 0;
    };
    document.querySelectorAll('.prow').forEach(row => {
      row.addEventListener('mouseenter', e => {
        pf.innerHTML = row.querySelector('.prow-thumb').innerHTML;
        ['--pc', '--pc-on'].forEach(v => pf.style.setProperty(v, row.style.getPropertyValue(v)));
        if (!active) { fx = px = e.clientX; fy = py = e.clientY; }
        active = true; pf.classList.add('on');
        if (!raf2) raf2 = requestAnimationFrame(follow);
      });
      row.addEventListener('mousemove', e => { px = e.clientX; py = e.clientY; });
      row.addEventListener('mouseleave', () => { active = false; pf.classList.remove('on'); });
    });
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
