// Shared engine for the HTML slide decks under public/slides/. A deck is a
// .stage of .slide sections; this file adds theming, scaling and navigation.

// Follow the site theme (same localStorage key); ?theme=light|dark overrides it.
// Runs from <head> so the right theme is applied before first paint.
(function () {
  try {
    var forced = new URLSearchParams(location.search).get('theme');
    var theme = forced || localStorage.getItem('theme');
    var dark = theme ? theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.classList.add('dark');
  } catch {
    // localStorage can be blocked; fall back to the light theme.
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const WIDTH = 1280;
  const HEIGHT = 720;
  const stage = document.querySelector('.stage');
  const slides = [...document.querySelectorAll('.slide')];
  const progress = document.createElement('div');
  const pad = (n) => String(n).padStart(2, '0');
  let index = 0;

  progress.className = 'progress';
  document.body.appendChild(progress);

  // Every slide except .bare ones (cover, closing) gets the brand + page footer.
  slides.forEach((slide, n) => {
    if (slide.classList.contains('bare')) return;
    const foot = document.createElement('footer');
    foot.className = 'foot';
    foot.innerHTML =
      '<span class="brand"><span class="mark"></span>OSSCA Chromium</span>' +
      '<span>' + pad(n + 1) + ' / ' + pad(slides.length) + '</span>';
    slide.appendChild(foot);
  });

  // Bar charts only list <b>value</b><span>label</span>; draw each bar
  // relative to the chart's largest value.
  document.querySelectorAll('.bars').forEach((chart) => {
    const values = [...chart.querySelectorAll('b')];
    const max = Math.max(...values.map((v) => Number(v.textContent)));
    values.forEach((value) => {
      const bar = document.createElement('i');
      bar.style.setProperty('--ratio', Number(value.textContent) / max);
      value.after(bar);
    });
  });

  // Slides are laid out at 1280x720 and scaled to fit the viewport.
  function fit() {
    stage.style.setProperty('--scale', Math.min(innerWidth / WIDTH, innerHeight / HEIGHT));
  }

  function show(i) {
    index = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach((s, n) => s.classList.toggle('active', n === index));
    progress.style.width = ((index + 1) / slides.length) * 100 + '%';
    // Keep the slide number in the URL so a slide can be linked and reloaded.
    try {
      history.replaceState(null, '', '#' + (index + 1));
    } catch {
      // Some embedders forbid history changes; navigation still works.
    }
  }

  function fromHash() {
    const n = parseInt(location.hash.slice(1), 10);
    show(Number.isNaN(n) ? 0 : n - 1);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') show(index + 1);
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') show(index - 1);
    if (e.key === 'Home') show(0);
    if (e.key === 'End') show(slides.length - 1);
    if (e.key === 'f') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(() => {});
    }
  });
  // Click right half → next, left half → previous.
  document.addEventListener('click', (e) => {
    show(e.clientX > innerWidth / 2 ? index + 1 : index - 1);
  });
  addEventListener('hashchange', fromHash);
  addEventListener('resize', fit);
  // When embedded in the site, follow its theme toggle live.
  addEventListener('storage', (e) => {
    if (e.key === 'theme') document.documentElement.classList.toggle('dark', e.newValue === 'dark');
  });

  fit();
  fromHash();
});
