import { ArrowDownRight, Check, Circle, MoveRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { capabilityTracks } from "@/lib/landing-content";

export function CapabilityLadderSection() {
  return (
    <section
      className="capability-section"
      id="capabilities"
      aria-labelledby="capabilities-title"
    >
      <Container>
        <SectionHeading
          theme="dark"
          eyebrow="Модульная траектория"
          title={
            <span id="capabilities-title">
              Начните с горящего процесса. Не меняйте всё сразу.
            </span>
          }
          body="Первый проект начинается с работающего ядра расписания. Следующие процессы подключаются после фиксации требований и приоритетов учреждения."
        />

        <div className="capability-track" aria-label="Этапы развития Planovo">
          <div className="capability-track__axis" aria-hidden="true">
            <span />
            <MoveRight />
          </div>
          {capabilityTracks.map((track, index) => (
            <article
              key={track.status}
              className={`capability-stage capability-stage--${track.status}`}
            >
              <div className="capability-stage__status">
                <span className="capability-stage__marker">
                  {track.status === "ready" ? <Check /> : <Circle />}
                </span>
                <span className="mono">0{index + 1}</span>
                <span>{track.eyebrow}</span>
              </div>
              <div className="capability-stage__copy">
                <h3>{track.title}</h3>
                <p>{track.body}</p>
              </div>
              <ul>
                {track.items.map((item) => (
                  <li key={item}>
                    <ArrowDownRight aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="capability-footnote">
          Пунктир — следующий этап, тонкий контур — план развития. Это
          направления, а не обещание уже готовой функциональности.
        </p>
      </Container>
    </section>
  );
}
