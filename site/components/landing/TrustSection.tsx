import {
  Database,
  FileSpreadsheet,
  History,
  KeyRound,
  Network,
  Server,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function TrustSection() {
  return (
    <section className="trust-section" aria-labelledby="trust-title">
      <Container>
        <SectionHeading
          eyebrow="Границы и доверие"
          title={
            <span id="trust-title">
              Встраивается в ваш контур, а не требует сначала снести его.
            </span>
          }
          body="Planovo может начать с расписания рядом с существующими системами. Что импортировать, интегрировать или заменить — решаем на проекте."
        />

        <div className="topology">
          <div className="topology__external topology__external--left">
            <span className="topology-label">Подготовленный источник</span>
            <div>
              <FileSpreadsheet aria-hidden="true" />
              <span>Excel и таблицы</span>
            </div>
          </div>

          <div className="topology__bridge topology__bridge--left" aria-hidden="true">
            <span>Импорт Excel</span>
            <i />
          </div>

          <div className="topology__core">
            <div className="topology__core-header">
              <span>Граница Planovo</span>
              <span className="mono">CLIENT CONTOUR</span>
            </div>
            <div className="topology__core-center">
              <span className="topology__core-mark">P</span>
              <p>
                <strong>Одна рабочая версия</strong>
                <small>Роли · расписание · изменения</small>
              </p>
            </div>
            <div className="topology__core-nodes">
              <div><KeyRound /><span>Роли и права</span></div>
              <div><History /><span>Версии и история</span></div>
              <div><Server /><span>Self-hosted контур</span></div>
            </div>
          </div>

          <div className="topology__bridge topology__bridge--right" aria-hidden="true">
            <i />
            <span>Проектируемая интеграция</span>
          </div>

          <div className="topology__external topology__external--right">
            <span className="topology-label">Работают рядом</span>
            <div>
              <Database aria-hidden="true" />
              <span>1С / Moodle</span>
            </div>
            <div>
              <Network aria-hidden="true" />
              <span>Другие системы учреждения</span>
            </div>
          </div>
        </div>

        <div className="trust-notes">
          <div>
            <span className="mono">01</span>
            <p>
              <strong>Управляемые изменения</strong>
              Рабочие разделы разделены по ролям, черновая версия — от
              опубликованной, действия фиксируются в журнале.
            </p>
          </div>
          <div>
            <span className="mono">02</span>
            <p>
              <strong>Инфраструктура по проекту</strong>
              Размещение, резервное копирование, права доступа и меры по 152-ФЗ
              фиксируются до запуска конкретного контура.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
