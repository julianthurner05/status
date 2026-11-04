/* ================================================================
   STATUS – Rückkehrzeit (?until=) und Button zurück ins Portal (?from=)
   Cloudflare leitet im Wartungs-/Notfall hierher um und hängt die
   Ursprungs-URL an, z. B. /down?from=ikea-serviceportal.sound-dna.media/dashboard
   ================================================================ */
const params = new URLSearchParams(location.search);

// ---- Rückkehrzeit, z. B. ?until=16:00 ----
const until = params.get('until');
const eta = document.getElementById('eta');
if (until && eta) {
  document.getElementById('eta-value').textContent = until.slice(0, 40);
  eta.hidden = false;
}

// ---- Zurück ins Portal ----
// Nur Hosts auf sound-dna.media (oder deren Subdomains) – alles andere
// würde den Button zum offenen Redirect machen. Ohne gültiges from: kein Button.
function portalUrl(from) {
  if (!from) return null;
  try {
    const url = new URL('https://' + from.trim().replace(/^https?:\/\//i, ''));
    const host = url.hostname;
    return host === 'sound-dna.media' || host.endsWith('.sound-dna.media') ? url.href : null;
  } catch {
    return null;
  }
}

// Ein Ping vorab kann von hier aus nicht erkennen, ob Cloudflare noch
// umleitet (Cross-Origin bleibt die Antwort undurchsichtig). Stattdessen:
// Klick merken – kommt der Nutzer kurz darauf wieder hier an, ist das
// Portal noch nicht zurück, und die Rückmeldung erscheint.
const RETRY_KEY = 'status-retry';
const RETRY_WINDOW = 60 * 1000;

function store(value) {
  try {
    if (value) sessionStorage.setItem(RETRY_KEY, value);
    else sessionStorage.removeItem(RETRY_KEY);
  } catch {}
}

function recentRetry() {
  try {
    const at = Number(sessionStorage.getItem(RETRY_KEY));
    return at > 0 && Date.now() - at < RETRY_WINDOW;
  } catch {
    return false;
  }
}

const btn = document.getElementById('back-btn');
const target = portalUrl(params.get('from'));

if (btn && target) {
  btn.href = target;
  btn.hidden = false;

  if (recentRetry()) document.getElementById('back-note').hidden = false;
  store(null);

  btn.addEventListener('click', (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;   // neuer Tab: kein Rückläufer hier
    store(String(Date.now()));
  });
}
