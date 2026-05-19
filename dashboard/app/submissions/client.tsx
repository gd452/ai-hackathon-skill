"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type RequiredFields = {
  markdown: boolean;
  liveUrl: boolean;
  github: boolean;
  youtube: boolean;
};

const SAMPLE = `# Team #01 — 팀명

**Live URL** (실제 동작 사이트): https://example.com

## 프로젝트 설명

(어떤 프로덕트인가, 누가 어떻게 쓰나, 3~5 문장)

## 체크 항목

- 사용한 AI 도구:
- 프롬프트 공개 여부:
- 테스트 여부:
- 남은 한계:

## 차별점

(한 줄 — 기존 솔루션 대비 무엇이 다른가)
`;

function tag(required: boolean) {
  return required ? "(필수)" : "(옵션)";
}

const EVIDENCE_START = "<!-- AUTO_EVIDENCE_START -->";
const EVIDENCE_END = "<!-- AUTO_EVIDENCE_END -->";

function stripEvidence(body: string): string {
  // Remove existing auto-evidence block (run before re-appending fresh evidence)
  return body
    .replace(new RegExp(`\\n*---\\n*${EVIDENCE_START}[\\s\\S]*?${EVIDENCE_END}\\n*`, "g"), "\n")
    .trim();
}

export function AddSubmissionForm({ requiredFields }: { requiredFields: RequiredFields }) {
  const router = useRouter();
  const [id, setId] = useState("team-01");
  const [content, setContent] = useState(SAMPLE);
  const [githubUrl, setGithubUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const hasFetchableUrl = !!(githubUrl.trim() || youtubeUrl.trim());

  async function fetchEvidence() {
    setFetching(true);
    setMsg(null);
    try {
      const res = await fetch("/api/submissions/fetch-evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl, youtubeUrl }),
      });
      const data = await res.json();
      if (!data.ok) {
        setMsg("Evidence 수집 실패: " + (data.error || "unknown"));
        return;
      }
      if (!data.markdown) {
        setMsg("수집된 evidence 없음 (URL 빈 칸이거나 둘 다 실패)");
        return;
      }
      // Replace any existing evidence block with the fresh one
      const stripped = stripEvidence(content);
      const merged = `${stripped}\n\n---\n${EVIDENCE_START}\n${data.markdown}\n${EVIDENCE_END}\n`;
      setContent(merged);
      const warn = data.errors
        ? ` (일부 실패: ${Object.keys(data.errors).join(", ")})`
        : "";
      setMsg(`✓ Evidence 수집 완료 — 검토 후 저장하세요${warn}`);
    } catch (e) {
      setMsg("Evidence 수집 오류: " + (e instanceof Error ? e.message : "unknown"));
    } finally {
      setFetching(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    // Compose final markdown — prepend Live URL line if user filled the dedicated input
    const finalContent = liveUrl.trim()
      ? content.includes("**Live URL**")
        ? content
        : `**Live URL**: ${liveUrl.trim()}\n\n${content}`
      : content;
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, content: finalContent }),
      });
      if (res.ok) {
        setContent(SAMPLE);
        setGithubUrl("");
        setYoutubeUrl("");
        setLiveUrl("");
        setMsg(`✓ 저장됨 (${id})`);
        router.refresh();
      } else {
        const text = await res.text();
        setMsg("저장 실패: " + text);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">팀 ID (파일명)</label>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] text-sm font-mono"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">
            Live URL <span className="text-[var(--muted)]">{tag(requiredFields.liveUrl)}</span>
          </label>
          <input
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            placeholder="https://my-app.example.com"
            required={requiredFields.liveUrl}
            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] text-sm font-mono"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">
            GitHub URL <span className="text-[var(--muted)]">{tag(requiredFields.github)}</span>
          </label>
          <input
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            required={requiredFields.github}
            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] text-sm font-mono"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">
            YouTube URL{" "}
            <span className="text-[var(--muted)]">{tag(requiredFields.youtube)} · ≤ 1:30</span>
          </label>
          <input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtu.be/XXXX"
            required={requiredFields.youtube}
            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] text-sm font-mono"
          />
        </div>
      </div>

      {hasFetchableUrl && (
        <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
          <button
            type="button"
            onClick={fetchEvidence}
            disabled={fetching}
            className="px-3 py-1.5 rounded-md border border-[var(--accent)] text-[var(--accent-bright)] font-medium hover:bg-[var(--accent-soft)] transition-colors disabled:opacity-50"
          >
            {fetching ? "수집 중… (최대 1~2분)" : "1. Evidence 자동 수집"}
          </button>
          <span>
            URL 옵션을 입력했다면 먼저 클릭 → 본문에 자동 첨부 → 검토 후 저장
          </span>
        </div>
      )}

      <div>
        <label className="block text-xs text-[var(--muted)] mb-1">
          제출 내용 (Markdown) <span className="text-[var(--muted)]">{tag(requiredFields.markdown)}</span>{" "}
          — 자동 수집된 evidence 는{" "}
          <code className="text-xs">{EVIDENCE_START}</code> 블록으로 들어가며, 운영자가 자유롭게 편집 가능
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[280px] p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] text-sm font-mono resize-y leading-relaxed"
          spellCheck={false}
          required={requiredFields.markdown}
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-fg)] rounded-lg font-medium hover:bg-[var(--accent-bright)] transition-colors disabled:opacity-50"
        >
          {saving ? "저장 중…" : hasFetchableUrl ? "2. 저장" : "저장"}
        </button>
        {msg && <span className="text-sm text-[var(--muted)]">{msg}</span>}
      </div>
    </form>
  );
}

export function JudgeButton({ id, done }: { id: string; done: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setProgress("3 모델 호출 중…");
    const res = await fetch("/api/judge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    setLoading(false);
    setProgress(null);
    if (data.ok) {
      router.refresh();
    } else {
      alert("채점 실패:\n" + (data.stderr || data.error || "unknown"));
    }
  }

  return (
    <div className="flex items-center gap-2">
      {progress && <span className="text-xs text-[var(--muted)]">{progress}</span>}
      <button
        onClick={run}
        disabled={loading}
        className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors disabled:opacity-50 ${
          done
            ? "border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]"
            : "bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-bright)]"
        }`}
      >
        {loading ? "채점 중…" : done ? "재채점" : "AI 채점"}
      </button>
    </div>
  );
}
