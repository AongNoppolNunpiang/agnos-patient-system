"use client";

import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  PhoneCall,
  Type,
  X,
} from "lucide-react";

import { socket } from "../../lib/socket";
import type { Patient } from "../../types/patient";
import {
  ConnectionStatus,
  type ConnectionState,
} from "../../components/connection-status";

type FormErrors = Partial<Record<keyof Patient, string>>;
type PatientField = Exclude<keyof Patient, "emergencyContact">;

type StepIndex = 0 | 1 | 2 | 3 | 4;

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

const requiredFields = [
  "firstName",
  "lastName",
  "dateOfBirth",
  "gender",
  "phoneNumber",
  "email",
  "address",
  "preferredLanguage",
  "nationality",
] as const;

const fieldLabels: Record<(typeof requiredFields)[number], string> = {
  firstName: "First name",
  lastName: "Last name",
  dateOfBirth: "Date of birth",
  gender: "Gender",
  phoneNumber: "Phone number",
  email: "Email",
  address: "Address",
  preferredLanguage: "Preferred language",
  nationality: "Nationality",
};

const steps = [
  {
    title: "Personal information",
    description: "Tell us a little about yourself.",
  },
  {
    title: "Contact information",
    description: "How can our staff contact you?",
  },
  {
    title: "Additional information",
    description: "A few more details about you.",
  },
  {
    title: "Emergency contact",
    description: "Someone we can contact if needed.",
  },
  {
    title: "Review your information",
    description: "Please check your information before submitting.",
  },
] as const;

const genderOptions = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
  { value: "other", label: "Other" },
];

const relationshipOptions = [
  "Parent",
  "Child",
  "Spouse",
  "Relative",
  "Friend",
  "Other",
];

const TOKENS = {
  ink: "#12312B",
  inkSoft: "#4B615C",
  tealDeep: "#0B4F49",
  tealMid: "#1C7A70",
  mintPale: "#EFF6F3",
  paper: "#FCFAF6",
  line: "#DDE7E2",
  coral: "#E2664A",
};

function validatePatient(patient: Patient): FormErrors {
  const errors: FormErrors = {};

  for (const field of requiredFields) {
    if (!patient[field].trim()) {
      errors[field] = `${fieldLabels[field]} is required.`;
    }
  }

  const email = patient.email.trim();

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  const phoneNumber = patient.phoneNumber.trim();
  const phoneDigits = phoneNumber.replace(/\D/g, "");

  if (
    phoneNumber &&
    (!/^[0-9+().\-\s]+$/.test(phoneNumber) || phoneDigits.length < 7)
  ) {
    errors.phoneNumber = "Enter a valid phone number.";
  }

  return errors;
}

function getPatientSessionId() {
  const storageKey = "agnos-patient-session-id";

  let sessionId = sessionStorage.getItem(storageKey);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(storageKey, sessionId);
  }

  return sessionId;
}

function FormField({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block font-semibold leading-snug"
        style={{ color: TOKENS.ink }}
      >
        {label}
        <span
          className="ml-2 text-sm font-normal"
          style={{ color: TOKENS.inkSoft }}
        >
          {required ? "Required" : "Optional"}
        </span>
      </label>

      {hint ? (
        <p
          className="mb-2 text-sm leading-6"
          style={{ color: TOKENS.inkSoft }}
        >
          {hint}
        </p>
      ) : null}

      {children}

      {error ? (
        <p
          className="mt-2 text-sm font-medium text-rose-600"
          id={htmlFor ? `${htmlFor}-error` : undefined}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function TextInput({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
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
        event.currentTarget.style.boxShadow = `0 0 0 4px ${TOKENS.tealMid}22`;
      }}
      onBlur={(event) => {
        event.currentTarget.style.borderColor = TOKENS.line;
        event.currentTarget.style.boxShadow = "none";
      }}
    />
  );
}

function TextArea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
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

function ChoicePills({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[] | string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const item =
          typeof option === "string"
            ? { value: option, label: option }
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

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      className="rounded-2xl border p-5 shadow-sm sm:p-6"
      style={{
        borderColor: TOKENS.line,
        backgroundColor: TOKENS.paper,
      }}
    >
      <div className="mb-6">
        <h2
          className="text-xl font-semibold"
          style={{
            color: TOKENS.ink,
            fontFamily: "'Fraunces', Georgia, serif",
          }}
        >
          {title}
        </h2>

        {description ? (
          <p
            className="mt-1 text-sm leading-6"
            style={{ color: TOKENS.inkSoft }}
          >
            {description}
          </p>
        ) : null}
      </div>

      {children}
    </section>
  );
}

export default function PatientPage() {
  const [patient, setPatient] = useState<Patient>(initialPatient);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionState>("connecting");
  const [submitError, setSubmitError] = useState("");
  const [isPatientRestored, setIsPatientRestored] = useState(false);
  const [currentStep, setCurrentStep] = useState<StepIndex>(0);
  const [largeText, setLargeText] = useState(true);
  const [showHelpMessage, setShowHelpMessage] = useState(false);

  const handleNewForm = () => {
    const newSessionId = crypto.randomUUID();

    sessionStorage.setItem("agnos-patient-session-id", newSessionId);

    setPatient(initialPatient);
    setErrors({});
    setSubmitError("");
    setIsSubmitted(false);
    setIsPatientRestored(true);
    setCurrentStep(0);
    setShowHelpMessage(false);

    socket.emit("patient:new-session", newSessionId);
  };

  useEffect(() => {
    const sessionId = getPatientSessionId();

    function handleConnect() {
      setIsSocketConnected(true);
      setConnectionStatus("connected");
      socket.emit("patient:join", sessionId);
    }

    function handleDisconnect() {
      setIsSocketConnected(false);
      setConnectionStatus("disconnected");
    }

    function handleConnectError() {
      setIsSocketConnected(false);
      setConnectionStatus("disconnected");
    }

    function handlePatientRestore({
      patient: restoredPatient,
      status,
    }: {
      patient: Patient | null;
      status: "inactive" | "actively-filling" | "submitted";
    }) {
      if (restoredPatient) {
        setPatient(restoredPatient);
      }

      setIsSubmitted(status === "submitted");
      setIsPatientRestored(true);

      if (status === "submitted") {
        setCurrentStep(4);
      }
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("patient:restore", handlePatientRestore);

    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("patient:restore", handlePatientRestore);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isSocketConnected || !isPatientRestored || isSubmitted) {
      return;
    }

    socket.emit("patient:update", patient);
  }, [isSocketConnected, isPatientRestored, isSubmitted, patient]);

  function updateField(field: PatientField, value: string) {
    setPatient((currentPatient) => ({
      ...currentPatient,
      [field]: value,
    }));

    setErrors((currentErrors) => {
      const { [field]: removedError, ...remainingErrors } = currentErrors;
      void removedError;
      return remainingErrors;
    });

    setIsSubmitted(false);
    setSubmitError("");
  }

  function updateEmergencyContact(
    field: keyof NonNullable<Patient["emergencyContact"]>,
    value: string,
  ) {
    setPatient((currentPatient) => ({
      ...currentPatient,
      emergencyContact: {
        name: currentPatient.emergencyContact?.name ?? "",
        relationship: currentPatient.emergencyContact?.relationship ?? "",
        [field]: value,
      },
    }));

    setIsSubmitted(false);
    setSubmitError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validatePatient(patient);
    setErrors(validationErrors);
    setSubmitError("");

    const isValid = Object.keys(validationErrors).length === 0;

    if (!isValid) {
      const firstErrorField = requiredFields.find(
        (field) => validationErrors[field],
      );

      if (firstErrorField) {
        if (
          ["firstName", "lastName", "dateOfBirth", "gender"].includes(
            firstErrorField,
          )
        ) {
          setCurrentStep(0);
        } else if (
          ["phoneNumber", "email", "address"].includes(firstErrorField)
        ) {
          setCurrentStep(1);
        } else {
          setCurrentStep(2);
        }
      }

      setIsSubmitted(false);
      return;
    }

    if (!isSocketConnected) {
      setIsSubmitted(false);
      setSubmitError(
        "Your information could not be submitted because the connection is unavailable. Please wait for the connection to return and try again.",
      );
      return;
    }

    socket.emit("patient:submit", patient);
    setIsSubmitted(true);
    setCurrentStep(4);
  }

  function nextStep() {
    setCurrentStep((current) =>
      Math.min(current + 1, 4) as StepIndex,
    );
  }

  function previousStep() {
    setCurrentStep((current) =>
      Math.max(current - 1, 0) as StepIndex,
    );
  }

  const summaryRows = useMemo(
    () => [
      {
        label: "First name",
        value: patient.firstName || "Not provided",
        step: 0 as StepIndex,
      },
      {
        label: "Middle name",
        value: patient.middleName || "Not provided",
        step: 0 as StepIndex,
      },
      {
        label: "Last name",
        value: patient.lastName || "Not provided",
        step: 0 as StepIndex,
      },
      {
        label: "Date of birth",
        value: patient.dateOfBirth || "Not provided",
        step: 0 as StepIndex,
      },
      {
        label: "Gender",
        value: patient.gender || "Not provided",
        step: 0 as StepIndex,
      },
      {
        label: "Phone number",
        value: patient.phoneNumber || "Not provided",
        step: 1 as StepIndex,
      },
      {
        label: "Email",
        value: patient.email || "Not provided",
        step: 1 as StepIndex,
      },
      {
        label: "Address",
        value: patient.address || "Not provided",
        step: 1 as StepIndex,
      },
      {
        label: "Preferred language",
        value: patient.preferredLanguage || "Not provided",
        step: 2 as StepIndex,
      },
      {
        label: "Nationality",
        value: patient.nationality || "Not provided",
        step: 2 as StepIndex,
      },
      {
        label: "Religion",
        value: patient.religion || "Not provided",
        step: 2 as StepIndex,
      },
      {
        label: "Emergency contact",
        value:
          [
            patient.emergencyContact?.name,
            patient.emergencyContact?.relationship,
          ]
            .filter(Boolean)
            .join(" · ") || "Not provided",
        step: 3 as StepIndex,
      },
    ],
    [patient],
  );

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: TOKENS.mintPale,
        color: TOKENS.ink,
        fontFamily: "'IBM Plex Sans Thai', system-ui, sans-serif",
        fontSize: largeText ? "18px" : "16px",
      }}
    >
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap");
      `}</style>

      <div className="sticky top-0 z-30 border-b backdrop-blur">
        <div
          className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6"
          style={{
            backgroundColor: `${TOKENS.mintPale}F2`,
            borderColor: TOKENS.line,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: TOKENS.tealDeep }}
            >
              A
            </div>

            <div>
              <p
                className="font-semibold leading-none"
                style={{ color: TOKENS.ink }}
              >
                AGNOS
              </p>
              <p
                className="mt-1 text-xs"
                style={{ color: TOKENS.inkSoft }}
              >
                Patient information
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ConnectionStatus status={connectionStatus} />

            <button
              type="button"
              onClick={() => setLargeText((current) => !current)}
              className="flex items-center gap-1.5 rounded-full border-2 px-3 py-2 font-semibold"
              style={{
                borderColor: TOKENS.line,
                backgroundColor: TOKENS.paper,
                color: TOKENS.ink,
              }}
              aria-label="Change text size"
              aria-pressed={largeText}
            >
              <Type className="h-4 w-4" />
              <span className="text-sm">ก</span>
              <span className="text-base">ก</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-32 pt-6 sm:px-6 sm:pt-8">
        <header className="mb-6">
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
            Patient information form
          </h1>

          <p
            className="mt-3 max-w-2xl text-base leading-7"
            style={{ color: TOKENS.inkSoft }}
          >
            Please provide your information step by step. Required fields
            are marked clearly.
          </p>
        </header>

        <section
          className="mb-6 rounded-2xl border p-4 shadow-sm sm:p-5"
          style={{
            borderColor: TOKENS.line,
            backgroundColor: TOKENS.paper,
          }}
          aria-label={`Step ${currentStep + 1} of ${steps.length}`}
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: TOKENS.tealDeep }}
              >
                Step {currentStep + 1} of {steps.length}
              </p>

              <p
                className="mt-1 font-semibold"
                style={{ color: TOKENS.ink }}
              >
                {steps[currentStep].title}
              </p>
            </div>

            <p
              className="text-right text-sm"
              style={{ color: TOKENS.inkSoft }}
            >
              {Math.round(progress)}%
            </p>
          </div>

          <div
            className="mt-4 h-2.5 overflow-hidden rounded-full"
            style={{ backgroundColor: TOKENS.line }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: TOKENS.tealMid,
              }}
            />
          </div>
        </section>

        <form noValidate onSubmit={handleSubmit}>
          {submitError ? (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-6 rounded-xl border px-4 py-4 text-sm leading-6"
              style={{
                borderColor: "#F2C7BD",
                backgroundColor: "#FFF4F1",
                color: "#8D3020",
              }}
            >
              {submitError}
            </div>
          ) : null}

          {currentStep === 0 ? (
            <SectionCard
              title="Personal information"
              description="Tell us a little about yourself."
            >
              <div className="space-y-6">
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
          ) : null}

          {currentStep === 1 ? (
            <SectionCard
              title="Contact information"
              description="How can our staff contact you?"
            >
              <div className="space-y-6">
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
          ) : null}

          {currentStep === 2 ? (
            <SectionCard
              title="Additional information"
              description="A few more details about you."
            >
              <div className="space-y-6">
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
          ) : null}

          {currentStep === 3 ? (
            <SectionCard
              title="Emergency contact"
              description="Optional contact details provided by the patient."
            >
              <div className="space-y-6">
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

                <FormField label="Relationship">
                  <ChoicePills
                    options={relationshipOptions}
                    value={patient.emergencyContact?.relationship ?? ""}
                    onChange={(value) =>
                      updateEmergencyContact("relationship", value)
                    }
                  />
                </FormField>

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
          ) : null}

          {currentStep === 4 ? (
            <SectionCard
              title="Review your information"
              description="Please check your information before submitting."
            >
              <div
                className="overflow-hidden rounded-xl border-2"
                style={{
                  borderColor: TOKENS.line,
                  backgroundColor: TOKENS.paper,
                }}
              >
                {summaryRows.map((row, index) => (
                  <div
                    key={row.label}
                    className={`flex items-start justify-between gap-4 px-4 py-4 ${
                      index !== summaryRows.length - 1 ? "border-b" : ""
                    }`}
                    style={{
                      borderColor: TOKENS.line,
                    }}
                  >
                    <div className="min-w-0">
                      <p
                        className="text-sm"
                        style={{ color: TOKENS.inkSoft }}
                      >
                        {row.label}
                      </p>
                      <p
                        className="mt-1 break-words font-medium"
                        style={{ color: TOKENS.ink }}
                      >
                        {row.value}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(row.step)}
                      className="flex shrink-0 items-center gap-1.5 rounded-full border-2 px-3 py-2 text-sm font-semibold"
                      style={{
                        borderColor: TOKENS.line,
                        color: TOKENS.tealDeep,
                        backgroundColor: TOKENS.paper,
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                  </div>
                ))}
              </div>

              {Object.keys(errors).length > 0 ? (
                <div
                  className="mt-5 rounded-xl border px-4 py-4 text-sm"
                  style={{
                    borderColor: "#F2C7BD",
                    backgroundColor: "#FFF4F1",
                    color: "#8D3020",
                  }}
                >
                  Some required information is missing. Please use the Edit
                  buttons above to complete it before submitting.
                </div>
              ) : null}
            </SectionCard>
          ) : null}

          <div className="mt-6 flex items-center justify-between">
            <p
              className="text-sm"
              style={{ color: TOKENS.inkSoft }}
            >
              {steps[currentStep].description}
            </p>
          </div>
        </form>
      </div>

      {!isSubmitted ? (
        <>
          <button
            type="button"
            onClick={() => setShowHelpMessage(true)}
            className="fixed bottom-24 right-4 z-20 flex items-center gap-2 rounded-full px-4 py-3 font-semibold text-white shadow-lg"
            style={{ backgroundColor: TOKENS.coral }}
          >
            <PhoneCall className="h-5 w-5" />
            Help
          </button>

          <div
            className="fixed inset-x-0 bottom-0 z-20 border-t px-4 py-3"
            style={{
              borderColor: TOKENS.line,
              backgroundColor: `${TOKENS.mintPale}F7`,
            }}
          >
            <div className="mx-auto flex max-w-3xl gap-3">
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={previousStep}
                  className="flex min-w-0 flex-1 items-center justify-center gap-1 rounded-xl border-2 px-4 py-4 font-semibold sm:flex-none"
                  style={{
                    borderColor: TOKENS.line,
                    backgroundColor: TOKENS.paper,
                    color: TOKENS.ink,
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                  Back
                </button>
              ) : null}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex flex-1 items-center justify-center gap-1 rounded-xl px-5 py-4 font-semibold text-white"
                  style={{ backgroundColor: TOKENS.tealDeep }}
                >
                  Next
                  <ChevronRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  form=""
                  onClick={(event) => {
                    event.preventDefault();
                    const form = event.currentTarget.closest("main")?.querySelector("form");

                    if (form instanceof HTMLFormElement) {
                      form.requestSubmit();
                    }
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-4 font-semibold text-white"
                  style={{ backgroundColor: TOKENS.tealDeep }}
                >
                  <Check className="h-5 w-5" />
                  Confirm & Submit
                </button>
              )}
            </div>
          </div>
        </>
      ) : null}

      {isSubmitted ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="submitted-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4"
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl sm:p-8"
            style={{
              backgroundColor: TOKENS.paper,
              color: TOKENS.ink,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: `${TOKENS.tealMid}1A`,
                    color: TOKENS.tealDeep,
                  }}
                >
                  <Check className="h-6 w-6" />
                </div>

                <div>
                  <h2
                    id="submitted-title"
                    className="text-xl font-semibold"
                  >
                    Information submitted
                  </h2>

                  <p
                    className="mt-2 text-sm leading-6"
                    style={{ color: TOKENS.inkSoft }}
                  >
                    Your information has been submitted successfully.
                    You can no longer edit this form.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(true);
                }}
                className="rounded-full p-2"
                style={{ color: TOKENS.inkSoft }}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleNewForm}
              className="mt-6 w-full rounded-xl px-5 py-4 font-semibold text-white"
              style={{ backgroundColor: TOKENS.tealDeep }}
            >
              Fill out a new form
            </button>
          </div>
        </div>
      ) : null}

      {showHelpMessage ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/30 px-4 pb-28 sm:items-center sm:pb-0"
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-xl"
            style={{
              backgroundColor: TOKENS.paper,
              color: TOKENS.ink,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Need help?
                </h2>
                <p
                  className="mt-2 text-sm leading-6"
                  style={{ color: TOKENS.inkSoft }}
                >
                  This button is reserved for requesting assistance from
                  staff. The help workflow is not connected yet.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowHelpMessage(false)}
                className="rounded-full p-2"
                style={{ color: TOKENS.inkSoft }}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpMessage(false)}
              className="mt-5 w-full rounded-xl border-2 px-5 py-3 font-semibold"
              style={{
                borderColor: TOKENS.line,
                color: TOKENS.ink,
                backgroundColor: TOKENS.paper,
              }}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
