"""Приём заявок с сайта planovo.pro и переписка с клиентами через Telegram-бота.

Две части в одном процессе, только стандартная библиотека Python:

1. HTTP: POST /lead принимает заявку с формы сайта (JSON) и отправляет её в рабочую
   группу Telegram. Слушает только 127.0.0.1 — снаружи доступ идёт через Caddy.
2. Бот: забирает сообщения через getUpdates. Сообщение человека боту в личку
   пересылается в рабочую группу; ответ в группе (reply на это сообщение) бот
   отправляет человеку обратно. Сообщения из любых других групп игнорируются.

Настройки — переменные окружения:
  PLANOVO_LEAD_BOT_TOKEN  токен бота
  PLANOVO_LEAD_CHAT_ID    номер рабочей группы (отрицательное число)
  PLANOVO_LEAD_PORT       порт HTTP, по умолчанию 18090
  PLANOVO_LEAD_STATE      файл связей «сообщение в группе → человек»,
                          по умолчанию /state/threads.json
"""

import json
import os
import sys
import threading
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

TOKEN = os.environ.get("PLANOVO_LEAD_BOT_TOKEN", "")
CHAT_ID = int(os.environ.get("PLANOVO_LEAD_CHAT_ID", "0") or 0)
PORT = int(os.environ.get("PLANOVO_LEAD_PORT", "18090"))
STATE_FILE = os.environ.get("PLANOVO_LEAD_STATE", "/state/threads.json")
API = f"https://api.telegram.org/bot{TOKEN}/"

MAX_FIELD = {"name": 120, "organization": 200, "contact": 200, "message": 3000, "page": 300}
RATE_WINDOW = 600  # секунд
RATE_LIMIT = 5  # заявок с одного адреса за окно

GREETING = (
    "Здравствуйте! Это Планово — система расписания для учебных заведений.\n\n"
    "Напишите сюда ваш вопрос или коротко расскажите, как у вас устроено расписание. "
    "Ответим здесь же, в тот же день."
)
ACK = "Спасибо, сообщение получили. Ответим здесь же."


def log(*parts):
    print(time.strftime("%Y-%m-%d %H:%M:%S"), *parts, flush=True)


def tg(method, payload, timeout=40):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(API + method, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        body = json.loads(resp.read().decode())
    if not body.get("ok"):
        raise RuntimeError(f"{method}: {body.get('description')}")
    return body["result"]


# --- связи «сообщение в группе → человек» -----------------------------------

_state_lock = threading.Lock()


def load_threads():
    try:
        with open(STATE_FILE, encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save_threads(threads):
    tmp = STATE_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(threads, f)
    os.replace(tmp, STATE_FILE)


THREADS = load_threads()


def remember(group_message_id, user_chat_id):
    with _state_lock:
        THREADS[str(group_message_id)] = user_chat_id
        if len(THREADS) > 20000:
            for key in sorted(THREADS, key=int)[:5000]:
                THREADS.pop(key, None)
        save_threads(THREADS)


def recall(group_message_id):
    with _state_lock:
        return THREADS.get(str(group_message_id))


# --- заявки с сайта ---------------------------------------------------------

_hits = {}
_hits_lock = threading.Lock()


def allowed(ip):
    now = time.time()
    with _hits_lock:
        recent = [t for t in _hits.get(ip, []) if now - t < RATE_WINDOW]
        if len(recent) >= RATE_LIMIT:
            _hits[ip] = recent
            return False
        recent.append(now)
        _hits[ip] = recent
        return True


def clean(value, limit):
    return str(value or "").strip()[:limit]


def lead_text(form):
    lines = ["Заявка с сайта planovo.pro", ""]
    lines.append(f"Имя: {form['name']}")
    if form["organization"]:
        lines.append(f"Учреждение: {form['organization']}")
    lines.append(f"Контакт: {form['contact']}")
    if form["message"]:
        lines += ["", form["message"]]
    if form["page"]:
        lines += ["", f"Страница: {form['page']}"]
    return "\n".join(lines)


class Handler(BaseHTTPRequestHandler):
    server_version = "planovo-lead"

    def log_message(self, fmt, *args):
        pass

    def reply(self, code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/lead/health":
            return self.reply(200, {"ok": True})
        self.reply(404, {"ok": False})

    def do_POST(self):
        if self.path.rstrip("/") != "/lead":
            return self.reply(404, {"ok": False})
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > 20000:
            return self.reply(400, {"ok": False, "error": "size"})
        try:
            raw = json.loads(self.rfile.read(length).decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            return self.reply(400, {"ok": False, "error": "json"})
        if not isinstance(raw, dict):
            return self.reply(400, {"ok": False, "error": "json"})
        # Поле-ловушка: человек его не видит и не заполняет.
        if raw.get("website"):
            return self.reply(200, {"ok": True})
        form = {key: clean(raw.get(key), limit) for key, limit in MAX_FIELD.items()}
        if not form["name"] or not form["contact"]:
            return self.reply(400, {"ok": False, "error": "required"})
        ip = self.headers.get("X-Forwarded-For", self.client_address[0]).split(",")[0].strip()
        if not allowed(ip):
            return self.reply(429, {"ok": False, "error": "rate"})
        try:
            tg("sendMessage", {"chat_id": CHAT_ID, "text": lead_text(form), "disable_web_page_preview": True})
        except Exception as exc:  # noqa: BLE001 — любой сбой Telegram должен вернуть посетителю ошибку
            log("lead send failed:", exc)
            return self.reply(502, {"ok": False, "error": "send"})
        log("lead sent")
        self.reply(200, {"ok": True})


# --- переписка через бота ---------------------------------------------------

def who(user):
    name = " ".join(x for x in [user.get("first_name"), user.get("last_name")] if x) or "без имени"
    if user.get("username"):
        name += f" (@{user['username']})"
    return name


def handle_private(msg):
    chat_id = msg["chat"]["id"]
    text = msg.get("text") or ""
    if text.startswith("/start"):
        tg("sendMessage", {"chat_id": chat_id, "text": GREETING})
        source = text.partition(" ")[2] or "без метки"
        sent = tg("sendMessage", {"chat_id": CHAT_ID, "text": f"Новый собеседник в боте: {who(msg['from'])}\nОткуда: {source}"})
        remember(sent["message_id"], chat_id)
        return
    header = tg("sendMessage", {"chat_id": CHAT_ID, "text": f"Сообщение в боте от {who(msg['from'])}. Ответьте реплаем — бот перешлёт."})
    remember(header["message_id"], chat_id)
    copied = tg("copyMessage", {"chat_id": CHAT_ID, "from_chat_id": chat_id, "message_id": msg["message_id"]})
    remember(copied["message_id"], chat_id)
    tg("sendMessage", {"chat_id": chat_id, "text": ACK})


def handle_group(msg):
    target = msg.get("reply_to_message")
    if not target or msg.get("from", {}).get("is_bot"):
        return
    user_chat = recall(target["message_id"])
    if not user_chat:
        return
    try:
        tg("copyMessage", {"chat_id": user_chat, "from_chat_id": CHAT_ID, "message_id": msg["message_id"]})
        remember(msg["message_id"], user_chat)
    except Exception as exc:  # noqa: BLE001
        log("reply failed:", exc)
        tg("sendMessage", {"chat_id": CHAT_ID, "reply_to_message_id": msg["message_id"], "text": "Не удалось доставить ответ: человек, возможно, остановил бота."})


def poll():
    offset = None
    while True:
        try:
            payload = {"timeout": 30, "allowed_updates": ["message"]}
            if offset is not None:
                payload["offset"] = offset
            updates = tg("getUpdates", payload, timeout=40)
        except Exception as exc:  # noqa: BLE001
            log("poll failed:", exc)
            time.sleep(5)
            continue
        for upd in updates:
            offset = upd["update_id"] + 1
            msg = upd.get("message")
            if not msg:
                continue
            try:
                if msg["chat"]["type"] == "private":
                    handle_private(msg)
                elif msg["chat"]["id"] == CHAT_ID:
                    handle_group(msg)
            except Exception as exc:  # noqa: BLE001
                log("update failed:", exc)


def main():
    if not TOKEN or not CHAT_ID:
        sys.exit("PLANOVO_LEAD_BOT_TOKEN и PLANOVO_LEAD_CHAT_ID обязательны")
    os.makedirs(os.path.dirname(STATE_FILE) or ".", exist_ok=True)
    threading.Thread(target=poll, daemon=True).start()
    log(f"listening on 127.0.0.1:{PORT}")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()


if __name__ == "__main__":
    main()
