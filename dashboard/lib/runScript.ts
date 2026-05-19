import { spawn } from "node:child_process";

export type RunResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
  code: number | null;
};

export function runScript(scriptPath: string, args: string[]): Promise<RunResult> {
  return new Promise((resolve) => {
    const proc = spawn(scriptPath, args, {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => {
      stdout += d.toString();
    });
    proc.stderr.on("data", (d) => {
      stderr += d.toString();
    });

    proc.on("close", (code) => {
      resolve({ ok: code === 0, stdout, stderr, code });
    });

    proc.on("error", (err) => {
      resolve({ ok: false, stdout, stderr: stderr + "\n" + err.message, code: null });
    });
  });
}
