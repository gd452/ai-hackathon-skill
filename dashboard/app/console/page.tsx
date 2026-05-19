import Link from "next/link";
import { loadConfig, checkEnv } from "@/lib/config";
import { listSubmissions } from "@/lib/submissions";

export const dynamic = "force-dynamic";

export default function Home() {
  const cfg = loadConfig();
  const env = checkEnv();
  const subs = listSubmissions();
  const judged = subs.filter((s) => s.hasRubric).length;
  const withEvidence = subs.filter((s) => s.evidence.repo || s.evidence.video).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-soft)] mb-3 font-mono">
          {cfg.date} · {cfg.durationHours}h · {cfg.participantCount}명
        </p>
        <h1 className="text-display mb-3">{cfg.name}</h1>
        <p className="text-[var(--muted)] max-w-2xl leading-relaxed">{cfg.topic}</p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <Metric label="제출물" value={subs.length} href="/submissions" />
        <Metric label="AI 채점" value={`${judged} / ${subs.length || 0}`} href="/submissions" />
        <Metric label="Evidence" value={`${withEvidence}`} hint="자동수집" />
        <Metric label="리더보드" value="실시간" href="/leaderboard" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">
        <section className="surface p-5">
          <h2 className="text-xs uppercase tracking-[0.15em] text-[var(--muted-soft)] mb-4 font-mono">
            환경 키
          </h2>
          <div className="space-y-2.5">
            <KeyStatus label="ANTHROPIC_API_KEY" ok={env.anthropic} />
            <KeyStatus label="GEMINI_API_KEY" ok={env.gemini} />
            <KeyStatus label="OPENAI_API_KEY" ok={env.openai} />
          </div>
          {env.missing.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border)] text-xs text-[var(--muted)] leading-relaxed">
              누락 시 <code>dashboard/.env.local</code> 에 추가 후 dev server 재시작.
            </div>
          )}
        </section>

        <section className="surface p-5">
          <h2 className="text-xs uppercase tracking-[0.15em] text-[var(--muted-soft)] mb-4 font-mono">
            평가 가중치
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[10px] text-[var(--muted-soft)] uppercase tracking-wider mb-2">
                5 항목
              </div>
              <ul className="space-y-1 font-mono tabular-nums text-xs">
                <Row label="README" v={cfg.itemWeights.readme} />
                <Row label="코드" v={cfg.itemWeights.code} />
                <Row label="AI 활용" v={cfg.itemWeights.ai} />
                <Row label="완성도" v={cfg.itemWeights.complete} />
                <Row label="차별성" v={cfg.itemWeights.diff} />
              </ul>
            </div>
            <div>
              <div className="text-[10px] text-[var(--muted-soft)] uppercase tracking-wider mb-2">
                3 source
              </div>
              <ul className="space-y-1 font-mono tabular-nums text-xs">
                <Row label="🤖 AI" v={cfg.sourceWeights.ai} />
                <Row label="👥 동료" v={cfg.sourceWeights.peer} />
                <Row label="🧑‍⚖️ 심사" v={cfg.sourceWeights.judge} />
              </ul>
            </div>
          </div>
          <Link
            href="/config"
            className="inline-block mt-4 text-xs text-[var(--accent-bright)] hover:underline"
          >
            가중치 조정 →
          </Link>
        </section>
      </div>

      <section className="surface p-5">
        <h2 className="text-xs uppercase tracking-[0.15em] text-[var(--muted-soft)] mb-4 font-mono">
          운영 흐름
        </h2>
        <ol className="space-y-2.5 text-sm leading-relaxed">
          <Step
            n={1}
            title="설정"
            href="/config"
            desc="행사명·일정·rubric 가중치·제출 필수 입력 토글"
          />
          <Step
            n={2}
            title="제출물"
            href="/submissions"
            desc="markdown + (옵션) GitHub/YouTube URL → 자동 evidence 수집 → 검토 → AI 채점"
          />
          <Step
            n={3}
            title="동료 / 심사 점수"
            desc={
              <>
                JSON 으로 <code className="text-xs">data/peer-scores.json</code> · <code className="text-xs">data/judge-scores.json</code>
              </>
            }
          />
          <Step
            n={4}
            title="리더보드"
            href="/leaderboard"
            desc="가중 합산 + 메달 카드 + 사람 심사 검토 권장"
          />
        </ol>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  href,
  hint,
}: {
  label: string;
  value: string | number;
  href?: string;
  hint?: string;
}) {
  const inner = (
    <>
      <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted-soft)] mb-2 font-mono">
        {label}
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      {hint && <div className="text-[10px] text-[var(--muted-soft)] mt-1">{hint}</div>}
    </>
  );
  if (href) {
    return (
      <Link href={href} className="surface surface-hover p-4 block">
        {inner}
      </Link>
    );
  }
  return <div className="surface p-4">{inner}</div>;
}

function KeyStatus({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full ${
          ok ? "bg-[var(--accent)]" : "bg-[var(--muted-soft)]"
        }`}
      />
      <span className="font-mono text-xs flex-1">{label}</span>
      <span className={`text-xs ${ok ? "text-[var(--accent-bright)]" : "text-[var(--muted)]"}`}>
        {ok ? "ready" : "missing"}
      </span>
    </div>
  );
}

function Row({ label, v }: { label: string; v: number }) {
  return (
    <li className="flex justify-between">
      <span className="text-[var(--muted)]">{label}</span>
      <span>{v}%</span>
    </li>
  );
}

function Step({
  n,
  title,
  desc,
  href,
}: {
  n: number;
  title: string;
  desc: React.ReactNode;
  href?: string;
}) {
  const titleEl = href ? (
    <Link href={href} className="font-semibold hover:text-[var(--accent-bright)]">
      {title} →
    </Link>
  ) : (
    <span className="font-semibold">{title}</span>
  );
  return (
    <li className="flex gap-3">
      <span className="text-xs font-mono text-[var(--muted-soft)] tabular-nums w-5 pt-1">
        0{n}
      </span>
      <div className="flex-1">
        <div>{titleEl}</div>
        <div className="text-xs text-[var(--muted)] mt-0.5">{desc}</div>
      </div>
    </li>
  );
}
