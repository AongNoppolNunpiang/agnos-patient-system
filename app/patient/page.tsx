"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import type { Patient } from "../../types/patient";

type FormErrors = Partial<Record<keyof Patient, string>>;

type PatientField = Exclude<keyof Patient, "emergencyContact">;

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

function FormSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="border-t border-slate-200 pt-8">
      <div className="mb-6">
        <h2 id={id} className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function FormField({
  label,
  htmlFor,
  required = false,
  error,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-800"
      >
        {label}
        <span
          className={
            required
              ? "text-rose-600"
              : "text-xs font-normal text-slate-500"
          }
        >
          {required ? "Required" : "Optional"}
        </span>
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-2 text-sm text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:ring-3 focus:ring-sky-100";

export default function PatientPage() {
  const [patient, setPatient] = useState<Patient>(initialPatient);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

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
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validatePatient(patient);
    setErrors(validationErrors);
    setIsSubmitted(Object.keys(validationErrors).length === 0);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="text-sm font-semibold tracking-wide text-sky-700">
            AGNOS PATIENT SYSTEM
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Patient information form
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Please provide your information below. Fields marked as required are
            needed to complete the form.
          </p>
        </header>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        >
          {isSubmitted ? (
            <div
              role="status"
              aria-live="polite"
              className="mb-8 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            >
              Your information has been submitted successfully.
            </div>
          ) : null}

          <div className="space-y-8">
            <FormSection id="personal-information" title="Personal information">
              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  label="First name"
                  htmlFor="firstName"
                  required
                  error={errors.firstName}
                >
                  <input
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
                    aria-describedby={
                      errors.firstName ? "firstName-error" : undefined
                    }
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Middle name" htmlFor="middleName">
                  <input
                    id="middleName"
                    name="middleName"
                    type="text"
                    autoComplete="additional-name"
                    value={patient.middleName ?? ""}
                    onChange={(event) =>
                      updateField("middleName", event.target.value)
                    }
                    className={inputClassName}
                  />
                </FormField>

                <FormField
                  label="Last name"
                  htmlFor="lastName"
                  required
                  error={errors.lastName}
                >
                  <input
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
                    aria-describedby={errors.lastName ? "lastName-error" : undefined}
                    className={inputClassName}
                  />
                </FormField>

                <FormField
                  label="Date of birth"
                  htmlFor="dateOfBirth"
                  required
                  error={errors.dateOfBirth}
                >
                  <input
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
                    aria-describedby={
                      errors.dateOfBirth ? "dateOfBirth-error" : undefined
                    }
                    className={inputClassName}
                  />
                </FormField>

                <FormField
                  label="Gender"
                  htmlFor="gender"
                  required
                  error={errors.gender}
                >
                  <select
                    id="gender"
                    name="gender"
                    autoComplete="sex"
                    value={patient.gender}
                    onChange={(event) => updateField("gender", event.target.value)}
                    aria-required="true"
                    aria-invalid={Boolean(errors.gender)}
                    aria-describedby={errors.gender ? "gender-error" : undefined}
                    className={inputClassName}
                  >
                    <option value="">Select gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </FormField>
              </div>
            </FormSection>

            <FormSection id="contact-information" title="Contact information">
              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  label="Phone number"
                  htmlFor="phoneNumber"
                  required
                  error={errors.phoneNumber}
                >
                  <input
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
                    aria-describedby={
                      errors.phoneNumber ? "phoneNumber-error" : undefined
                    }
                    className={inputClassName}
                  />
                </FormField>

                <FormField
                  label="Email"
                  htmlFor="email"
                  required
                  error={errors.email}
                >
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={patient.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    aria-required="true"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={inputClassName}
                  />
                </FormField>

                <FormField
                  label="Address"
                  htmlFor="address"
                  required
                  error={errors.address}
                  className="md:col-span-2"
                >
                  <textarea
                    id="address"
                    name="address"
                    autoComplete="street-address"
                    rows={3}
                    value={patient.address}
                    onChange={(event) => updateField("address", event.target.value)}
                    aria-required="true"
                    aria-invalid={Boolean(errors.address)}
                    aria-describedby={errors.address ? "address-error" : undefined}
                    className={`${inputClassName} resize-y`}
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection id="additional-information" title="Additional information">
              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  label="Preferred language"
                  htmlFor="preferredLanguage"
                  required
                  error={errors.preferredLanguage}
                >
                  <input
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
                    aria-describedby={
                      errors.preferredLanguage
                        ? "preferredLanguage-error"
                        : undefined
                    }
                    className={inputClassName}
                  />
                </FormField>

                <FormField
                  label="Nationality"
                  htmlFor="nationality"
                  required
                  error={errors.nationality}
                >
                  <input
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
                    aria-describedby={
                      errors.nationality ? "nationality-error" : undefined
                    }
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Religion" htmlFor="religion">
                  <input
                    id="religion"
                    name="religion"
                    type="text"
                    value={patient.religion ?? ""}
                    onChange={(event) => updateField("religion", event.target.value)}
                    className={inputClassName}
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection
              id="emergency-contact"
              title="Emergency contact"
              description="This information is optional."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <FormField label="Name" htmlFor="emergencyContactName">
                  <input
                    id="emergencyContactName"
                    name="emergencyContactName"
                    type="text"
                    autoComplete="name"
                    value={patient.emergencyContact?.name ?? ""}
                    onChange={(event) =>
                      updateEmergencyContact("name", event.target.value)
                    }
                    className={inputClassName}
                  />
                </FormField>

                <FormField
                  label="Relationship"
                  htmlFor="emergencyContactRelationship"
                >
                  <input
                    id="emergencyContactRelationship"
                    name="emergencyContactRelationship"
                    type="text"
                    placeholder="e.g. Parent"
                    value={patient.emergencyContact?.relationship ?? ""}
                    onChange={(event) =>
                      updateEmergencyContact("relationship", event.target.value)
                    }
                    className={inputClassName}
                  />
                </FormField>
              </div>
            </FormSection>
          </div>

          <div className="mt-8 flex justify-end border-t border-slate-200 pt-6">
            <button
              type="submit"
              className="w-full rounded-lg bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-800 focus:outline-none focus:ring-3 focus:ring-sky-200 sm:w-auto"
            >
              Submit information
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
