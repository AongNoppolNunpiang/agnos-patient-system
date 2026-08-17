import type { Patient } from "../../types/patient";

// FormField: จัดการ label, Required/Optional, hint และ error
import FormField from "../form/FormField";

// TextInput: input สำหรับข้อมูลข้อความ
import TextInput from "../form/TextInput";

// SectionCard: กล่องหลักของ section
import SectionCard from "../form/SectionCard";

type FormErrors = Partial<Record<keyof Patient, string>>;

type AdditionalInformationProps = {
  patient: Patient;
  errors: FormErrors;
  updateField: (
    field: Exclude<keyof Patient, "emergencyContact">,
    value: string,
  ) => void;
};

export default function AdditionalInformation({
  patient,
  errors,
  updateField,
}: AdditionalInformationProps) {
  return (
    <SectionCard
      title="Additional information"
      description="A few more details about you."
    >
      <div className="space-y-6">
        {/* Preferred language */}
        <FormField
          label="Preferred language"
          htmlFor="preferredLanguage"
          required
          error={errors.preferredLanguage}
          hint="The language you are most comfortable speaking."
        >
          <TextInput
            id="preferredLanguage"
            name="preferredLanguage"
            type="text"
            autoComplete="language"
            placeholder="e.g. Thai"
            value={patient.preferredLanguage}
            onChange={(event) =>
              updateField("preferredLanguage", event.target.value)
            }
            aria-required="true"
            aria-invalid={Boolean(errors.preferredLanguage)}
          />
        </FormField>

        {/* Nationality */}
        <FormField
          label="Nationality"
          htmlFor="nationality"
          required
          error={errors.nationality}
        >
          <TextInput
            id="nationality"
            name="nationality"
            type="text"
            autoComplete="country-name"
            placeholder="e.g. Thai"
            value={patient.nationality}
            onChange={(event) =>
              updateField("nationality", event.target.value)
            }
            aria-required="true"
            aria-invalid={Boolean(errors.nationality)}
          />
        </FormField>

        {/* Religion */}
        <FormField
          label="Religion"
          htmlFor="religion"
          hint="Optional. You can skip this question."
        >
          <TextInput
            id="religion"
            name="religion"
            type="text"
            value={patient.religion ?? ""}
            onChange={(event) =>
              updateField("religion", event.target.value)
            }
          />
        </FormField>
      </div>
    </SectionCard>
  );
}