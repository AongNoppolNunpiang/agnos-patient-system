// ChoicePills: ตัวเลือกแบบปุ่ม pill
// ใช้สำหรับ Gender, Emergency Contact Relationship
// รองรับทั้ง options แบบ string[] และ { value, label }[]

const TOKENS = {
  ink: "#12312B",
  paper: "#FCFAF6",
  line: "#DDE7E2",
  tealDeep: "#0B4F49",
};

type ChoiceOption =
  | string
  | {
      value: string;
      label: string;
    };

type ChoicePillsProps = {
  options: ChoiceOption[];
  value: string;
  onChange: (value: string) => void;
};

export default function ChoicePills({
  options,
  value,
  onChange,
}: ChoicePillsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        // รองรับทั้ง string และ object
        const item =
          typeof option === "string"
            ? {
                value: option,
                label: option,
              }
            : option;

        const active = value === item.value;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className="rounded-full border-2 px-5 py-3 font-medium transition"
            style={{
              borderColor: active ? TOKENS.tealDeep : TOKENS.line,
              backgroundColor: active ? TOKENS.tealDeep : TOKENS.paper,
              color: active ? "#fff" : TOKENS.ink,
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}