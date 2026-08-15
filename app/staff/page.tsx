import {
  PatientInformationSection,
  type InformationItem,
} from "../../components/staff/patient-information-section";
import {
  PatientStatus,
  type PatientStatusType,
} from "../../components/staff/patient-status";
import type { Patient } from "../../types/patient";

const mockPatient: Patient = {
  firstName: "Maya",
  middleName: "Lin",
  lastName: "Chen",
  dateOfBirth: "1996-03-18",
  gender: "female",
  phoneNumber: "+66 81 234 5678",
  email: "maya.chen@example.com",
  address: "88 Sukhumvit Road, Watthana, Bangkok 10110",
  preferredLanguage: "Thai",
  nationality: "Thai",
  religion: "Buddhist",
  emergencyContact: {
    name: "David Chen",
    relationship: "Parent",
  },
};

const mockStatus: PatientStatusType = "actively-filling";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatGender(gender: string) {
  return gender.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const personalInformation: InformationItem[] = [
  { label: "First name", value: mockPatient.firstName },
  { label: "Middle name", value: mockPatient.middleName },
  { label: "Last name", value: mockPatient.lastName },
  { label: "Date of birth", value: formatDate(mockPatient.dateOfBirth) },
  { label: "Gender", value: formatGender(mockPatient.gender) },
];

const contactInformation: InformationItem[] = [
  { label: "Phone number", value: mockPatient.phoneNumber },
  { label: "Email", value: mockPatient.email },
  {
    label: "Address",
    value: mockPatient.address,
    className: "md:col-span-2",
  },
];

const additionalInformation: InformationItem[] = [
  { label: "Preferred language", value: mockPatient.preferredLanguage },
  { label: "Nationality", value: mockPatient.nationality },
  { label: "Religion", value: mockPatient.religion },
];

const emergencyContact: InformationItem[] = [
  { label: "Name", value: mockPatient.emergencyContact?.name },
  { label: "Relationship", value: mockPatient.emergencyContact?.relationship },
];

export default function StaffPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="text-sm font-semibold tracking-wide text-sky-700">
            AGNOS PATIENT SYSTEM
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Staff view
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Review the latest patient information. This view is read-only.
          </p>
        </header>

        <section
          aria-labelledby="patient-status-heading"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2
                id="patient-status-heading"
                className="text-lg font-semibold text-slate-900"
              >
                Current patient status
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {mockPatient.firstName} {mockPatient.lastName}
              </p>
            </div>
            <PatientStatus status={mockStatus} />
          </div>
        </section>

        <div className="mt-6 space-y-6">
          <PatientInformationSection
            id="personal-information"
            title="Personal information"
            items={personalInformation}
          />
          <PatientInformationSection
            id="contact-information"
            title="Contact information"
            items={contactInformation}
          />
          <PatientInformationSection
            id="additional-information"
            title="Additional information"
            items={additionalInformation}
          />
          <PatientInformationSection
            id="emergency-contact"
            title="Emergency contact"
            description="Optional contact details provided by the patient."
            items={emergencyContact}
          />
        </div>
      </div>
    </main>
  );
}
