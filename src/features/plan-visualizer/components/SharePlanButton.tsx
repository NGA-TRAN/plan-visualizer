import { useEffect, useRef, useState } from "react";
import { Link } from "lucide-react";
import { Button, Modal } from "@/shared/components";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { createSharedPlanLink } from "../utils/sharePlan";

type PreparedLink = { plan: string; link?: string; error?: string };

export function SharePlanButton({ plan }: { plan: string }) {
  const [prepared, setPrepared] = useState<PreparedLink | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [manualLink, setManualLink] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { notify } = useNotifications();

  useEffect(() => {
    if (!plan.trim()) return;
    let cancelled = false;
    // Prepare before the click so clipboard access retains user activation,
    // including in Safari. Debounce edits to avoid compressing every keystroke.
    const timer = window.setTimeout(() => {
      createSharedPlanLink(plan).then(
        (link) => {
          if (!cancelled) setPrepared({ plan, link });
        },
        (error: unknown) => {
          if (!cancelled)
            setPrepared({
              plan,
              error:
                error instanceof Error
                  ? error.message
                  : "Could not create a share link.",
            });
        },
      );
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [plan]);

  const ready = prepared?.plan === plan;
  const handleShare = async () => {
    if (!ready || !prepared) return;
    if (!prepared.link) {
      notify.error(prepared.error ?? "Could not create a share link.");
      return;
    }
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(prepared.link);
      notify.success("Plan link copied!");
    } catch {
      setManualLink(prepared.link);
    } finally {
      setIsCopying(false);
    }
  };

  const close = () => {
    setManualLink(null);
    buttonRef.current?.focus();
  };

  return (
    <>
      <Button
        ref={buttonRef}
        type="button"
        variant="secondary"
        onClick={handleShare}
        disabled={!plan.trim() || !ready}
        isLoading={isCopying}
        title="Copy a link that opens this plan as a diagram"
        leftIcon={<Link className="h-4 w-4" aria-hidden="true" />}
        className="flex-1 sm:flex-none"
      >
        Share
      </Button>
      <Modal
        isOpen={manualLink !== null}
        onClose={close}
        title="Copy plan link"
        description="Your browser could not copy automatically. Copy the selected link below."
      >
        <input
          aria-label="Plan share link"
          readOnly
          value={manualLink ?? ""}
          ref={(input) => {
            if (input) {
              input.focus();
              input.select();
            }
          }}
          onFocus={(event) => event.currentTarget.select()}
          className="w-full rounded border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
      </Modal>
    </>
  );
}
