import Link from "next/link";
import { listSubmissions } from "@/lib/submissions";
import { loadConfig } from "@/lib/config";
import { AddSubmissionForm, JudgeButton } from "./client";

export const dynamic = "force-dynamic";

export default function SubmissionsPage() {
  const subs = listSubmissions();
  const cfg = loadConfig();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">제출물 ({subs.length})</h1>
        <p className="text-sm text-[var(--muted)]">
          팀별 제출 markdown 을 등록하고 AI 채점 실행. 결과 rubric.md 는{" "}
          <code className="text-xs">data/output/</code> 에 저장됨.
        </p>
      </header>

      <div className="mb-6 p-5 rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <h2 className="text-sm font-semibold mb-3">새 제출 추가</h2>
        <AddSubmissionForm requiredFields={cfg.requiredFields} />
      </div>

      {subs.length === 0 ? (
        <div className="p-10 text-center text-[var(--muted)] border border-dashed border-[var(--border)] rounded-xl">
          제출물이 아직 없습니다. 위 폼으로 첫 제출을 추가해주세요.
        </div>
      ) : (
        <div className="space-y-3">
          {subs.map((s) => (
            <article
              key={s.id}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4"
            >
              <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  <Link
                    href={`/submissions/${s.id}`}
                    className="font-semibold hover:text-[var(--accent-bright)]"
                  >
                    {s.id}
                  </Link>
                  {s.hasRubric ? (
                    <span className="text-xs px-2 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent-bright)] font-medium">
                      AI 채점 완료 · {s.aiScore?.toFixed(1) ?? "?"}
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded border border-[var(--border)] text-[var(--muted)]">
                      대기
                    </span>
                  )}
                  {s.evidence.repo && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--muted)] font-mono">
                      repo
                    </span>
                  )}
                  {s.evidence.video && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--muted)] font-mono">
                      video
                    </span>
                  )}
                </div>
                <JudgeButton id={s.id} done={s.hasRubric} />
              </div>
              <p className="text-xs text-[var(--muted)] whitespace-pre-line line-clamp-2">
                {s.preview}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
