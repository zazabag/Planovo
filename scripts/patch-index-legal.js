const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const cssLink =
  '<link rel="stylesheet" href="/Planovo/assets/site-legal.css"/><link rel="stylesheet" href="/Planovo/assets/site-mobile.css"/>';
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

const legalScript =
  '<script src="/Planovo/assets/site-legal.js"></script>';
if (!html.includes('site-legal.js')) {
  html = html.replace('</body></html>', legalScript + '</body></html>');
}

// Nav link to contact
if (!html.includes('href="#contact"')) {
  html = html.replace(
    '<li><a href="#demos" class="nav-cta">Попробовать демо</a></li>',
    '<li><a href="#contact">Заявка</a></li><li><a href="#demos" class="nav-cta">Попробовать демо</a></li>'
  );
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('index.html patched OK');
