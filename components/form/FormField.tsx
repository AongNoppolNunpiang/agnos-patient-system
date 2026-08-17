import { type ReactNode } from "react";

// FormField: จัดการ label, Required/Optional, hint และ error
// ใช้เป็น wrapper กลางสำหรับทุก field ในฟอร์ม

const TOKENS = {
  ink: "#12312B",
  inkSoft: "#4B615C",
};

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export default function FormField({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block font-semibold leading-snug"
        style={{ color: TOKENS.ink }}
      >
        {label}

        <span
          className="ml-2 text-sm font-normal"
          style={{ color: TOKENS.inkSoft }}
        >
          {required ? "Required" : "Optional"}
        </span>
      </label>

      {hint ? (
        <p
          className="mb-2 text-sm leading-6"
          style={{ color: TOKENS.inkSoft }}
        >
          {hint}
        </p>
      ) : null}

      {children}

      {error ? (
        <p
          className="mt-2 text-sm font-medium text-rose-600"
          id={htmlFor ? `${htmlFor}-error` : undefined}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}