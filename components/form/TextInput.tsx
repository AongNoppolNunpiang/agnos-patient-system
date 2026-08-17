import type { InputHTMLAttributes } from "react";

// TextInput: input กลางของระบบ
// รองรับ text, date, email, tel และ input type อื่น ๆ
// โดยรับ props จาก HTML input ได้โดยตรง

const TOKENS = {
  ink: "#12312B",
  paper: "#FCFAF6",
  line: "#DDE7E2",
  tealMid: "#1C7A70",
};

export default function TextInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border-2 px-4 py-4 outline-none transition ${className}`}
      style={{
        borderColor: TOKENS.line,
        backgroundColor: TOKENS.paper,
        color: TOKENS.ink,
        fontSize: "1.05em",
      }}
      onFocus={(event) => {
        event.currentTarget.style.borderColor = TOKENS.tealMid;
        event.currentTarget.style.boxShadow =
          `0 0 0 4px ${TOKENS.tealMid}22`;
      }}
      onBlur={(event) => {
        event.currentTarget.style.borderColor = TOKENS.line;
        event.currentTarget.style.boxShadow = "none";
      }}
    />
  );
}