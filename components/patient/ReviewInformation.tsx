import { Pencil } from "lucide-react";

import SectionCard from "../form/SectionCard";

type StepIndex = 0 | 1 | 2 | 3 | 4;

type SummaryRow = {
  label: string;
  value: string;
  step: StepIndex;
};

type ReviewInformationProps = {
  summaryRows: SummaryRow[];

  // onEdit: บอก page.tsx ว่าผู้ใช้ต้องการย้อนกลับไปแก้ step ไหน
  onEdit: (step: StepIndex) => void;

  // hasErrors: มีข้อมูลที่จำเป็นไม่ครบหรือไม่
  hasErrors: boolean;
};

export default function ReviewInformation({
  summaryRows,
  onEdit,
  hasErrors,
}: ReviewInformationProps) {
  return (
    <SectionCard
      title="Review your information"
      description="Please check your information before submitting."
    >
      {/* Patient information summary */}
      <div
        className="overflow-hidden rounded-xl border-2"
        style={{
          borderColor: "#DDE7E2",
          backgroundColor: "#FCFAF6",
        }}
      >
        {summaryRows.map((row, index) => (
          <div
            key={row.label}
            className={`flex items-start justify-between gap-4 px-4 py-4 ${
              index !== summaryRows.length - 1 ? "border-b" : ""
            }`}
            style={{
              borderColor: "#DDE7E2",
            }}
          >
            {/* Field information */}
            <div className="min-w-0">
              <p
                className="text-sm"
                style={{ color: "#4B615C" }}
              >
                {row.label}
              </p>

              <p
                className="mt-1 break-words font-medium"
                style={{ color: "#12312B" }}
              >
                {row.value}
              </p>
            </div>

            {/* Edit button */}
            <button
              type="button"
              onClick={() => onEdit(row.step)}
              className="flex shrink-0 items-center gap-1.5 rounded-full border-2 px-3 py-2 text-sm font-semibold"
              style={{
                borderColor: "#DDE7E2",
                color: "#0B4F49",
                backgroundColor: "#FCFAF6",
              }}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          </div>
        ))}
      </div>

      {/* Validation warning */}
      {hasErrors ? (
        <div
          className="mt-5 rounded-xl border px-4 py-4 text-sm"
          style={{
            borderColor: "#F2C7BD",
            backgroundColor: "#FFF4F1",
            color: "#8D3020",
          }}
        >
          Some required information is missing. Please use the Edit
          buttons above to complete it before submitting.
        </div>
      ) : null}
    </SectionCard>
  );
}