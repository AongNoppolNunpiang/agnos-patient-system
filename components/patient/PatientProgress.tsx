// PatientProgress:
// แสดงความคืบหน้าของฟอร์ม เช่น
// Step 1 of 5
// Personal information
// 20%
// และ progress bar

type PatientProgressProps = {
  // ลำดับ step ปัจจุบัน
  currentStep: number;

  // จำนวน step ทั้งหมด
  totalSteps: number;

  // ชื่อของ step ปัจจุบัน
  title: string;

  // เปอร์เซ็นต์ความคืบหน้า
  progress: number;
};

const TOKENS = {
  ink: "#12312B",
  inkSoft: "#4B615C",
  tealDeep: "#0B4F49",
  tealMid: "#1C7A70",
  paper: "#FCFAF6",
  line: "#DDE7E2",
};

export default function PatientProgress({
  currentStep,
  totalSteps,
  title,
  progress,
}: PatientProgressProps) {
  return (
    <section
      className="mb-6 rounded-2xl border p-4 shadow-sm sm:p-5"
      style={{
        borderColor: TOKENS.line,
        backgroundColor: TOKENS.paper,
      }}
      aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          {/* Current step number */}
          <p
            className="text-sm font-semibold"
            style={{
              color: TOKENS.tealDeep,
            }}
          >
            Step {currentStep + 1} of {totalSteps}
          </p>

          {/* Current step title */}
          <p
            className="mt-1 font-semibold"
            style={{
              color: TOKENS.ink,
            }}
          >
            {title}
          </p>
        </div>

        {/* Progress percentage */}
        <p
          className="text-right text-sm"
          style={{
            color: TOKENS.inkSoft,
          }}
        >
          {Math.round(progress)}%
        </p>
      </div>

      {/* Progress bar */}
      <div
        className="mt-4 h-2.5 overflow-hidden rounded-full"
        style={{
          backgroundColor: TOKENS.line,
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            backgroundColor: TOKENS.tealMid,
          }}
        />
      </div>
    </section>
  );
}