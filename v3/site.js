(function () {
  var TELEGRAM_URL = "https://t.me/planovosells_bot?start=site";
  var form = document.getElementById("leadForm");
  var msg = document.getElementById("formMsg");
  if (!form || !msg) return;

  function show(kind, html) {
    msg.className = "form-msg " + kind;
    msg.innerHTML = html;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.name.value.trim();
    var contact = form.contact.value.trim();
    if (!name || !contact) {
      show("err", "Укажите имя и телефон или почту.");
      return;
    }
    if (!form.consent.checked) {
      show("err", "Нужно согласие на обработку персональных данных.");
      return;
    }
    var data = {
      name: name,
      organization: form.organization.value.trim(),
      contact: contact,
      message: form.message.value.trim(),
      page: location.href,
      submittedAt: new Date().toISOString()
    };
    var text = "Заявка с сайта Планово\nИмя: " + data.name + "\nУчреждение: " + data.organization +
      "\nКонтакт: " + data.contact + "\n\n" + data.message;

    var endpoint = window.PLANOVO_LEAD_ENDPOINT;
    var button = form.querySelector("button[type=submit]");
    if (endpoint) {
      button.disabled = true;
      fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          form.reset();
          show("ok", "Заявка отправлена. Ответим в течение рабочего дня.");
        })
        .catch(function () {
          fallback(text);
        })
        .then(function () { button.disabled = false; });
      return;
    }
    fallback(text);
  });

  // Пока приём заявок не подключён, честно говорим об этом и даём отправить текст самому.
  function fallback(text) {
    var copied = false;
    try {
      if (navigator.clipboard) { navigator.clipboard.writeText(text); copied = true; }
    } catch (err) { copied = false; }
    show("err", (copied ? "Текст заявки скопирован. " : "") +
      "Автоматическая отправка пока не работает — пожалуйста, отправьте заявку в " +
      '<a href="' + TELEGRAM_URL + '" target="_blank" rel="noopener">Telegram</a> или на ' +
      '<a href="mailto:an.shpar@mail.ru?subject=' + encodeURIComponent("Заявка с сайта Планово") +
      "&body=" + encodeURIComponent(text) + '">почту</a>.');
  }
})();
