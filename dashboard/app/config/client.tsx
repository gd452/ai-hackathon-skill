"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { EventConfig } from "@/lib/paths";

export function ConfigForm({ initial }: { initial: EventConfig }) {
  const router = useRouter();
  const [cfg, setCfg] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const itemSum =
    cfg.itemWeights.readme +
    cfg.itemWeights.code +
    cfg.itemWeights.ai +
    cfg.itemWeights.complete +
    cfg.itemWeights.diff;
  const sourceSum =
    cfg.sourceWeights.ai + cfg.sourceWeights.peer + cfg.sourceWeights.judge;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg),
    });
    setSaving(false);
    if (res.ok) {
      setMsg("저장됨 ✓");
      router.refresh();
    } else {
      setMsg("저장 실패");
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold mb-2">행사 정보</h2>
        <Field
          label="행사명"
          value={cfg.name}
          onChange={(v) => setCfg({ ...cfg, name: v })}
        />
        <Field
          label="주제"
          value={cfg.topic}
          onChange={(v) => setCfg({ ...cfg, topic: v })}
        />
        <div className="grid grid-cols-3 gap-3">
          <Field
            label="일자"
            value={cfg.date}
            onChange={(v) => setCfg({ ...cfg, date: v })}
          />
          <NumField
            label="기간 (시간)"
            value={cfg.durationHours}
            onChange={(v) => setCfg({ ...cfg, durationHours: v })}
          />
          <NumField
            label="참가자 수"
            value={cfg.participantCount}
            onChange={(v) => setCfg({ ...cfg, participantCount: v })}
          />
        </div>
      </section>

      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">5 항목 가중치 (rubric)</h2>
          <span
            className={`text-xs font-mono ${
              itemSum === 100 ? "text-[var(--accent-bright)]" : "text-orange-500"
            }`}
          >
            합 {itemSum}% {itemSum === 100 ? "✓" : "(100% 권장)"}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <NumField
            label="README"
            value={cfg.itemWeights.readme}
            onChange={(v) =>
              setCfg({ ...cfg, itemWeights: { ...cfg.itemWeights, readme: v } })
            }
            suffix="%"
          />
          <NumField
            label="코드"
            value={cfg.itemWeights.code}
            onChange={(v) =>
              setCfg({ ...cfg, itemWeights: { ...cfg.itemWeights, code: v } })
            }
            suffix="%"
          />
          <NumField
            label="AI 활용"
            value={cfg.itemWeights.ai}
            onChange={(v) =>
              setCfg({ ...cfg, itemWeights: { ...cfg.itemWeights, ai: v } })
            }
            suffix="%"
          />
          <NumField
            label="완성도"
            value={cfg.itemWeights.complete}
            onChange={(v) =>
              setCfg({ ...cfg, itemWeights: { ...cfg.itemWeights, complete: v } })
            }
            suffix="%"
          />
          <NumField
            label="차별성"
            value={cfg.itemWeights.diff}
            onChange={(v) =>
              setCfg({ ...cfg, itemWeights: { ...cfg.itemWeights, diff: v } })
            }
            suffix="%"
          />
        </div>
      </section>

      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">3 source 가중치 (최종)</h2>
          <span
            className={`text-xs font-mono ${
              sourceSum === 100 ? "text-[var(--accent-bright)]" : "text-orange-500"
            }`}
          >
            합 {sourceSum}% {sourceSum === 100 ? "✓" : "(100% 권장)"}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <NumField
            label="🤖 AI 심사"
            value={cfg.sourceWeights.ai}
            onChange={(v) =>
              setCfg({ ...cfg, sourceWeights: { ...cfg.sourceWeights, ai: v } })
            }
            suffix="%"
          />
          <NumField
            label="👥 동료 평가"
            value={cfg.sourceWeights.peer}
            onChange={(v) =>
              setCfg({ ...cfg, sourceWeights: { ...cfg.sourceWeights, peer: v } })
            }
            suffix="%"
          />
          <NumField
            label="🧑‍⚖️ 심사위원"
            value={cfg.sourceWeights.judge}
            onChange={(v) =>
              setCfg({ ...cfg, sourceWeights: { ...cfg.sourceWeights, judge: v } })
            }
            suffix="%"
          />
        </div>
      </section>

      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold">제출 입력 필수 / 옵션</h2>
        <p className="text-xs text-[var(--muted)] -mt-1">
          기본: markdown · Live URL 필수, GitHub · YouTube 옵션. 행사 성격에 맞춰 조정.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <ToggleRow
            label="Markdown 본문 (팀 설명)"
            value={cfg.requiredFields.markdown}
            onChange={(v) =>
              setCfg({ ...cfg, requiredFields: { ...cfg.requiredFields, markdown: v } })
            }
          />
          <ToggleRow
            label="Live URL (실 동작 사이트)"
            value={cfg.requiredFields.liveUrl}
            onChange={(v) =>
              setCfg({ ...cfg, requiredFields: { ...cfg.requiredFields, liveUrl: v } })
            }
          />
          <ToggleRow
            label="GitHub URL (코드 evidence 자동 수집)"
            value={cfg.requiredFields.github}
            onChange={(v) =>
              setCfg({ ...cfg, requiredFields: { ...cfg.requiredFields, github: v } })
            }
          />
          <ToggleRow
            label="YouTube URL (시연 영상 자동 분석)"
            value={cfg.requiredFields.youtube}
            onChange={(v) =>
              setCfg({ ...cfg, requiredFields: { ...cfg.requiredFields, youtube: v } })
            }
          />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-fg)] rounded-lg font-medium hover:bg-[var(--accent-bright)] transition-colors disabled:opacity-50"
        >
          {saving ? "저장 중…" : "저장"}
        </button>
        {msg && <span className="text-sm text-[var(--muted)]">{msg}</span>}
      </div>
    </form>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg cursor-pointer hover:border-[var(--accent)] transition-colors">
      <span className="text-sm">{label}</span>
      <span
        className={`inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          value ? "bg-[var(--accent)]" : "bg-[var(--border)]"
        }`}
      >
        <span
          className={`h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? "translate-x-4" : "translate-x-1"
          }`}
        />
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-[var(--muted)] mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] text-sm"
      />
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-[var(--muted)] mb-1">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] text-sm font-mono"
        />
        {suffix && <span className="text-xs text-[var(--muted)]">{suffix}</span>}
      </div>
    </div>
  );
}
