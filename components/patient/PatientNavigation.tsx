import {
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type StepIndex = 0 | 1 | 2 | 3 | 4;

type PatientNavigationProps = {
  currentStep: StepIndex;

  // ไป step ถัดไป
  onNext: () => void;

  // กลับไป step ก่อนหน้า
  onPrevious: () => void;

  // ส่งข้อมูล patient
  // page.tsx จะเป็นคนจัดการ validation และ socket
  onSubmit: () => void;
};

const TOKENS = {
  ink: "#12312B",
  tealDeep: "#0B4F49",
  mintPale: "#EFF6F3",
  paper: "#FCFAF6",
  line: "#DDE7E2",
};

export default function PatientNavigation({
  currentStep,
  onNext,
  onPrevious,
  onSubmit,
}: PatientNavigationProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-20 border-t px-4 py-3"
      style={{
        borderColor: TOKENS.line,
        backgroundColor: `${TOKENS.mintPale}F7`,
      }}
    >
      <div className="mx-auto flex max-w-3xl gap-3">
        {/* Back button */}
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={onPrevious}
            className="flex min-w-0 flex-1 items-center justify-center gap-1 rounded-xl border-2 px-4 py-4 font-semibold sm:flex-none"
            style={{
              borderColor: TOKENS.line,
              backgroundColor: TOKENS.paper,
              color: TOKENS.ink,
            }}
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </button>
        ) : null}

        {/* Next / Submit button */}
        {currentStep < 4 ? (
          <button
            type="button"
            onClick={onNext}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl px-5 py-4 font-semibold text-white"
            style={{
              backgroundColor: TOKENS.tealDeep,
            }}
          >
            Next
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-4 font-semibold text-white"
            style={{
              backgroundColor: TOKENS.tealDeep,
            }}
          >
            <Check className="h-5 w-5" />
            Confirm & Submit
          </button>
        )}
      </div>
    </div>
  );
}