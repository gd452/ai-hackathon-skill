import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { CONFIG_FILE, DEFAULT_CONFIG, ensureDataDirs, type EventConfig } from "./paths";

export function loadConfig(): EventConfig {
  ensureDataDirs();
  if (!existsSync(CONFIG_FILE)) {
    writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
    return DEFAULT_CONFIG;
  }
  try {
    const raw = readFileSync(CONFIG_FILE, "utf8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(cfg: EventConfig) {
  ensureDataDirs();
  writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2));
}

export function checkEnv() {
  const missing: string[] = [];
  if (!process.env.ANTHROPIC_API_KEY) missing.push("ANTHROPIC_API_KEY");
  if (!process.env.GEMINI_API_KEY) missing.push("GEMINI_API_KEY");
  if (!process.env.OPENAI_API_KEY) missing.push("OPENAI_API_KEY");
  return {
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    missing,
  };
}
