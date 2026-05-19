import { NextResponse } from "next/server";
import { readFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { FETCH_REPO_SCRIPT, FETCH_VIDEO_SCRIPT } from "@/lib/paths";
import { runScript } from "@/lib/runScript";

// POST /api/submissions/fetch-evidence
// Body: { githubUrl?: string, youtubeUrl?: string }
// Response: { ok, markdown: string, repo?: <json>, video?: <json>, errors?: {...} }
//   `markdown` = human-readable evidence summary ready to paste into submission.md
//   between <!-- AUTO_EVIDENCE_START --> ... <!-- AUTO_EVIDENCE_END --> markers.

type RepoEvidence = {
  ok: boolean;
  url?: string;
  commit_sha?: string;
  extraction_summary?: {
    readme_found: boolean;
    readme_size: number;
    readme_truncated: boolean;
    deps_files: string[];
    entry_files: string[];
    total_files: number;
    scanned_files: number;
    skipped_files: number;
  };
  evidence?: {
    readme: string;
    tree: string;
    deps: Record<string, string>;
    entries: Record<string, string>;
  };
  error?: string;
};

type VideoEvidence = {
  ok: boolean;
  url?: string;
  visual_transcript?: string;
  key_features?: string[];
  ui_elements?: string[];
  notes?: string;
  error?: string;
};

function repoMarkdown(e: RepoEvidence): string {
  if (!e.ok) return `### GitHub repo — 수집 실패\n- 오류: ${e.error || "unknown"}\n`;
  const s = e.extraction_summary!;
  const ev = e.evidence!;
  const lines: string[] = [];
  lines.push(`### GitHub repo (자동 수집)`);
  lines.push(`- URL: ${e.url}`);
  lines.push(`- Commit: \`${e.commit_sha}\``);
  lines.push(
    `- Files scanned: ${s.scanned_files} / ${s.total_files} (${s.skipped_files} skipped)`,
  );
  lines.push(`- Dependencies: ${s.deps_files.join(", ") || "(없음)"}`);
  lines.push(`- Entry candidates: ${s.entry_files.join(", ") || "(없음)"}`);
  lines.push("");
  lines.push(`#### README (auto-extracted${s.readme_truncated ? ", truncated 12KB" : ""})`);
  lines.push("```");
  lines.push(ev.readme || "(README 없음)");
  lines.push("```");
  lines.push("");
  lines.push(`#### File tree (depth 3)`);
  lines.push("```");
  lines.push(ev.tree || "(empty)");
  lines.push("```");
  if (Object.keys(ev.deps).length) {
    lines.push("");
    lines.push(`#### Dependency files`);
    for (const [k, v] of Object.entries(ev.deps)) {
      lines.push(`##### ${k}`);
      lines.push("```");
      lines.push(v);
      lines.push("```");
    }
  }
  if (Object.keys(ev.entries).length) {
    lines.push("");
    lines.push(`#### Entry file candidates`);
    for (const [k, v] of Object.entries(ev.entries)) {
      lines.push(`##### ${k}`);
      lines.push("```");
      lines.push(v);
      lines.push("```");
    }
  }
  return lines.join("\n");
}

function videoMarkdown(v: VideoEvidence): string {
  if (!v.ok) return `### Video — 수집 실패\n- 오류: ${v.error || "unknown"}\n`;
  const lines: string[] = [];
  lines.push(`### Video (Gemini Vision 자동 분석)`);
  lines.push(`- URL: ${v.url}`);
  lines.push(`- Visual transcript: ${v.visual_transcript || "-"}`);
  lines.push(`- Key features: ${v.key_features?.join(" · ") || "-"}`);
  lines.push(`- UI elements: ${v.ui_elements?.join(" · ") || "-"}`);
  lines.push(`- Notes: ${v.notes || "-"}`);
  return lines.join("\n");
}

export async function POST(req: Request) {
  try {
    const { githubUrl, youtubeUrl } = await req.json();

    const tmpRepo = path.join(tmpdir(), `evidence-repo-${Date.now()}.json`);
    const tmpVideo = path.join(tmpdir(), `evidence-video-${Date.now()}.json`);

    const tasks: Promise<unknown>[] = [];
    let repoJson: RepoEvidence | null = null;
    let videoJson: VideoEvidence | null = null;
    const errors: { repo?: string; video?: string } = {};

    if (githubUrl && typeof githubUrl === "string" && githubUrl.trim()) {
      tasks.push(
        runScript(FETCH_REPO_SCRIPT, ["--url", githubUrl.trim(), "--out", tmpRepo]).then((r) => {
          try {
            repoJson = JSON.parse(readFileSync(tmpRepo, "utf8")) as RepoEvidence;
          } catch {
            errors.repo = r.stderr || "fetch-repo failed";
          } finally {
            try {
              unlinkSync(tmpRepo);
            } catch {}
          }
        }),
      );
    }

    if (youtubeUrl && typeof youtubeUrl === "string" && youtubeUrl.trim()) {
      tasks.push(
        runScript(FETCH_VIDEO_SCRIPT, ["--url", youtubeUrl.trim(), "--out", tmpVideo]).then(
          (r) => {
            try {
              videoJson = JSON.parse(readFileSync(tmpVideo, "utf8")) as VideoEvidence;
            } catch {
              errors.video = r.stderr || "fetch-video failed";
            } finally {
              try {
                unlinkSync(tmpVideo);
              } catch {}
            }
          },
        ),
      );
    }

    await Promise.all(tasks);

    const parts: string[] = [];
    if (repoJson) parts.push(repoMarkdown(repoJson));
    if (videoJson) parts.push(videoMarkdown(videoJson));
    const markdown = parts.join("\n\n");

    return NextResponse.json({
      ok: true,
      markdown,
      repo: repoJson,
      video: videoJson,
      errors: Object.keys(errors).length ? errors : undefined,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown" },
      { status: 500 },
    );
  }
}
