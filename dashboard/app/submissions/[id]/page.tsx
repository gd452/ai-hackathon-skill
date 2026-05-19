import Link from "next/link";
import { notFound } from "next/navigation";
import { readSubmission, readRubric } from "@/lib/submissions";

export const dynamic = "force-dynamic";

export default async function SubmissionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = readSubmission(id);
  if (!submission) notFound();
  const rubric = readRubric(id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        href="/submissions"
        className="text-sm text-[var(--accent-bright)] hover:underline mb-4 inline-block"
      >
        ← 제출 목록
      </Link>

      <h1 className="text-2xl font-bold mb-6 font-mono">{id}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h2 className="text-sm uppercase tracking-wider text-[var(--muted)] mb-2">
            제출 내용
          </h2>
          <pre className="text-xs whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-auto">
            {submission}
          </pre>
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-wider text-[var(--muted)] mb-2">
            AI 채점 결과 (rubric)
          </h2>
          {rubric ? (
            <pre className="text-xs whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-auto">
              {rubric}
            </pre>
          ) : (
            <div className="p-6 text-center text-sm text-[var(--muted)] border border-dashed border-[var(--border)] rounded-lg">
              아직 채점되지 않았습니다. 제출 목록에서 "AI 채점" 클릭.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
