"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BuildLeaderboardButton({
  disabled,
  generatedAt,
}: {
  disabled?: boolean;
  generatedAt: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  async function build() {
    setLoading(true);
    setFlash(null);
    try {
      const res = await fetch("/api/leaderboard", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setFlash("✓ 리더보드 갱신됨");
        router.refresh();
        setTimeout(() => setFlash(null), 2500);
      } else {
        setFlash("실패: " + (data.stderr || data.error || "unknown").slice(0, 120));
      }
    } catch (e) {
      setFlash("네트워크 오류: " + (e instanceof Error ? e.message : "unknown"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {flash && <span className="text-xs text-[var(--accent-bright)]">{flash}</span>}
      {!flash && generatedAt && (
        <span className="text-xs text-[var(--muted)]">
          마지막 생성: {new Date(generatedAt).toLocaleTimeString("ko-KR")}
        </span>
      )}
      <button
        onClick={build}
        disabled={disabled || loading}
        className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-fg)] rounded-lg font-medium hover:bg-[var(--accent-bright)] transition-colors disabled:opacity-50"
      >
        {loading ? "생성 중…" : generatedAt ? "리더보드 갱신" : "리더보드 생성"}
      </button>
    </div>
  );
}
