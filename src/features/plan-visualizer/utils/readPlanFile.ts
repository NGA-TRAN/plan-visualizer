/** Maximum plan file size (5 MB) */
export const MAX_PLAN_FILE_BYTES = 5 * 1024 * 1024;

export type ReadPlanFileErrorCode =
  | "empty"
  | "too_large"
  | "excalidraw"
  | "read_failed";

export type ReadPlanFileResult =
  | { ok: true; contents: string; fileName: string }
  | { ok: false; code: ReadPlanFileErrorCode; message: string };

function isExcalidrawFile(file: File): boolean {
  return file.name.toLowerCase().endsWith(".excalidraw");
}

export function validatePlanFile(file: File): ReadPlanFileResult | null {
  if (isExcalidrawFile(file)) {
    return {
      ok: false,
      code: "excalidraw",
      message:
        "Excalidraw files are output only. Upload a plain-text plan (.sql, .txt, or similar).",
    };
  }

  if (file.size === 0) {
    return {
      ok: false,
      code: "empty",
      message: "The selected file is empty.",
    };
  }

  if (file.size > MAX_PLAN_FILE_BYTES) {
    return {
      ok: false,
      code: "too_large",
      message: "File is too large. Maximum size is 5 MB.",
    };
  }

  return null;
}

export function readPlanFileAsText(file: File): Promise<ReadPlanFileResult> {
  const validationError = validatePlanFile(file);
  if (validationError) {
    return Promise.resolve(validationError);
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      const contents = typeof reader.result === "string" ? reader.result : "";
      if (!contents.trim()) {
        resolve({
          ok: false,
          code: "empty",
          message: "The selected file is empty.",
        });
        return;
      }
      resolve({ ok: true, contents, fileName: file.name });
    };

    reader.onerror = () => {
      resolve({
        ok: false,
        code: "read_failed",
        message:
          "Could not read the file. Try another file or paste the plan instead.",
      });
    };

    reader.readAsText(file, "UTF-8");
  });
}
