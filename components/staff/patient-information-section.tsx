export interface InformationItem {
  label: string;
  value?: string;
  className?: string;
}

interface PatientInformationSectionProps {
  id: string;
  title: string;
  description?: string;
  items: InformationItem[];
}

export function PatientInformationSection({
  id,
  title,
  description,
  items,
}: PatientInformationSectionProps) {
  return (
    <section
      aria-labelledby={id}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5">
        <h2 id={id} className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        ) : null}
      </div>

      <dl className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className={`rounded-lg bg-slate-50 px-4 py-3 ${item.className ?? ""}`}
          >
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {item.label}
            </dt>
            <dd className="mt-1 break-words text-sm font-medium text-slate-900">
              {item.value || "Not provided"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
