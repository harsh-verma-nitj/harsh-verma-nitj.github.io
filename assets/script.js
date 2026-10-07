(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  const closeMenu = () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
  };
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
      toggle.focus();
    }
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

  const theme = document.getElementById('theme-toggle');
  const applyTheme = dark => {
    document.body.classList.toggle('dark', dark);
    theme.setAttribute('aria-pressed', String(dark));
    theme.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  };
  try { applyTheme(localStorage.getItem('hkv-theme') === 'dark'); } catch { applyTheme(false); }
  theme.addEventListener('click', () => {
    const dark = !document.body.classList.contains('dark');
    applyTheme(dark);
    try { localStorage.setItem('hkv-theme', dark ? 'dark' : 'light'); } catch {}
  });

  const search = document.getElementById('publication-search');
  if (search) {
    const items = Array.from(document.querySelectorAll('.publication'));
    const yearFilter = document.getElementById('publication-year');
    const typeFilter = document.getElementById('publication-type');
    const count = document.getElementById('publication-count');
    const pagination = document.querySelector('.publication-pagination');
    const pageLabel = document.getElementById('publication-page');
    const previous = document.getElementById('publication-prev');
    const next = document.getElementById('publication-next');
    const empty = document.getElementById('publication-empty');
    const size = 12;
    let page = 1;
    const update = (reset = false) => {
      if (reset) page = 1;
      const words = search.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
      const matches = items.filter(item => words.every(word => item.textContent.toLocaleLowerCase().includes(word)) &&
        (yearFilter.value === 'all' || item.dataset.year === yearFilter.value) &&
        (typeFilter.value === 'all' || item.dataset.type === typeFilter.value));
      const pages = Math.max(1, Math.ceil(matches.length / size));
      page = Math.min(page, pages);
      const start = (page - 1) * size;
      const visible = new Set(matches.slice(start, start + size));
      items.forEach(item => { item.hidden = !visible.has(item); });
      empty.hidden = matches.length > 0;
      pagination.hidden = matches.length <= size;
      count.textContent = matches.length ? `Showing ${start + 1}–${Math.min(start + size, matches.length)} of ${matches.length} publications` : '0 publications found';
      pageLabel.textContent = `Page ${page} of ${pages}`;
      previous.disabled = page === 1;
      next.disabled = page === pages;
    };
    search.addEventListener('input', () => update(true));
    yearFilter.addEventListener('change', () => update(true));
    typeFilter.addEventListener('change', () => update(true));
    document.getElementById('publication-reset').addEventListener('click', () => {
      search.value = '';
      yearFilter.value = typeFilter.value = 'all';
      update(true);
    });
    previous.addEventListener('click', () => { page--; update(); });
    next.addEventListener('click', () => { page++; update(); });
    update();
  }

  const scholarSearch = document.getElementById('scholar-search');
  if (scholarSearch) {
    const items = Array.from(document.querySelectorAll('.scholar-card'));
    const status = document.getElementById('scholar-status');
    const count = document.getElementById('scholar-count');
    const update = () => {
      const words = scholarSearch.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
      let shown = 0;
      items.forEach(item => {
        const match = words.every(word => item.textContent.toLocaleLowerCase().includes(word)) &&
          (status.value === 'all' || item.dataset.status === status.value);
        item.hidden = !match;
        if (match) shown++;
      });
      count.textContent = `${shown} doctoral ${shown === 1 ? 'record' : 'records'} shown`;
    };
    scholarSearch.addEventListener('input', update);
    status.addEventListener('change', update);
    update();
  }

  if (/\/(?:index\.html)?$/.test(location.pathname)) {
    const routes = {
      '#publications': 'publications.html', '#experience': 'experience.html',
      '#supervision': 'supervision.html', '#research': 'research.html',
      '#projects': 'research.html#projects', '#patents': 'research.html#patents',
      '#consultancy': 'research.html#consultancy', '#contact': 'contact.html'
    };
    if (routes[location.hash]) location.replace(routes[location.hash]);
  }
})();
