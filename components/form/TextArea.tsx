import type { TextareaHTMLAttributes } from "react";

// TextArea: textarea กลางของระบบ
// ใช้สำหรับข้อมูลที่เป็นข้อความหลายบรรทัด เช่น Address

const TOKENS = {
  ink: "#12312B",
  paper: "#FCFAF6",
  line: "#DDE7E2",
};

export default function TextArea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full resize-y rounded-xl border-2 px-4 py-4 outline-none transition ${className}`}
      style={{
        borderColor: TOKENS.line,
        backgroundColor: TOKENS.paper,
        color: TOKENS.ink,
        fontSize: "1.05em",
      }}
    />
  );
}