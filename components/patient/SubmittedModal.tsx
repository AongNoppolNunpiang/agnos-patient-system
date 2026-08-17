import { Check, X } from "lucide-react";

// SubmittedModal: แสดงข้อความหลังผู้ป่วยส่งข้อมูลสำเร็จ

type SubmittedModalProps = {
  // สร้าง session ใหม่และเริ่มกรอกข้อมูลใหม่
  onNewForm: () => void;

  // ปัจจุบันปุ่ม X เดิมไม่ได้ปิด modal
  // จึงไม่จำเป็นต้องมี onClose
};

const TOKENS = {
  ink: "#12312B",
  inkSoft: "#4B615C",
  tealDeep: "#0B4F49",
  tealMid: "#1C7A70",
  paper: "#FCFAF6",
};

export default function SubmittedModal({
  onNewForm,
}: SubmittedModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="submitted-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4"
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl sm:p-8"
        style={{
          backgroundColor: TOKENS.paper,
          color: TOKENS.ink,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Success icon */}
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: `${TOKENS.tealMid}1A`,
                color: TOKENS.tealDeep,
              }}
            >
              <Check className="h-6 w-6" />
            </div>

            <div>
              <h2
                id="submitted-title"
                className="text-xl font-semibold"
              >
                Information submitted
              </h2>

              <p
                className="mt-2 text-sm leading-6"
                style={{ color: TOKENS.inkSoft }}
              >
                Your information has been submitted successfully.
                You can no longer edit this form.
              </p>
            </div>
          </div>

          {/* Close button
              คง behavior เดิมไว้:
              กดแล้วไม่ได้ปิด modal */}
          <button
            type="button"
            onClick={() => {}}
            className="rounded-full p-2"
            style={{ color: TOKENS.inkSoft }}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Start a new patient form */}
        <button
          type="button"
          onClick={onNewForm}
          className="mt-6 w-full rounded-xl px-5 py-4 font-semibold text-white"
          style={{
            backgroundColor: TOKENS.tealDeep,
          }}
        >
          Fill out a new form
        </button>
      </div>
    </div>
  );
}