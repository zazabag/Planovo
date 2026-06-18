const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const cssLink =
  '<link rel="stylesheet" href="/Planovo/assets/site-legal.css"/><link rel="stylesheet" href="/Planovo/assets/site-mobile.css"/><link rel="stylesheet" href="/Planovo/assets/process-scroll.css"/>';
if (!html.includes('site-legal.css')) {
  html = html.replace(
    /ca02de87dd32ea73\.css" data-precedence="next"\/>/,
    'ca02de87dd32ea73.css" data-precedence="next"/>' + cssLink
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
if (!html.includes('process-scroll.js')) {
  html = html.replace(
    'landing-mockup.js" defer></script>',
    'landing-mockup.js" defer></script>' + processScript
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

// Кнопки «Попробовать демо» → прямые ссылки на standalone-демо
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
html = html.replace('href="/logo.svg"', 'href="/Planovo/logo.svg"');

fs.writeFileSync(indexPath, html, 'utf8');
console.log('index.html patched OK');
