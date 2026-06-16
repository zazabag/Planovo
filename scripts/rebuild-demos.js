/**
 * Restore full demo HTML from git (before "Remove old *.html" commits)
 * and precompile JSX to *.demo.js for reliable browser loading.
 *
 * Usage: node scripts/rebuild-demos.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const babel = require('@babel/standalone');

const root = path.join(__dirname, '..');

const sources = {
  'education.html': 'd20d081:education.html',
  'clubs.html': 'af7508dc:clubs.html',
  'sports.html': 'a98e437:sports.html',
};

const sportsTheme = {
  primary:
    '--primary:#10b981;--primary-light:#34d399;--secondary:#06b6d4;--secondary-light:#22d3ee;',
  accent:
    '--accent:#14b8a6;--gradient-primary:linear-gradient(135deg,#10b981 0%,#06b6d4 100%);',
  rgba: 'rgba(16,185,129,',
};

const clubsTheme = {
  primary:
    '--primary:#f59e0b;--primary-light:#fbbf24;--secondary:#ef4444;--secondary-light:#f87171;',
  accent:
    '--accent:#f97316;--gradient-primary:linear-gradient(135deg,#f59e0b 0%,#ef4444 100%);',
  rgba: 'rgba(245,158,11,',
};

function applyTheme(html, theme, fromRgba, toRgba) {
  html = html.replace(
    /--primary:[^;]+;--primary-light:[^;]+;--secondary:[^;]+;--secondary-light:[^;]+;/,
    theme.primary
  );
  html = html.replace(
    /--accent:[^;]+;--gradient-primary:[^;]+;/,
    theme.accent
  );
  if (fromRgba && toRgba) {
    html = html.split(fromRgba).join(toRgba);
  }
  return html;
}

for (const [file, ref] of Object.entries(sources)) {
  let html = execSync(`git show ${ref}`, { encoding: 'utf8' });

  if (file === 'sports.html') {
    html = applyTheme(html, sportsTheme, 'rgba(245,158,11,', sportsTheme.rgba);
  }
  if (file === 'clubs.html') {
    html = applyTheme(html, clubsTheme, 'rgba(16,185,129,', clubsTheme.rgba);
  }

  const m = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
  if (!m) {
    console.log(file, 'SKIP — no babel block (already compiled?)');
    fs.writeFileSync(path.join(root, file), html, 'utf8');
    continue;
  }

  const { code } = babel.transform(m[1], {
    presets: [['react', { runtime: 'classic' }]],
    filename: file.replace('.html', '.jsx'),
  });

  const outJs = file.replace('.html', '.demo.js');
  fs.writeFileSync(path.join(root, outJs), code, 'utf8');

  html = html.replace(
    /<script src="https:\/\/unpkg.com\/@babel\/standalone\/babel.min.js"><\/script>\n?/,
    ''
  );
  html = html.replace(
    /<script type="text\/babel">[\s\S]*?<\/script>/,
    `<script src="${outJs}"></script>`
  );

  fs.writeFileSync(path.join(root, file), html, 'utf8');
  console.log(file, '->', outJs, '(' + code.length + ' bytes)');
}

console.log('Demos rebuilt OK');
