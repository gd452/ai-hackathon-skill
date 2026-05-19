import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import {
  SUBMISSIONS_DIR,
  OUTPUT_DIR,
  ensureDataDirs,
  evidenceRepoPath,
  evidenceVideoPath,
} from "./paths";

export type Submission = {
  id: string;
  filePath: string;
  hasRubric: boolean;
  aiScore: number | null;
  preview: string;
  evidence: { repo: boolean; video: boolean };
};

export function listSubmissions(): Submission[] {
  ensureDataDirs();
  if (!existsSync(SUBMISSIONS_DIR)) return [];

  const files = readdirSync(SUBMISSIONS_DIR).filter(
    (f) => f.endsWith(".md") && !f.endsWith(".evidence-repo.json") && !f.endsWith(".evidence-video.json"),
  );
  return files.map((f) => {
    const id = path.basename(f, ".md");
    const filePath = path.join(SUBMISSIONS_DIR, f);
    const rubricPath = path.join(OUTPUT_DIR, `${id}.rubric.md`);
    const hasRubric = existsSync(rubricPath);
    let aiScore: number | null = null;
    if (hasRubric) {
      const rubricContent = readFileSync(rubricPath, "utf8");
      const m = rubricContent.match(/AI 종합 점수:\s*\*\*([\d.]+)/);
      if (m) aiScore = parseFloat(m[1]);
    }
    const content = readFileSync(filePath, "utf8");
    const preview = content.split("\n").slice(0, 4).join("\n").slice(0, 200);
    return {
      id,
      filePath,
      hasRubric,
      aiScore,
      preview,
      evidence: {
        repo: existsSync(evidenceRepoPath(id)),
        video: existsSync(evidenceVideoPath(id)),
      },
    };
  });
}

export function readSubmission(id: string): string | null {
  const p = path.join(SUBMISSIONS_DIR, `${id}.md`);
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf8");
}

export function readRubric(id: string): string | null {
  const p = path.join(OUTPUT_DIR, `${id}.rubric.md`);
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf8");
}

export function saveSubmission(id: string, content: string) {
  ensureDataDirs();
  const safeName = id.replace(/[^a-zA-Z0-9-_가-힣]/g, "-");
  const p = path.join(SUBMISSIONS_DIR, `${safeName}.md`);
  writeFileSync(p, content);
  return safeName;
}

export function saveEvidence(id: string, type: "repo" | "video", jsonText: string) {
  ensureDataDirs();
  const safeName = id.replace(/[^a-zA-Z0-9-_가-힣]/g, "-");
  const target = type === "repo" ? evidenceRepoPath(safeName) : evidenceVideoPath(safeName);
  writeFileSync(target, jsonText);
}

export function readEvidence(id: string, type: "repo" | "video"): string | null {
  const p = type === "repo" ? evidenceRepoPath(id) : evidenceVideoPath(id);
  return existsSync(p) ? readFileSync(p, "utf8") : null;
}

export function hasEvidence(id: string) {
  return {
    repo: existsSync(evidenceRepoPath(id)),
    video: existsSync(evidenceVideoPath(id)),
  };
}
