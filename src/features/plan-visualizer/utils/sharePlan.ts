import {
  DEFAULT_PLAN_VIEW,
  isPlanViewSettings,
  type PlanViewSettings,
} from "./planView";

export interface SharedPlan {
  plan: string;
  settings: PlanViewSettings;
}

export const PUBLIC_VISUALIZER_URL =
  "https://nga-tran.github.io/plan-visualizer/";
export const MAX_SHARED_PLAN_BYTES = 1024 * 1024;
export const MAX_SHARE_URL_LENGTH = 32_000;

const invalidLink = () =>
  new Error(
    "This shared plan link is invalid or incomplete. Paste or upload a plan instead.",
  );
const tooLarge = () =>
  new Error(
    "This plan is too large for a share link. Share the plan as a text file instead.",
  );

/** v2 compresses plan text and display settings as JSON; v1 text links still load. */
export async function createSharedPlanLink(
  plan: string,
  settings: PlanViewSettings = DEFAULT_PLAN_VIEW,
): Promise<string> {
  if (!plan.trim()) throw new Error("Enter a plan before sharing.");
  const source = new Blob([JSON.stringify({ plan, settings })]);
  if (source.size > MAX_SHARED_PLAN_BYTES) throw tooLarge();
  const compressed = new Uint8Array(
    await new Response(
      source.stream().pipeThrough(new CompressionStream("gzip")),
    ).arrayBuffer(),
  );
  // Avoid spreading a potentially large buffer into a function's arguments.
  let binary = "";
  for (const byte of compressed) binary += String.fromCharCode(byte);
  const encoded = btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const link = PUBLIC_VISUALIZER_URL + "#plan=v2." + encoded;
  if (link.length > MAX_SHARE_URL_LENGTH) throw tooLarge();
  return link;
}

export async function readSharedPlan(hash: string): Promise<SharedPlan | null> {
  if (!hash.startsWith("#plan=")) return null;
  if (PUBLIC_VISUALIZER_URL.length + hash.length > MAX_SHARE_URL_LENGTH)
    throw tooLarge();
  const match = /^#plan=v([12])\.([A-Za-z0-9_-]+)$/.exec(hash);
  if (!match || match[2].length % 4 === 1) throw invalidLink();

  let bytes: Uint8Array<ArrayBuffer>;
  try {
    const base64 = match[2].replace(/-/g, "+").replace(/_/g, "/");
    bytes = Uint8Array.from(atob(base64), (character) =>
      character.charCodeAt(0),
    );
  } catch {
    throw invalidLink();
  }
  const reader = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"))
    .getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const parts: string[] = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_SHARED_PLAN_BYTES) throw tooLarge();
      parts.push(decoder.decode(value, { stream: true }));
    }
    parts.push(decoder.decode());
  } catch {
    // Stop reading before an oversized payload can consume unlimited memory.
    await reader.cancel().catch(() => {});
    if (size > MAX_SHARED_PLAN_BYTES) throw tooLarge();
    throw invalidLink();
  } finally {
    reader.releaseLock();
  }
  const text = parts.join("");
  if (match[1] === "1") {
    if (!text.trim()) throw invalidLink();
    return { plan: text, settings: DEFAULT_PLAN_VIEW };
  }
  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    throw invalidLink();
  }
  if (!payload || typeof payload !== "object") throw invalidLink();
  const shared = payload as Record<string, unknown>;
  const { getPlanViewCapabilities } = await import("plan-viz");
  if (
    typeof shared.plan !== "string" ||
    !shared.plan.trim() ||
    !isPlanViewSettings(shared.settings, getPlanViewCapabilities())
  )
    throw invalidLink();
  return { plan: shared.plan, settings: shared.settings };
}
