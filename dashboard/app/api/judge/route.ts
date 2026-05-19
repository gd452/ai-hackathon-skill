import { NextResponse } from "next/server";
import path from "node:path";
import { existsSync } from "node:fs";
import {
  JUDGE_SCRIPT,
  SUBMISSIONS_DIR,
  OUTPUT_DIR,
  ensureDataDirs,
  evidenceRepoPath,
  evidenceVideoPath,
} from "@/lib/paths";
import { loadConfig } from "@/lib/config";
import { runScript } from "@/lib/runScript";

export async function POST(req: Request) {
  ensureDataDirs();
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
    }
    const subPath = path.join(SUBMISSIONS_DIR, `${id}.md`);

    const cfg = loadConfig();

    const args = [
      "--submission",
      subPath,
      "--out",
      OUTPUT_DIR,
      "--team",
      String(id),
      "--w-readme",
      String(cfg.itemWeights.readme),
      "--w-code",
      String(cfg.itemWeights.code),
      "--w-ai",
      String(cfg.itemWeights.ai),
      "--w-complete",
      String(cfg.itemWeights.complete),
      "--w-diff",
      String(cfg.itemWeights.diff),
    ];

    // Auto-attach saved evidence if present
    const repoEv = evidenceRepoPath(id);
    if (existsSync(repoEv)) {
      args.push("--evidence-repo", repoEv);
    }
    const videoEv = evidenceVideoPath(id);
    if (existsSync(videoEv)) {
      args.push("--evidence-video", videoEv);
    }

    const result = await runScript(JUDGE_SCRIPT, args);
    // judge-submission.sh exit 2 = partial success (some model failed but rubric written)
    const ok = result.code === 0 || result.code === 2;
    return NextResponse.json({
      ok,
      stdout: result.stdout,
      stderr: result.stderr,
      code: result.code,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown" },
      { status: 500 },
    );
  }
}
