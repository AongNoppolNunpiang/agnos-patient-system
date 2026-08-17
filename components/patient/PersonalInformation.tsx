import type { Patient } from "../../types/patient";

// FormField: จัดการ label, Required/Optional, hint และ error
import FormField from "../form/FormField";

// TextInput: input สำหรับ text, date และ input type ต่าง ๆ
import TextInput from "../form/TextInput";

// ChoicePills: ตัวเลือกแบบปุ่ม เช่น Gender
import ChoicePills from "../form/ChoicePills";

// SectionCard: กล่องหลักที่ครอบ section นี้
import SectionCard from "../form/SectionCard";

type FormErrors = Partial<Record<keyof Patient, string>>;

type PersonalInformationProps = {
  patient: Patient;
  errors: FormErrors;
  updateField: (
    field: Exclude<keyof Patient, "emergencyContact">,
    value: string,
  ) => void;
};

const genderOptions = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
  { value: "other", label: "Other" },
];

export default function PersonalInformation({
  patient,
  errors,
  updateField,
}: PersonalInformationProps) {
  return (
    <SectionCard
      title="Personal information"
      description="Tell us a little about yourself."
    >
      <div className="space-y-6">
        {/* First name */}
        <FormField
          label="First name"
          htmlFor="firstName"
          required
          error={errors.firstName}
        >
          <TextInput
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            value={patient.firstName}
            onChange={(event) =>
              updateField("firstName", event.target.value)
            }
            aria-required="true"
            aria-invalid={Boolean(errors.firstName)}
            placeholder="e.g. John"
          />
        </FormField>

        {/* Middle name */}
        <FormField
          label="Middle name"
          htmlFor="middleName"
          hint="You can skip this if you do not have one."
        >
          <TextInput
            id="middleName"
            name="middleName"
            type="text"
            autoComplete="additional-name"
            value={patient.middleName ?? ""}
            onChange={(event) =>
              updateField("middleName", event.target.value)
            }
          />
        </FormField>

        {/* Last name */}
        <FormField
          label="Last name"
          htmlFor="lastName"
          required
          error={errors.lastName}
        >
          <TextInput
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            value={patient.lastName}
            onChange={(event) =>
              updateField("lastName", event.target.value)
            }
            aria-required="true"
            aria-invalid={Boolean(errors.lastName)}
            placeholder="e.g. Smith"
          />
        </FormField>

        {/* Date of birth */}
        <FormField
          label="Date of birth"
          htmlFor="dateOfBirth"
          required
          error={errors.dateOfBirth}
          hint="Tap the field to choose your date of birth."
        >
          <TextInput
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            autoComplete="bday"
            value={patient.dateOfBirth}
            onChange={(event) =>
              updateField("dateOfBirth", event.target.value)
            }
            aria-required="true"
            aria-invalid={Boolean(errors.dateOfBirth)}
          />
        </FormField>

        {/* Gender */}
        <FormField
          label="Gender"
          htmlFor="gender"
          required
          error={errors.gender}
        >
          <ChoicePills
            options={genderOptions}
            value={patient.gender}
            onChange={(value) => updateField("gender", value)}
          />
        </FormField>
      </div>
    </SectionCard>
  );
}