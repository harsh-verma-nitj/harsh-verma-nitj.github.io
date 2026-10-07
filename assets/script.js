document.getElementById('year').textContent = new Date().getFullYear();
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

const publicationItems = Array.from(document.querySelectorAll('.publication'));
const search = document.getElementById('publication-search');
const yearFilter = document.getElementById('publication-year');
const typeFilter = document.getElementById('publication-type');
const resultCount = document.getElementById('publication-count');
const pagination = document.querySelector('.publication-pagination');
const pageLabel = document.getElementById('publication-page');
const previous = document.getElementById('publication-prev');
const next = document.getElementById('publication-next');
const empty = document.getElementById('publication-empty');
const pageSize = 12;
let currentPage = 1;

function updatePublications(resetPage = false) {
  if (resetPage) currentPage = 1;
  const words = search.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const matches = publicationItems.filter(item => {
    const text = item.textContent.toLocaleLowerCase();
    return words.every(word => text.includes(word)) &&
      (yearFilter.value === 'all' || item.dataset.year === yearFilter.value) &&
      (typeFilter.value === 'all' || item.dataset.type === typeFilter.value);
  });
  const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
  currentPage = Math.min(currentPage, pageCount);
  const first = (currentPage - 1) * pageSize;
  const shown = new Set(matches.slice(first, first + pageSize));
  publicationItems.forEach(item => { item.hidden = !shown.has(item); });
  empty.hidden = matches.length > 0;
  pagination.hidden = matches.length <= pageSize;
  resultCount.textContent = matches.length ?
    `Showing ${first + 1}–${Math.min(first + pageSize, matches.length)} of ${matches.length} publications` :
    '0 publications found';
  pageLabel.textContent = `Page ${currentPage} of ${pageCount}`;
  previous.disabled = currentPage === 1;
  next.disabled = currentPage === pageCount;
}

search.addEventListener('input', () => updatePublications(true));
yearFilter.addEventListener('change', () => updatePublications(true));
typeFilter.addEventListener('change', () => updatePublications(true));
document.getElementById('publication-reset').addEventListener('click', () => {
  search.value = '';
  yearFilter.value = 'all';
  typeFilter.value = 'all';
  updatePublications(true);
});
previous.addEventListener('click', () => { currentPage--; updatePublications(); });
next.addEventListener('click', () => { currentPage++; updatePublications(); });
updatePublications();
