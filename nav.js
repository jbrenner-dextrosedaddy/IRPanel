// Shared navigation for interventionalradiology.ai
// Update this file to add/remove pages from the nav across all pages

const NAV_LINKS = [
  { href: 'index.html',  id: 'nav-home',  label: 'Home' },
  { href: 'panel.html',  id: 'nav-panel', label: 'SIR Mentors Panel' },
  { href: 'pph.html',    id: 'nav-pph',   label: 'Global IR PPH' },
  { href: 'hcc.html',          id: 'nav-hcc',          label: 'HCC LDT' },
  { href: 'nerve-blocks.html', id: 'nav-nerve-blocks', label: 'Nerve Blocks' },
];

(function() {
  // Build the nav links HTML
  const ul = document.getElementById('navLinks');
  if (!ul) return;
  ul.innerHTML = NAV_LINKS.map(link =>
    `<li><a href="${link.href}" id="${link.id}">${link.label}</a></li>`
  ).join('');

  // Mark the current page as active
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  NAV_LINKS.forEach(link => {
    if (link.href === currentFile) {
      const el = document.getElementById(link.id);
      if (el) el.classList.add('active');
    }
  });
})();
