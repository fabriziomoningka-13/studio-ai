// src/lib/exportHtml.js
// Bangun landing page HTML statis & mandiri dari hasil generate — Bagian 7 (fitur opsional).
// Tidak butuh build step apa pun, tinggal dibuka langsung di browser manapun.

function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getContrastText(hex) {
  if (!hex) return '#F8FAFC';
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#F8FAFC';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1B1F3B' : '#F8FAFC';
}

export function buildLandingHtml({ variant, theme, namaProduk }) {
  const [bg = '#12172A', accent = '#1FAE93'] = theme.colors;
  const textColor = getContrastText(bg);
  const mutedColor = textColor === '#1B1F3B' ? 'rgba(27,31,59,0.65)' : 'rgba(248,250,252,0.65)';
  const accentText = getContrastText(accent);

  const fontsQuery = [theme.font_heading, theme.font_body]
    .filter(Boolean)
    .map((f) => f.trim().replace(/\s+/g, '+'))
    .join('&family=');

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(namaProduk || 'Landing Page')}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=${fontsQuery}&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: ${bg};
    color: ${textColor};
    font-family: '${theme.font_body}', sans-serif;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  main { max-width: 640px; text-align: left; }
  h1 {
    font-family: '${theme.font_heading}', serif;
    font-size: clamp(2rem, 5vw, 3rem);
    line-height: 1.15;
    margin-bottom: 16px;
  }
  p {
    font-size: 1.05rem;
    color: ${mutedColor};
    margin-bottom: 28px;
    max-width: 42ch;
  }
  a.cta {
    display: inline-block;
    background: ${accent};
    color: ${accentText};
    padding: 14px 28px;
    border-radius: 10px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
  }
  footer {
    margin-top: 48px;
    font-size: 0.75rem;
    color: ${mutedColor};
    font-family: monospace;
  }
</style>
</head>
<body>
  <main>
    <h1>${escapeHtml(variant.headline)}</h1>
    <p>${escapeHtml(variant.subheadline)}</p>
    <a class="cta" href="#">${escapeHtml(variant.cta)}</a>
    <footer>Dibuat dengan Studio AI — Powered by Claude API</footer>
  </main>
</body>
</html>`;
}

export function downloadLandingHtml({ variant, theme, namaProduk }) {
  const html = buildLandingHtml({ variant, theme, namaProduk });
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  const safeName = (namaProduk || 'landing-page').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  a.download = `${safeName}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
