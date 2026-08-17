import type { Patient } from "../../types/patient";

// FormField: จัดการ label, hint และ error ของแต่ละ field
import FormField from "../form/FormField";

// TextInput: ช่องกรอกชื่อและความสัมพันธ์แบบกำหนดเอง
import TextInput from "../form/TextInput";

// ChoicePills: ตัวเลือกความสัมพันธ์แบบปุ่ม pill
import ChoicePills from "../form/ChoicePills";

// SectionCard: กล่องหลักของ section
import SectionCard from "../form/SectionCard";

type EmergencyContactProps = {
  patient: Patient;

  // updateEmergencyContact:
  // ใช้แก้ข้อมูลภายใน emergencyContact
  // เช่น name และ relationship
  updateEmergencyContact: (
    field: keyof NonNullable<Patient["emergencyContact"]>,
    value: string,
  ) => void;
};

const relationshipOptions = [
  "Parent",
  "Child",
  "Spouse",
  "Relative",
  "Friend",
  "Other",
];

export default function EmergencyContact({
  patient,
  updateEmergencyContact,
}: EmergencyContactProps) {
  return (
    <SectionCard
      title="Emergency contact"
      description="Optional contact details provided by the patient."
    >
      <div className="space-y-6">
        {/* Emergency contact name */}
        <FormField
          label="Name"
          htmlFor="emergencyContactName"
          hint="Someone we can contact if needed."
        >
          <TextInput
            id="emergencyContactName"
            name="emergencyContactName"
            type="text"
            autoComplete="name"
            value={patient.emergencyContact?.name ?? ""}
            onChange={(event) =>
              updateEmergencyContact("name", event.target.value)
            }
          />
        </FormField>

        {/* Emergency contact relationship */}
        <FormField label="Relationship">
          <ChoicePills
            options={relationshipOptions}
            value={patient.emergencyContact?.relationship ?? ""}
            onChange={(value) =>
              updateEmergencyContact("relationship", value)
            }
          />
        </FormField>

        {/* Show custom relationship input when "Other" is selected */}
        {patient.emergencyContact?.relationship === "Other" ? (
          <FormField
            label="Relationship"
            htmlFor="emergencyContactRelationship"
          >
            <TextInput
              id="emergencyContactRelationship"
              name="emergencyContactRelationship"
              type="text"
              placeholder="Type the relationship"
              value={patient.emergencyContact?.relationship ?? ""}
              onChange={(event) =>
                updateEmergencyContact(
                  "relationship",
                  event.target.value,
                )
              }
            />
          </FormField>
        ) : null}
      </div>
    </SectionCard>
  );
}