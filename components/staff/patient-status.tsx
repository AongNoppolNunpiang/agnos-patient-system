export type PatientStatusType =
  | "inactive"
  | "actively-filling"
  | "submitted";

const statusDetails: Record<
  PatientStatusType,
  { label: string; description: string; className: string; dotClassName: string }
> = {
  inactive: {
    label: "Inactive",
    description: "The patient is not currently updating the form.",
    className: "border-slate-200 bg-slate-50 text-slate-700",
    dotClassName: "bg-slate-400",
  },
  "actively-filling": {
    label: "Actively filling in",
    description: "The patient is currently completing the form.",
    className: "border-sky-200 bg-sky-50 text-sky-800",
    dotClassName: "bg-sky-600",
  },
  submitted: {
    label: "Submitted",
    description: "The patient has submitted the form.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dotClassName: "bg-emerald-600",
  },
};

export function PatientStatus({ status }: { status: PatientStatusType }) {
  const details = statusDetails[status];

  return (
    <div
      role="status"
      aria-label={`Patient status: ${details.label}`}
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${details.className}`}
    >
      <span
        aria-hidden="true"
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${details.dotClassName}`}
      />
      <div>
        <p className="text-sm font-semibold">{details.label}</p>
        <p className="mt-0.5 text-xs opacity-80">{details.description}</p>
      </div>
    </div>
  );
}
