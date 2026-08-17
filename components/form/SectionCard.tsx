import { type ReactNode } from "react";

// SectionCard: กล่อง layout สำหรับแต่ละ section ของฟอร์ม
// เช่น Personal Information, Contact Information และ Review

const TOKENS = {
  ink: "#12312B",
  inkSoft: "#4B615C",
  paper: "#FCFAF6",
  line: "#DDE7E2",
};

type SectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function SectionCard({
  title,
  description,
  children,
}: SectionCardProps) {
  return (
    <section
      className="rounded-2xl border p-5 shadow-sm sm:p-6"
      style={{
        borderColor: TOKENS.line,
        backgroundColor: TOKENS.paper,
      }}
    >
      <div className="mb-6">
        <h2
          className="text-xl font-semibold"
          style={{
            color: TOKENS.ink,
            fontFamily: "'Fraunces', Georgia, serif",
          }}
        >
          {title}
        </h2>

        {description ? (
          <p
            className="mt-1 text-sm leading-6"
            style={{ color: TOKENS.inkSoft }}
          >
            {description}
          </p>
        ) : null}
      </div>

      {children}
    </section>
  );
}