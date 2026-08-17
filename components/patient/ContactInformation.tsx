import type { Patient } from "../../types/patient";

// FormField: จัดการ label, Required/Optional, hint และ error
import FormField from "../form/FormField";

// TextInput: input สำหรับ phone และ email
import TextInput from "../form/TextInput";

// TextArea: ช่องข้อความหลายบรรทัดสำหรับ Address
import TextArea from "../form/TextArea";

// SectionCard: กล่องหลักของ section
import SectionCard from "../form/SectionCard";

type FormErrors = Partial<Record<keyof Patient, string>>;

type ContactInformationProps = {
  patient: Patient;
  errors: FormErrors;
  updateField: (
    field: Exclude<keyof Patient, "emergencyContact">,
    value: string,
  ) => void;
};

export default function ContactInformation({
  patient,
  errors,
  updateField,
}: ContactInformationProps) {
  return (
    <SectionCard
      title="Contact information"
      description="How can our staff contact you?"
    >
      <div className="space-y-6">
        {/* Phone number */}
        <FormField
          label="Phone number"
          htmlFor="phoneNumber"
          required
          error={errors.phoneNumber}
          hint="The number our staff can reach you at now."
        >
          <TextInput
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="e.g. +66 81 234 5678"
            value={patient.phoneNumber}
            onChange={(event) =>
              updateField("phoneNumber", event.target.value)
            }
            aria-required="true"
            aria-invalid={Boolean(errors.phoneNumber)}
          />
        </FormField>

        {/* Email */}
        <FormField
          label="Email"
          htmlFor="email"
          required
          error={errors.email}
        >
          <TextInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={patient.email}
            onChange={(event) =>
              updateField("email", event.target.value)
            }
            aria-required="true"
            aria-invalid={Boolean(errors.email)}
          />
        </FormField>

        {/* Address */}
        <FormField
          label="Address"
          htmlFor="address"
          required
          error={errors.address}
        >
          <TextArea
            id="address"
            name="address"
            autoComplete="street-address"
            rows={4}
            value={patient.address}
            onChange={(event) =>
              updateField("address", event.target.value)
            }
            aria-required="true"
            aria-invalid={Boolean(errors.address)}
          />
        </FormField>
      </div>
    </SectionCard>
  );
}