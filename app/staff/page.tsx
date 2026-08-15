"use client";

import { useEffect, useMemo, useState } from "react";

import {
  PatientInformationSection,
  type InformationItem,
} from "../../components/staff/patient-information-section";
import {
  PatientStatus,
  type PatientStatusType,
} from "../../components/staff/patient-status";
import { socket } from "../../lib/socket";
import type { Patient } from "../../types/patient";

const initialPatient: Patient = {
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  phoneNumber: "",
  email: "",
  address: "",
  preferredLanguage: "",
  nationality: "",
  emergencyContact: {
    name: "",
    relationship: "",
  },
  religion: "",
};

const initialStatus: PatientStatusType = "inactive";

function formatDate(date: string) {
  if (!date) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatGender(gender: string) {
  if (!gender) {
    return "Not provided";
  }

  return gender
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function StaffPage() {
  const [patient, setPatient] = useState<Patient>(initialPatient);
  const [status, setStatus] = useState<PatientStatusType>(initialStatus);

  useEffect(() => {
  const handlePatientUpdate = (updatedPatient: Patient) => {
    setPatient(updatedPatient);
  };

  const handlePatientStatus = ({
    status: nextStatus,
  }: {
    status: PatientStatusType;
  }) => {
    setStatus(nextStatus);
  };

  const handleConnect = () => {
    socket.emit("staff:join");
  };

  socket.on("patient:update", handlePatientUpdate);
  socket.on("patient:status", handlePatientStatus);
  socket.on("connect", handleConnect);

  if (socket.connected) {
    handleConnect();
  } else {
    socket.connect();
  }

  return () => {
    socket.off("patient:update", handlePatientUpdate);
    socket.off("patient:status", handlePatientStatus);
    socket.off("connect", handleConnect);
    socket.disconnect();
  };
}, []);

  const personalInformation = useMemo<InformationItem[]>(
    () => [
      { label: "First name", value: patient.firstName },
      { label: "Middle name", value: patient.middleName },
      { label: "Last name", value: patient.lastName },
      {
        label: "Date of birth",
        value: formatDate(patient.dateOfBirth),
      },
      {
        label: "Gender",
        value: formatGender(patient.gender),
      },
    ],
    [patient],
  );

  const contactInformation = useMemo<InformationItem[]>(
    () => [
      {
        label: "Phone number",
        value: patient.phoneNumber,
      },
      {
        label: "Email",
        value: patient.email,
      },
      {
        label: "Address",
        value: patient.address,
        className: "md:col-span-2",
      },
    ],
    [patient],
  );

  const additionalInformation = useMemo<InformationItem[]>(
    () => [
      {
        label: "Preferred language",
        value: patient.preferredLanguage,
      },
      {
        label: "Nationality",
        value: patient.nationality,
      },
      {
        label: "Religion",
        value: patient.religion,
      },
    ],
    [patient],
  );

  const emergencyContact = useMemo<InformationItem[]>(
    () => [
      {
        label: "Name",
        value: patient.emergencyContact?.name,
      },
      {
        label: "Relationship",
        value: patient.emergencyContact?.relationship,
      },
    ],
    [patient],
  );

  const patientName =
    [patient.firstName, patient.lastName].filter(Boolean).join(" ") ||
    "No patient connected";

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
                {patientName}
              </p>
            </div>

            <PatientStatus status={status} />
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