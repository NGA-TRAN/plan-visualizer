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

/** v1 is UTF-8 text compressed with gzip, encoded as URL-safe base64. */
export async function createSharedPlanLink(plan: string): Promise<string> {
  if (!plan.trim()) throw new Error("Enter a plan before sharing.");
  const source = new Blob([plan]);
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
  const link = PUBLIC_VISUALIZER_URL + "#plan=v1." + encoded;
  if (link.length > MAX_SHARE_URL_LENGTH) throw tooLarge();
  return link;
}

export async function readSharedPlan(hash: string): Promise<string | null> {
  if (!hash.startsWith("#plan=")) return null;
  if (PUBLIC_VISUALIZER_URL.length + hash.length > MAX_SHARE_URL_LENGTH)
    throw tooLarge();
  const match = /^#plan=v1\.([A-Za-z0-9_-]+)$/.exec(hash);
  if (!match || match[1].length % 4 === 1) throw invalidLink();

  let bytes: Uint8Array<ArrayBuffer>;
  try {
    const base64 = match[1].replace(/-/g, "+").replace(/_/g, "/");
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
  const plan = parts.join("");
  if (!plan.trim()) throw invalidLink();
  return plan;
}
