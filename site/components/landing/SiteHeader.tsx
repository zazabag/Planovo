"use client";

import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/lib/landing-content";
import { Container } from "@/components/ui/Container";

const telegramUrl = "https://t.me/planovoo";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (menuOpen && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => firstLinkRef.current?.focus());
    }

    if (!menuOpen && dialog.open) {
      dialog.close();
    }
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleDialogClose() {
    setMenuOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <header className="site-header">
      <Container className="site-header__inner">
        <a className="brand" href="/" aria-label="Planovo — на главную">
          <span className="brand__mark" aria-hidden="true">
            <Image
              src="/planovo-mark.svg"
              alt=""
              width={38}
              height={38}
              priority
            />
          </span>
          <span className="brand__word">Planovo</span>
        </a>

        <nav className="desktop-navigation" aria-label="Основная навигация">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="site-header__actions">
          <a
            className="header-contact"
            href={telegramUrl}
            target="_blank"
            rel="noreferrer"
          >
            Обсудить пилот
            <span aria-hidden="true">↗</span>
          </a>
          <button
            ref={triggerRef}
            className="menu-trigger"
            type="button"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </Container>

      <dialog
        ref={dialogRef}
        id="mobile-menu"
        className="mobile-menu"
        aria-labelledby="mobile-menu-title"
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
        onClose={handleDialogClose}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMenu();
        }}
      >
        <div className="mobile-menu__surface">
          <div className="mobile-menu__topline">
            <p id="mobile-menu-title">Навигация</p>
            <button
              type="button"
              aria-label="Закрыть меню"
              onClick={closeMenu}
            >
              <X aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Мобильная навигация">
            {navigation.map((item, index) => (
              <a
                key={item.href}
                ref={index === 0 ? firstLinkRef : undefined}
                href={item.href}
                onClick={closeMenu}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item.label}
              </a>
            ))}
          </nav>
          <a
            className="mobile-menu__cta"
            href={telegramUrl}
            target="_blank"
            rel="noreferrer"
            onClick={closeMenu}
          >
            Обсудить пилот
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </dialog>
    </header>
  );
}
