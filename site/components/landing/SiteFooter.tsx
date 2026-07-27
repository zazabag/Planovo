import Image from "next/image";
import { ArrowUp } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { navigation } from "@/lib/landing-content";
import { legalConfig } from "@/lib/legal-content";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <Container>
        <div className="site-footer__top">
          <a className="brand brand--footer" href="/" aria-label="Planovo — на главную">
            <span className="brand__mark" aria-hidden="true">
              <Image src="/planovo-mark.svg" alt="" width={38} height={38} />
            </span>
            <span className="brand__word">Planovo</span>
          </a>
          <p>
            Операционная цифровая среда для частных образовательных организаций.
            Начните с расписания и подключайте следующие процессы по мере
            готовности.
          </p>
          <a className="footer-up" href="#top">
            Наверх
            <ArrowUp aria-hidden="true" />
          </a>
        </div>
        <div className="site-footer__links">
          <nav aria-label="Навигация в подвале">
            {navigation.map((item) => (
              <a key={item.href} href={item.href}>{item.label}</a>
            ))}
            <a href="https://akeda.ru/" target="_blank" rel="noreferrer">Akeda ↗</a>
          </nav>
          <div>
            <a href="mailto:an.shpar@mail.ru">an.shpar@mail.ru</a>
            <a href="https://t.me/planovoo" target="_blank" rel="noreferrer">@planovoo</a>
          </div>
        </div>
        <div className="site-footer__legal">
          <nav aria-label="Юридическая информация">
            <a href="/privacy">Политика ПДн</a>
            <a href="/consent-pdn">Согласие на обработку ПДн</a>
            <a href="/cookies">Cookie</a>
          </nav>
          <p>
            Оператор сайта: {legalConfig.operator.shortName} · ИНН{" "}
            {legalConfig.operator.inn} · ОГРНИП {legalConfig.operator.ogrnip}
          </p>
        </div>
        <div className="site-footer__bottom">
          <span>© {currentYear} Akeda · Planovo</span>
          <span>Частное образование · Россия</span>
          <span>Версия сайта 01</span>
        </div>
      </Container>
    </footer>
  );
}
