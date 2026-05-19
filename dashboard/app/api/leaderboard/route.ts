import { NextResponse } from "next/server";
import path from "node:path";
import { existsSync } from "node:fs";
import { LEADERBOARD_SCRIPT, OUTPUT_DIR, DATA_DIR, ensureDataDirs } from "@/lib/paths";
import { loadConfig } from "@/lib/config";
import { runScript } from "@/lib/runScript";

export async function POST() {
  ensureDataDirs();
  try {
    const cfg = loadConfig();
    const peerFile = path.join(DATA_DIR, "peer-scores.json");
    const judgeFile = path.join(DATA_DIR, "judge-scores.json");

    const args = [
      "--rubric-dir",
      OUTPUT_DIR,
      "--out",
      path.join(OUTPUT_DIR, "leaderboard.md"),
      "--w-ai",
      String(cfg.sourceWeights.ai),
      "--w-peer",
      String(cfg.sourceWeights.peer),
      "--w-judge",
      String(cfg.sourceWeights.judge),
    ];
    if (existsSync(peerFile)) {
      args.push("--peer", peerFile);
    }
    if (existsSync(judgeFile)) {
      args.push("--judge", judgeFile);
    }

    const result = await runScript(LEADERBOARD_SCRIPT, args);
    return NextResponse.json({
      ok: result.ok,
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
