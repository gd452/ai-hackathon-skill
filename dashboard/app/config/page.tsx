import { loadConfig } from "@/lib/config";
import { ConfigForm } from "./client";

export const dynamic = "force-dynamic";

export default function ConfigPage() {
  const cfg = loadConfig();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">설정</h1>
      <ConfigForm initial={cfg} />
    </div>
  );
}
