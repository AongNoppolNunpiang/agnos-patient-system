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
import {
  ConnectionStatus,
  type ConnectionState,
} from "../../components/connection-status";

const initialStatus: PatientStatusType = "inactive";

const TOKENS = {
  ink: "#12312B",
  inkSoft: "#4B615C",
  tealDeep: "#0B4F49",
  tealMid: "#1C7A70",
  mintPale: "#EFF6F3",
  paper: "#FCFAF6",
  line: "#DDE7E2",
  lineStrong: "#C7D6D0",
};

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
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [lastPatient, setLastPatient] = useState<Patient | null>(null);
  const [viewingLastPatient, setViewingLastPatient] = useState(false);

  const [status, setStatus] =
    useState<PatientStatusType>(initialStatus);

  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionState>("connecting");

  useEffect(() => {
    const handleConnect = () => {
      setConnectionStatus("connected");
      socket.emit("staff:join");
    };

    const handleDisconnect = () => {
      setConnectionStatus("disconnected");
    };

    const handleConnectError = () => {
      setConnectionStatus("disconnected");
    };

    const handlePatientUpdate = (updatedPatient: Patient) => {
      setCurrentPatient(updatedPatient);
    };

    const handleLastPatient = (last: Patient | null) => {
      setLastPatient(last);
    };

    const handleCurrentPatient = (current: Patient | null) => {
      setCurrentPatient(current);
      setViewingLastPatient(false);
    };

    const handlePatientStatus = ({
      status: nextStatus,
    }: {
      status: PatientStatusType;
    }) => {
      setStatus(nextStatus);
    };

    socket.on("patient:update", handlePatientUpdate);
    socket.on("patient:status", handlePatientStatus);
    socket.on("patient:last", handleLastPatient);
    socket.on("patient:current", handleCurrentPatient);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("patient:update", handlePatientUpdate);
      socket.off("patient:status", handlePatientStatus);
      socket.off("patient:last", handleLastPatient);
      socket.off("patient:current", handleCurrentPatient);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();
    };
  }, []);

  const displayedPatient = viewingLastPatient
    ? lastPatient
    : currentPatient;

  const personalInformation = useMemo<InformationItem[]>(
    () => [
      {
        label: "First name",
        value: displayedPatient?.firstName,
      },
      {
        label: "Middle name",
        value: displayedPatient?.middleName,
      },
      {
        label: "Last name",
        value: displayedPatient?.lastName,
      },
      {
        label: "Date of birth",
        value: formatDate(displayedPatient?.dateOfBirth ?? ""),
      },
      {
        label: "Gender",
        value: formatGender(displayedPatient?.gender ?? ""),
      },
    ],
    [displayedPatient],
  );

  const contactInformation = useMemo<InformationItem[]>(
    () => [
      {
        label: "Phone number",
        value: displayedPatient?.phoneNumber,
      },
      {
        label: "Email",
        value: displayedPatient?.email,
      },
      {
        label: "Address",
        value: displayedPatient?.address,
        className: "md:col-span-2",
      },
    ],
    [displayedPatient],
  );

  const additionalInformation = useMemo<InformationItem[]>(
    () => [
      {
        label: "Preferred language",
        value: displayedPatient?.preferredLanguage,
      },
      {
        label: "Nationality",
        value: displayedPatient?.nationality,
      },
      {
        label: "Religion",
        value: displayedPatient?.religion,
      },
    ],
    [displayedPatient],
  );

  const emergencyContact = useMemo<InformationItem[]>(
    () => [
      {
        label: "Name",
        value: displayedPatient?.emergencyContact?.name,
      },
      {
        label: "Relationship",
        value: displayedPatient?.emergencyContact?.relationship,
      },
    ],
    [displayedPatient],
  );

  const patientName =
    [displayedPatient?.firstName, displayedPatient?.lastName]
      .filter(Boolean)
      .join(" ") || "No patient connected";

  return (
    <main
      className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 lg:py-12"
      style={{
        backgroundColor: TOKENS.mintPale,
        color: TOKENS.ink,
        fontFamily: "'IBM Plex Sans Thai', system-ui, sans-serif",
      }}
    >
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap");
      `}</style>

      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p
            className="text-sm font-semibold tracking-[0.12em]"
            style={{ color: TOKENS.tealDeep }}
          >
            AGNOS PATIENT SYSTEM
          </p>

          <h1
            className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{
              color: TOKENS.ink,
              fontFamily: "'Fraunces', Georgia, serif",
            }}
          >
            Staff view
          </h1>

          <p
            className="mt-3 max-w-2xl text-base leading-7"
            style={{ color: TOKENS.inkSoft }}
          >
            Review the latest patient information. This view is read-only.
          </p>

          <div className="mt-3">
            <ConnectionStatus status={connectionStatus} />
          </div>
        </header>

        <section
          aria-labelledby="patient-status-heading"
          className="rounded-2xl border p-5 shadow-sm sm:p-6"
          style={{
            borderColor: TOKENS.line,
            backgroundColor: TOKENS.paper,
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2
                id="patient-status-heading"
                className="text-lg font-semibold"
                style={{ color: TOKENS.ink }}
              >
                {viewingLastPatient
                  ? "Last patient information"
                  : "Current patient status"}
              </h2>

              <p
                className="mt-1 text-sm"
                style={{ color: TOKENS.inkSoft }}
              >
                {patientName}
              </p>
            </div>

            {viewingLastPatient ? (
              <div
                className="rounded-xl border px-4 py-3"
                style={{
                  borderColor: TOKENS.line,
                  backgroundColor: TOKENS.mintPale,
                }}
              >
                <p
                  className="text-sm font-semibold"
                  style={{ color: TOKENS.ink }}
                >
                  Previous patient
                </p>

                <p
                  className="mt-0.5 text-xs"
                  style={{ color: TOKENS.inkSoft }}
                >
                  This is the most recently completed patient session.
                </p>
              </div>
            ) : (
              <PatientStatus status={status} />
            )}
          </div>
        </section>

        {lastPatient && !viewingLastPatient ? (
          <button
            type="button"
            onClick={() => setViewingLastPatient(true)}
            className="mt-4 rounded-xl border-2 px-4 py-2 text-sm font-medium transition"
            style={{
              borderColor: TOKENS.lineStrong,
              backgroundColor: TOKENS.paper,
              color: TOKENS.tealDeep,
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = TOKENS.mintPale;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = TOKENS.paper;
            }}
          >
            View last patient information
          </button>
        ) : null}

        {viewingLastPatient ? (
          <button
            type="button"
            onClick={() => setViewingLastPatient(false)}
            className="mt-4 rounded-xl border-2 px-4 py-2 text-sm font-medium transition"
            style={{
              borderColor: TOKENS.lineStrong,
              backgroundColor: TOKENS.paper,
              color: TOKENS.tealDeep,
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = TOKENS.mintPale;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = TOKENS.paper;
            }}
          >
            Back to current patient
          </button>
        ) : null}

        {displayedPatient ? (
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
        ) : null}
      </div>
    </main>
  );
}
