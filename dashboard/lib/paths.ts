import path from "node:path";
import { existsSync, mkdirSync } from "node:fs";

// Skill root = dashboard 폴더의 상위 (== ai-hackathon-skill)
export const SKILL_ROOT = path.resolve(process.cwd(), "..");
export const DATA_DIR = path.join(SKILL_ROOT, "data");
export const SUBMISSIONS_DIR = path.join(DATA_DIR, "submissions");
export const OUTPUT_DIR = path.join(DATA_DIR, "output");
export const CONFIG_FILE = path.join(DATA_DIR, "config.json");
export const PEER_FILE = path.join(DATA_DIR, "peer-scores.json");
export const JUDGE_FILE = path.join(DATA_DIR, "judge-scores.json");

export const SCRIPTS_DIR = path.join(SKILL_ROOT, "scripts");
export const JUDGE_SCRIPT = path.join(SCRIPTS_DIR, "judge-submission.sh");
export const LEADERBOARD_SCRIPT = path.join(SCRIPTS_DIR, "build-leaderboard.sh");
export const FETCH_REPO_SCRIPT = path.join(SCRIPTS_DIR, "fetch-repo.sh");
export const FETCH_VIDEO_SCRIPT = path.join(SCRIPTS_DIR, "fetch-video.sh");

export function evidenceRepoPath(id: string) {
  return path.join(SUBMISSIONS_DIR, `${id}.evidence-repo.json`);
}
export function evidenceVideoPath(id: string) {
  return path.join(SUBMISSIONS_DIR, `${id}.evidence-video.json`);
}

export function ensureDataDirs() {
  for (const d of [DATA_DIR, SUBMISSIONS_DIR, OUTPUT_DIR]) {
    if (!existsSync(d)) mkdirSync(d, { recursive: true });
  }
}

export type EventConfig = {
  name: string;
  topic: string;
  date: string;
  durationHours: number;
  participantCount: number;
  itemWeights: {
    readme: number;
    code: number;
    ai: number;
    complete: number;
    diff: number;
  };
  sourceWeights: {
    ai: number;
    peer: number;
    judge: number;
  };
  // Which submission inputs are required vs optional.
  // Operator can toggle in /config.
  requiredFields: {
    markdown: boolean;   // 팀 설명 markdown (보통 필수)
    liveUrl: boolean;    // 실제 동작 사이트 URL (보통 필수)
    github: boolean;     // GitHub repo URL (옵션 — 자동 evidence 수집)
    youtube: boolean;    // 시연 영상 URL (옵션 — Gemini Video 자동 분석)
  };
};

export const DEFAULT_CONFIG: EventConfig = {
  name: "AI Hackathon 2026",
  topic: "AI 시대의 1인 사이드프로젝트",
  date: new Date().toISOString().slice(0, 10),
  durationHours: 8,
  participantCount: 30,
  itemWeights: { readme: 20, code: 25, ai: 25, complete: 20, diff: 10 },
  sourceWeights: { ai: 40, peer: 30, judge: 30 },
  requiredFields: {
    markdown: true,
    liveUrl: true,
    github: false,
    youtube: false,
  },
};
