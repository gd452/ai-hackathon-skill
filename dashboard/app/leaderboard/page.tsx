import { BuildLeaderboardButton } from "./client";
import { listSubmissions } from "@/lib/submissions";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { DATA_DIR, OUTPUT_DIR } from "@/lib/paths";

export const dynamic = "force-dynamic";

type LeaderboardJson = {
  generated_at: string;
  weights: { ai: number; peer: number; judge: number };
  has_peer: boolean;
  has_judge: boolean;
  teams: {
    rank: number;
    team: string;
    ai: number;
    peer: number;
    judge: number;
    final: number;
  }[];
};

export default function LeaderboardPage() {
  const subs = listSubmissions();
  const judged = subs.filter((s) => s.hasRubric);
  const jsonPath = path.join(OUTPUT_DIR, "leaderboard.json");
  const data: LeaderboardJson | null = existsSync(jsonPath)
    ? JSON.parse(readFileSync(jsonPath, "utf8"))
    : null;

  const peerExists = existsSync(path.join(DATA_DIR, "peer-scores.json"));
  const judgeExists = existsSync(path.join(DATA_DIR, "judge-scores.json"));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-1">리더보드</h1>
          <p className="text-sm text-[var(--muted)]">
            AI 채점 ({judged.length}/{subs.length}) + 동료 평가{" "}
            {peerExists ? "✓" : "—"} + 심사위원 {judgeExists ? "✓" : "—"}
          </p>
        </div>
        <BuildLeaderboardButton
          disabled={judged.length === 0}
          generatedAt={data?.generated_at ?? null}
        />
      </header>

      {!data && (
        <div className="p-6 text-sm text-[var(--muted)] border border-dashed border-[var(--border)] rounded-xl mb-6">
          리더보드 아직 생성되지 않았습니다. AI 채점 + (선택) 동료/심사 점수 준비 후 &quot;리더보드 생성&quot; 클릭.
        </div>
      )}

      {data && (
        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span>
              가중치: 🤖 AI {data.weights.ai}% · 👥 동료 {data.weights.peer}% · 🧑‍⚖️ 심사{" "}
              {data.weights.judge}%
            </span>
            <span>생성: {new Date(data.generated_at).toLocaleString("ko-KR")}</span>
          </div>

          {data.teams.map((t) => (
            <TeamCard
              key={t.team}
              row={t}
              weights={data.weights}
              hasPeer={data.has_peer}
              hasJudge={data.has_judge}
              maxFinal={data.teams[0]?.final ?? 100}
            />
          ))}

          <p className="text-xs text-[var(--muted)] mt-4">
            ⚠️ AI 1차 채점 결과. 최종 시상은 사람 심사위원이 검토 후 확정. 팀별 상세는{" "}
            <code className="text-xs">data/output/&lt;team&gt;.rubric.md</code>.
          </p>
        </section>
      )}

      <section className="mt-8 p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm">
        <h2 className="font-semibold mb-2">동료 평가 / 심사위원 점수 추가</h2>
        <p className="text-xs text-[var(--muted)] mb-3 leading-relaxed">
          이 dashboard 는 폼 수집을 직접 하지 않음. Google Form 등 외부 도구로 수집 →
          JSON 파일로 저장하면 자동 반영.
        </p>
        <p className="text-xs font-mono">
          data/peer-scores.json &nbsp;·&nbsp; data/judge-scores.json
        </p>
        <pre className="mt-3 text-xs">
{`{
  "team-01": 78,
  "team-02": 55,
  "team-03": 88
}`}
        </pre>
        <p className="text-xs text-[var(--muted)] mt-2">
          저장 후 &quot;리더보드 생성&quot; 다시 누르면 가중 합산에 반영. 자세한 수집 가이드 →{" "}
          <code>docs/RUNBOOK.md</code>
        </p>
      </section>
    </div>
  );
}

function TeamCard({
  row,
  weights,
  hasPeer,
  hasJudge,
  maxFinal,
}: {
  row: LeaderboardJson["teams"][number];
  weights: LeaderboardJson["weights"];
  hasPeer: boolean;
  hasJudge: boolean;
  maxFinal: number;
}) {
  const medal = row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : null;
  const finalPct = Math.min(100, (row.final / Math.max(1, maxFinal)) * 100);

  return (
    <article className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="text-xl font-bold w-8 text-center">
            {medal || `#${row.rank}`}
          </div>
          <div className="font-semibold truncate">{row.team}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tabular-nums">{row.final.toFixed(2)}</div>
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">final</div>
        </div>
      </div>

      <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden mb-3">
        <div
          className="h-full bg-[var(--accent)] rounded-full transition-all"
          style={{ width: `${finalPct}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <ScoreCell label={`🤖 AI · ${weights.ai}%`} value={row.ai} present />
        <ScoreCell label={`👥 동료 · ${weights.peer}%`} value={row.peer} present={hasPeer} />
        <ScoreCell label={`🧑‍⚖️ 심사 · ${weights.judge}%`} value={row.judge} present={hasJudge} />
      </div>
    </article>
  );
}

function ScoreCell({ label, value, present }: { label: string; value: number; present: boolean }) {
  return (
    <div
      className={`rounded-md px-3 py-2 ${
        present ? "bg-[var(--background)]" : "bg-[var(--background)] opacity-50"
      }`}
    >
      <div className="text-[10px] text-[var(--muted)] mb-0.5">{label}</div>
      <div className="font-mono tabular-nums">
        {present ? value.toFixed(value >= 10 ? 1 : 2) : "—"}
      </div>
    </div>
  );
}
