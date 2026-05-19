import { NextResponse } from "next/server";
import { saveSubmission, saveEvidence } from "@/lib/submissions";

// POST /api/submissions
// Body: {
//   id: string,
//   content: string,
//   repoEvidence?: <json from fetch-repo>,
//   videoEvidence?: <json from fetch-video>,
// }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = String(body.id || "").trim();
    const content = String(body.content || "");
    if (!id || !content) {
      return NextResponse.json({ ok: false, error: "id 또는 content 누락" }, { status: 400 });
    }
    const savedId = saveSubmission(id, content);

    if (body.repoEvidence) {
      saveEvidence(savedId, "repo", JSON.stringify(body.repoEvidence, null, 2));
    }
    if (body.videoEvidence) {
      saveEvidence(savedId, "video", JSON.stringify(body.videoEvidence, null, 2));
    }

    return NextResponse.json({ ok: true, id: savedId });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown" },
      { status: 500 },
    );
  }
}
