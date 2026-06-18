const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const cssLink =
  '<link rel="stylesheet" href="/Planovo/assets/site-legal.css"/><link rel="stylesheet" href="/Planovo/assets/site-mobile.css"/><link rel="stylesheet" href="/Planovo/assets/site-mobile-landing.css" media="(max-width: 768px)"/><link rel="stylesheet" href="/Planovo/assets/process-scroll.css"/><link rel="stylesheet" href="/Planovo/assets/problem-aura.css"/><link rel="stylesheet" href="/Planovo/assets/landing-background.css"/>';
if (!html.includes('site-legal.css')) {
  html = html.replace(
    /ca02de87dd32ea73\.css" data-precedence="next"\/>/,
    'ca02de87dd32ea73.css" data-precedence="next"/>' + cssLink
  );
}

if (!html.includes('site-mobile-landing.css')) {
  html = html.replace(
    'site-mobile.css"/>',
    'site-mobile.css"/><link rel="stylesheet" href="/Planovo/assets/site-mobile-landing.css" media="(max-width: 768px)"/>'
  );
}

const leadSection = `<section class="lead-section" id="contact"><div class="landing-container"><div class="lead-grid"><div class="lead-intro"><span class="section-tag">Связаться</span><h2 class="section-title">Обсудим ваш <span class="gradient-text">проект</span></h2><p class="lead-intro-text">Оставьте заявку — расскажем, как Планово закроет боли с расписанием в вашей нише. Без шаблонных решений, только под ваш бизнес.</p><div class="lead-contacts-mini cta-buttons"><a href="https://t.me/" class="btn btn-primary" target="_blank" rel="noopener noreferrer">✈️ Написать в Telegram</a><a href="mailto:hello@planovo.ru" class="btn btn-secondary">✉️ hello@planovo.ru</a></div></div><div class="lead-form-card"><h3>Заявка на консультацию</h3><p>Заполните форму — ответим в течение рабочего дня.</p><form id="planovoLeadForm" class="lead-form" novalidate><div class="lead-form-row"><div class="lead-field"><label for="leadName">Имя <span class="req">*</span></label><input type="text" id="leadName" name="name" required autocomplete="name" placeholder="Как к вам обращаться" /></div><div class="lead-field"><label for="leadOrg">Организация</label><input type="text" id="leadOrg" name="organization" autocomplete="organization" placeholder="Школа, клуб, секция" /></div></div><div class="lead-form-row"><div class="lead-field"><label for="leadEmail">Email</label><input type="email" id="leadEmail" name="email" autocomplete="email" placeholder="name@example.ru" /></div><div class="lead-field"><label for="leadPhone">Телефон <span class="req">*</span></label><input type="tel" id="leadPhone" name="phone" required autocomplete="tel" placeholder="+7 (___) ___-__-__" inputmode="tel" /></div></div><div class="lead-field"><label for="leadNiche">Ниша</label><select id="leadNiche" name="niche"><option value="">Выберите направление</option><option value="education">Учебное заведение</option><option value="sports">Спортивная секция</option><option value="clubs">Клуб / мероприятия</option><option value="other">Другое</option></select></div><div class="lead-field"><label for="leadMessage">Сообщение</label><textarea id="leadMessage" name="message" placeholder="Кратко опишите задачу и текущие боли с расписанием"></textarea></div><div class="lead-checkboxes"><label class="lead-checkbox"><input type="checkbox" id="leadConsentPdn" name="consentPdn" required /><span>Даю <a href="consent-pdn.html" target="_blank" rel="noopener">согласие на обработку персональных данных</a> в соответствии с <a href="privacy.html" target="_blank" rel="noopener">Политикой обработки ПДн</a> <span class="req">*</span></span></label><label class="lead-checkbox"><input type="checkbox" id="leadMarketing" name="marketing" /><span>Согласен(на) получать информационные материалы о продукте «Планово» (необязательно)</span></label></div><div id="leadFormMessage" class="lead-form-message" role="status" aria-live="polite"></div><button type="submit" class="lead-submit" id="leadSubmitBtn" disabled>Отправить заявку</button></form></div></div></div></section>`;

const ctaPattern =
  /<section class="cta" id="contact">[\s\S]*?<\/section>/;
if (ctaPattern.test(html)) {
  html = html.replace(ctaPattern, leadSection);
} else if (!html.includes('id="planovoLeadForm"')) {
  html = html.replace('<footer class="landing-footer">', leadSection + '<footer class="landing-footer">');
}

const footerLegalLinks = `<li><a href="privacy.html">Политика ПДн</a></li><li><a href="consent-pdn.html">Согласие ПДн</a></li><li><a href="cookies.html">Cookie</a></li>`;

if (!html.includes('href="privacy.html"')) {
  html = html.replace(
    '<li><a href="https://t.me/" target="_blank">Telegram</a></li></ul></div></div></div><div class="footer-bottom">',
    '<li><a href="https://t.me/" target="_blank" rel="noopener noreferrer">Telegram</a></li>' +
      footerLegalLinks +
      '</ul></div></div></div><div class="footer-bottom">'
  );
}

const demoNavScript =
  '<script src="/Planovo/assets/demo-nav-fallback.js"></script>';
const legalScript =
  demoNavScript + '<script src="/Planovo/assets/site-legal.js"></script>';
const mockupCss =
  '<link rel="stylesheet" href="/Planovo/assets/landing-mockup.css"/>';
const mockupScript =
  '<script src="/Planovo/assets/landing-mockup.js" defer></script>';
if (!html.includes('process-scroll.css')) {
  html = html.replace(
    'site-mobile.css"/>',
    'site-mobile.css"/><link rel="stylesheet" href="/Planovo/assets/process-scroll.css"/>'
  );
}

const processScript =
  '<script src="/Planovo/assets/process-scroll.js" defer></script>';
const problemAuraCss =
  '<link rel="stylesheet" href="/Planovo/assets/problem-aura.css"/>';
const problemAuraScript =
  '<script src="/Planovo/assets/problem-aura.js" defer></script>';
if (!html.includes('process-scroll.js')) {
  html = html.replace(
    'landing-mockup.js" defer></script>',
    'landing-mockup.js" defer></script>' + processScript
  );
}

if (!html.includes('problem-aura.css')) {
  html = html.replace(
    'process-scroll.css"/>',
    'process-scroll.css"/>' + problemAuraCss
  );
}

if (!html.includes('problem-aura.js')) {
  html = html.replace(
    'process-scroll.js" defer></script>',
    'process-scroll.js" defer></script>' + problemAuraScript
  );
}

const landingBackgroundCss =
  '<link rel="stylesheet" href="/Planovo/assets/landing-background.css"/>';
if (!html.includes('landing-background.css')) {
  html = html.replace(
    'problem-aura.css"/>',
    'problem-aura.css"/>' + landingBackgroundCss
  );
}

if (!html.includes('site-legal.js')) {
  html = html.replace('</body></html>', mockupCss + mockupScript + legalScript + '</body></html>');
}

// Nav link to contact
if (!html.includes('href="#contact"')) {
  html = html.replace(
    '<li><a href="#demos" class="nav-cta">Попробовать демо</a></li>',
    '<li><a href="#contact">Заявка</a></li><li><a href="#demos" class="nav-cta">Попробовать демо</a></li>'
  );
}

const DEMO_BTN_ARROW =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right demo-btn-arrow" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>';

function nicheDemoBtnHtml(color, key, href) {
  return (
    '<a class="niche-demo-btn demo-card-btn" href="' +
    href +
    '" data-demo-key="' +
    key +
    '" style="background:linear-gradient(135deg, ' +
    color +
    ', ' +
    color +
    'cc)">Попробовать демо' +
    DEMO_BTN_ARROW +
    '</a>'
  );
}

// Кнопки «Попробовать демо» в карточках ниш + подпись снизу
[
  ['Для: учебной части, преподавателей, студентов', '#6366f1', 'education', 'education.html'],
  ['Для: руководителей секций, тренеров, спортсменов', '#10b981', 'sports', 'sports.html'],
  ['Для: организаторов, администраторов, участников', '#f59e0b', 'clubs', 'clubs.html'],
].forEach(function (row) {
  var marker =
    '<span class="niche-target">' + row[0] + '</span></div></div>';
  if (!html.includes(marker)) return;
  html = html.replace(
    marker,
    '<span class="niche-target">' +
      row[0] +
      '</span></div>' +
      nicheDemoBtnHtml(row[1], row[2], row[3]) +
      '</div>'
  );
});

// Скрытая секция #demos (кнопки перенесены в ниши)
html = html.replace(
  /<p class="niches-demo-caption">[\s\S]*?<\/p>/g,
  ""
);
if (!html.includes('id="demos" hidden')) {
  html = html.replace(
    '</div></div></div></section><section class="demos" id="demos">',
    '</div></div></div></section><section class="demos" id="demos" hidden aria-hidden="true">'
  );
}

// Кнопки «Попробовать демо» → прямые ссылки на standalone-демо (секция #demos)
const demoButtons = [
  { color: '#6366f1', key: 'education', href: 'education.html' },
  { color: '#10b981', key: 'sports', href: 'sports.html' },
  { color: '#f59e0b', key: 'clubs', href: 'clubs.html' },
];

demoButtons.forEach(function (demo) {
  var btnOpen =
    '<button class="demo-card-btn" style="background:linear-gradient(135deg, ' +
    demo.color +
    ', ' +
    demo.color +
    'cc)">';
  var linkOpen =
    '<a class="demo-card-btn" href="' +
    demo.href +
    '" data-demo-key="' +
    demo.key +
    '" style="background:linear-gradient(135deg, ' +
    demo.color +
    ', ' +
    demo.color +
    'cc)">';
  if (html.includes(btnOpen)) {
    html = html.replace(btnOpen, linkOpen);
    html = html.replace(
      new RegExp(
        '(<a class="demo-card-btn" href="' +
          demo.href.replace('.', '\\.') +
          '"[\\s\\S]*?Попробовать демо[\\s\\S]*?)<\\/button>'
      ),
      '$1</a>'
    );
  }
});

// Футер: ниши → демо-страницы
[
  ['Учебные заведения', 'education.html', 'education'],
  ['Спортивные секции', 'sports.html', 'sports'],
  ['Клубы и мероприятия', 'clubs.html', 'clubs'],
].forEach(function (row) {
  var text = row[0];
  var href = row[1];
  var key = row[2];
  html = html.replace(
    '<a href="#demos">' + text + '</a>',
    '<a href="' + href + '" data-demo-key="' + key + '">' + text + '</a>'
  );
});

// Форма: телефон обязателен (как в site-legal.js)
html = html.replace(
  '<label for="leadPhone">Телефон</label><input type="tel" id="leadPhone" name="phone" autocomplete="tel"',
  '<label for="leadPhone">Телефон <span class="req">*</span></label><input type="tel" id="leadPhone" name="phone" required autocomplete="tel" inputmode="tel"'
);

// Favicon для GitHub Pages (/Planovo/)
html = html.replace('href="/logo.svg"', 'href="/Planovo/logo.png"');
html = html.replace('href="/Planovo/logo.svg"', 'href="/Planovo/logo.png"');
html = html.replace('href="/Planovo/logo-icon.svg"', 'href="/Planovo/logo.png"');

const LOGO_ICON_IMG =
  '<span class="logo-icon"><img src="/Planovo/logo.png" alt="" class="planovo-logo-img" width="60" height="60" decoding="async"/></span>';
html = html.replace(
  /<span class="logo-icon"><img src="\/Planovo\/logo-icon\.svg"[^>]*\/><\/span>/g,
  LOGO_ICON_IMG
);
html = html.replace(
  /<span class="logo-icon"><img src="\/Planovo\/logo\.png"[^>]*\/><\/span>/g,
  LOGO_ICON_IMG
);
html = html.replace(/<span class="logo-icon">📅<\/span>/g, LOGO_ICON_IMG);

// Hero stats (3+ ниши / 2 роли / 1 платформа) — убрано с лендинга
html = html.replace(/<div class="hero-stats">[\s\S]*?<\/div>/, '');

// Якоря «Попробовать демо» → секция ниш
html = html.replace(/href="#demos"/g, 'href="#niches"');

fs.writeFileSync(indexPath, html, 'utf8');
console.log('index.html patched OK');
