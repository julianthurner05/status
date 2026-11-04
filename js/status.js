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
// Nur Hosts auf sound-dna.media (oder deren Subdomains) – geprüft am
// echten Hostnamen, damit z. B. evil.com/sound-dna.media nicht durchgeht.
// Ohne gültiges from bleibt der Button ausgeblendet.
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

const btn = document.getElementById('back-btn');
const target = portalUrl(params.get('from'));
if (btn && target) {
  btn.href = target;
  btn.hidden = false;
}
