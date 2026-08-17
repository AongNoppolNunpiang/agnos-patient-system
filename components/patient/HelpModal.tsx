import { X } from "lucide-react";

// HelpModal: แสดงหน้าต่างแจ้งเตือนเมื่อผู้ป่วยกดปุ่ม Help

type HelpModalProps = {
  // ใช้ปิด modal
  onClose: () => void;
};

const TOKENS = {
  ink: "#12312B",
  inkSoft: "#4B615C",
  paper: "#FCFAF6",
  line: "#DDE7E2",
};

export default function HelpModal({
  onClose,
}: HelpModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/30 px-4 pb-28 sm:items-center sm:pb-0"
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-xl"
        style={{
          backgroundColor: TOKENS.paper,
          color: TOKENS.ink,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="help-title"
              className="text-xl font-semibold"
            >
              Need help?
            </h2>

            <p
              className="mt-2 text-sm leading-6"
              style={{ color: TOKENS.inkSoft }}
            >
              This button is reserved for requesting assistance from
              staff. The help workflow is not connected yet.
            </p>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2"
            style={{ color: TOKENS.inkSoft }}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Close action */}
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl border-2 px-5 py-3 font-semibold"
          style={{
            borderColor: TOKENS.line,
            color: TOKENS.ink,
            backgroundColor: TOKENS.paper,
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}