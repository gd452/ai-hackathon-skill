import Link from "next/link";

export const dynamic = "force-static";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
      {/* Eyebrow */}
      <div className="flex items-center gap-2 text-xs text-[var(--muted-soft)] uppercase tracking-[0.2em] font-mono mb-5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
        Anthropic Claude Skills · v0.5
      </div>

      {/* Hero */}
      <h1 className="text-display mb-5">
        AI 와 만들고<br />
        <span className="text-[var(--accent)]">AI 와 채점</span>한다
      </h1>
      <p className="text-lg text-[var(--muted)] leading-relaxed max-w-2xl mb-3">
        1 운영자가 AI 에이전트와 함께 굴리는 해커톤 — 기획 · 공지 · 채점 · 리더보드까지.
      </p>
      <p className="text-sm text-[var(--muted)] leading-relaxed max-w-2xl">
        이건 <strong className="text-[var(--foreground)]">Self-contained Skill</strong> —
        호스트 코딩 에이전트(Claude Code · Cursor · Codex CLI)에 fork 해두면 자연어
        한 줄로 채점·리더보드까지 자동. 운영자는 dashboard 에서 결과만 본다.
      </p>

      {/* CTA */}
      <div className="flex flex-wrap gap-3 mt-8">
        <Link
          href="/console"
          className="px-5 py-3 bg-[var(--accent)] text-[var(--accent-fg)] rounded-lg font-semibold hover:bg-[var(--accent-bright)] transition-colors"
        >
          운영 콘솔 열기 →
        </Link>
        <a
          href="https://github.com/gd452/ai-hackathon-skill"
          target="_blank"
          rel="noreferrer"
          className="px-5 py-3 border border-[var(--border)] rounded-lg font-medium hover:border-[var(--accent)] transition-colors"
        >
          GitHub
        </a>
      </div>

      {/* Skill 이란? */}
      <section className="mt-14">
        <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--muted-soft)] mb-4 font-mono">
          Self-contained Skill 이란
        </h2>
        <div className="surface p-5 space-y-3 text-sm leading-relaxed">
          <p>
            <strong>Anthropic Claude Skills 표준</strong> — `SKILL.md` 한 파일이 진입점.
            호스트 코딩 에이전트가 자연어 명령을 받으면 이 파일의 frontmatter `description`
            을 보고 매칭, 안에 적힌 절차대로 셸을 호출한다.
          </p>
          <p>
            <strong>일반 Skill 과 다른 점</strong>: 이 스킬은 <code className="text-xs">scripts/</code>
            (3 LLM API 호출), <code className="text-xs">dashboard/</code> (Next.js UI),
            <code className="text-xs">tests/</code> (셀프 테스트) 까지 포함한 self-contained 형태.
            운영자는 자연어 한 줄, 결과는 브라우저 dashboard 로.
          </p>
        </div>
      </section>

      {/* 사용 흐름 (호스트 에이전트별) */}
      <section className="mt-12">
        <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--muted-soft)] mb-4 font-mono">
          어떻게 사용하나
        </h2>

        <div className="space-y-4">
          <HostCard
            tier="권장"
            name="Claude Code (Anthropic)"
            steps={[
              "ln -s $(pwd) ~/.claude/skills/ai-hackathon-skill",
              '"ai-hackathon 시작해줘" — Claude Code 가 SKILL.md 매칭 → 자동 셸 + dashboard 오픈',
              "운영자는 dashboard 에서 제출 등록 → 채점 → 리더보드",
            ]}
          />
          <HostCard
            tier="권장"
            name="Cursor / Windsurf"
            steps={[
              "SKILL.md 를 프로젝트 .cursorrules 또는 agent context 로 import",
              '"ai-hackathon 시작해줘" — 같은 자연어 흐름',
            ]}
          />
          <HostCard
            tier="가능"
            name="Codex CLI (ChatGPT 계정)"
            steps={[
              "codex exec --sandbox workspace-write \"SKILL.md 따라 ai-hackathon dashboard 띄워줘\"",
              "셸 접근 가능 — Claude Code 와 동일한 자동화 가능",
            ]}
          />
          <HostCard
            tier="UI 수동"
            name="ChatGPT 웹 · Gemini 웹"
            steps={[
              "셸 접근 X — 운영자가 직접 bun install · bun run dev 실행",
              "dashboard UI 로 제출 등록 → 채점 (AI 자동 호출은 변함없음, 운영자 입력만 수동)",
            ]}
          />
        </div>
      </section>

      {/* 평가 모델 */}
      <section className="mt-12">
        <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--muted-soft)] mb-4 font-mono">
          3 모델 합의 채점
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ModelCard
            color="#a855f7"
            name="Claude"
            model="claude-opus-4-7"
            role="문서 충실도 · 코드 구조"
          />
          <ModelCard
            color="#3b82f6"
            name="Gemini"
            model="gemini-3-pro"
            role="비주얼 + 시연 영상 분석"
          />
          <ModelCard
            color="#10b981"
            name="OpenAI"
            model="gpt-5.5"
            role="코드 품질 · 차별성"
          />
        </div>
        <p className="text-xs text-[var(--muted-soft)] mt-3 text-center">
          각 모델 5 항목 독립 채점 → 평균 → 동료·심사위원과 가중 합산
        </p>
      </section>

      {/* 사전 준비 (운영자 수동, 1회) */}
      <section className="mt-12">
        <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--muted-soft)] mb-4 font-mono">
          사전 준비 (운영자 1 회, macOS)
        </h2>
        <pre className="text-xs leading-relaxed">{`# 1. 의존성
brew install jq curl bun git

# 2. 클론
git clone https://github.com/gd452/ai-hackathon-skill ~/Development/ai-hackathon-skill

# 3. 스킬 등록 (Claude Code 글로벌)
ln -s ~/Development/ai-hackathon-skill ~/.claude/skills/ai-hackathon

# 4. 패키지 + API 키 3개
cd ~/Development/ai-hackathon-skill/dashboard && bun install
cat > .env.local <<EOF
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
OPENAI_API_KEY=sk-...
EOF
chmod 600 .env.local`}</pre>
        <p className="text-xs text-[var(--muted)] mt-3 leading-relaxed">
          이후부터는 Claude Code 에서 자연어 한 줄. brew · git · 키 발급은 운영자 본인이
          한 번만 하면 끝.
        </p>
      </section>

      {/* 4 페이지 미리보기 */}
      <section className="mt-12">
        <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--muted-soft)] mb-4 font-mono">
          dashboard 4 페이지
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <PageCard
            href="/console"
            num="01"
            title="대시보드"
            desc="행사 정보 · 환경 키 · 가중치 요약"
          />
          <PageCard
            href="/submissions"
            num="02"
            title="제출물"
            desc="markdown + 옵션 GitHub/YouTube URL → 자동 evidence 수집 → 운영자 검토 → AI 채점"
          />
          <PageCard
            href="/leaderboard"
            num="03"
            title="리더보드"
            desc="🥇🥈🥉 메달 + AI · 동료 · 심사위원 가중 합산"
          />
          <PageCard
            href="/config"
            num="04"
            title="설정"
            desc="가중치 슬라이더 + 제출 입력 필수/옵션 토글"
          />
        </div>
      </section>

      {/* 셀프 테스트 */}
      <section className="mt-12">
        <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--muted-soft)] mb-4 font-mono">
          스킬이 진짜 동작하는지
        </h2>
        <div className="surface p-5">
          <pre className="text-xs mb-3">{`bash tests/e2e/run.sh`}</pre>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            3 빌더 모델이 각자 다른 가상 팀 산출물 생성 → 3 심사 모델이 9 호출로 채점 → 리더보드. <strong className="text-[var(--foreground)]">약 1 분 30 초</strong>. dashboard 가 같은 결과 파일을 보기에 화면에 즉시 표시.
          </p>
        </div>
      </section>

      {/* 보안 */}
      <section className="mt-12">
        <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--muted-soft)] mb-4 font-mono">
          보안 / 신뢰
        </h2>
        <ul className="space-y-2 text-sm text-[var(--muted)] leading-relaxed">
          <li>· API 키 = 환경변수만 (<code className="text-xs">.env.local</code>, gitignored)</li>
          <li>· 외부 호출 = LLM API + public GitHub HTTPS clone (옵션) + YouTube URL Gemini Video (옵션)</li>
          <li>· GitHub evidence 수집 — 보안 가드 11개 (allowlist · sandbox · timeout · size cap · prompt injection 방어)</li>
          <li>· AI 채점은 보조 도구 — 최종 시상 결정은 사람 심사위원</li>
        </ul>
      </section>

      {/* Bottom CTA */}
      <section className="mt-16 surface p-8 text-center">
        <p className="text-sm text-[var(--muted)] mb-4">사전 준비 끝났다면</p>
        <Link
          href="/console"
          className="inline-block px-6 py-3 bg-[var(--accent)] text-[var(--accent-fg)] rounded-lg font-semibold hover:bg-[var(--accent-bright)] transition-colors"
        >
          운영 콘솔 열기 →
        </Link>
      </section>
    </div>
  );
}

function HostCard({
  tier,
  name,
  steps,
}: {
  tier: string;
  name: string;
  steps: string[];
}) {
  return (
    <div className="surface p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-wider text-[var(--accent-bright)] font-mono px-1.5 py-0.5 bg-[var(--accent-soft)] rounded">
          {tier}
        </span>
        <span className="font-semibold text-sm">{name}</span>
      </div>
      <ol className="text-xs text-[var(--muted)] leading-relaxed space-y-1 list-decimal list-inside">
        {steps.map((s, i) => (
          <li key={i}>
            <code className="text-xs">{s}</code>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ModelCard({
  color,
  name,
  model,
  role,
}: {
  color: string;
  name: string;
  model: string;
  role: string;
}) {
  return (
    <div className="surface p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="font-semibold">{name}</span>
      </div>
      <div className="text-xs font-mono text-[var(--muted-soft)] mb-2">{model}</div>
      <div className="text-xs text-[var(--muted)]">{role}</div>
    </div>
  );
}

function PageCard({
  href,
  num,
  title,
  desc,
}: {
  href: string;
  num: string;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href} className="surface surface-hover p-4 block">
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-xs font-mono text-[var(--muted-soft)] tabular-nums">{num}</span>
        <span className="font-semibold">{title}</span>
      </div>
      <div className="text-xs text-[var(--muted)] leading-relaxed pl-7">{desc}</div>
    </Link>
  );
}
