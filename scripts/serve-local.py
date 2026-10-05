#!/usr/bin/env python3
"""Локальный просмотр репозитория без кэша: правка файла видна после обычного обновления страницы.

Запуск из корня репозитория: python3 scripts/serve-local.py [порт]
"""
import http.server
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8091
    http.server.ThreadingHTTPServer(("127.0.0.1", port), NoCacheHandler).serve_forever()
