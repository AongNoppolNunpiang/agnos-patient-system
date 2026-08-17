"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { PhoneCall } from "lucide-react";

// ============================================================
// Socket / Types
// ============================================================

import { socket } from "../../lib/socket";
import type { Patient } from "../../types/patient";


// ============================================================
// Patient Components
// ============================================================

// Header:
// แสดง AGNOS, connection status และปุ่มเปลี่ยนขนาดตัวอักษร
import PatientHeader from "../../components/patient/PatientHeader";

// Progress:
// แสดง Step ปัจจุบันและ progress bar
import PatientProgress from "../../components/patient/PatientProgress";

// Step 1
import PersonalInformation from "../../components/patient/PersonalInformation";

// Step 2
import ContactInformation from "../../components/patient/ContactInformation";

// Step 3
import AdditionalInformation from "../../components/patient/AdditionalInformation";

// Step 4
import EmergencyContact from "../../components/patient/EmergencyContact";

// Step 5
import ReviewInformation from "../../components/patient/ReviewInformation";

// Bottom navigation:
// Back / Next / Confirm & Submit
import PatientNavigation from "../../components/patient/PatientNavigation";

// Help modal
import HelpModal from "../../components/patient/HelpModal";

// Submitted modal
import SubmittedModal from "../../components/patient/SubmittedModal";


// ============================================================
// Types
// ============================================================

type FormErrors = Partial<Record<keyof Patient, string>>;

type PatientField = Exclude<
  keyof Patient,
  "emergencyContact"
>;

type StepIndex = 0 | 1 | 2 | 3 | 4;


// ============================================================
// Initial Patient
// ============================================================

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


// ============================================================
// Form Configuration
// ============================================================

// Required fields ที่ใช้สำหรับ validation ตอน submit
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


// ชื่อที่ใช้แสดงใน error message
const fieldLabels: Record<
  (typeof requiredFields)[number],
  string
> = {
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


// ข้อมูลของแต่ละ Step
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


// ============================================================
// Validation
// ============================================================

// ตรวจสอบข้อมูลทั้งหมดก่อน submit
function validatePatient(
  patient: Patient,
): FormErrors {
  const errors: FormErrors = {};


  // ----------------------------------------------------------
  // Required fields
  // ----------------------------------------------------------

  for (const field of requiredFields) {
    if (!patient[field].trim()) {
      errors[field] =
        `${fieldLabels[field]} is required.`;
    }
  }


  // ----------------------------------------------------------
  // Email
  // ----------------------------------------------------------

  const email = patient.email.trim();

  if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.email =
      "Enter a valid email address.";
  }


  // ----------------------------------------------------------
  // Phone number
  // ----------------------------------------------------------

  const phoneNumber =
    patient.phoneNumber.trim();

  const phoneDigits =
    phoneNumber.replace(/\D/g, "");

  if (
    phoneNumber &&
    (
      !/^[0-9+().\-\s]+$/.test(phoneNumber) ||
      phoneDigits.length < 7
    )
  ) {
    errors.phoneNumber =
      "Enter a valid phone number.";
  }


  return errors;
}


// ============================================================
// Patient Session
// ============================================================

// ดึง session ID ของ patient จาก sessionStorage
function getPatientSessionId() {
  const storageKey =
    "agnos-patient-session-id";

  let sessionId =
    sessionStorage.getItem(storageKey);

  if (!sessionId) {
    sessionId =
      crypto.randomUUID();

    sessionStorage.setItem(
      storageKey,
      sessionId,
    );
  }

  return sessionId;
}


// ============================================================
// Patient Page
// ============================================================

export default function PatientPage() {

  // ==========================================================
  // Patient Form State
  // ==========================================================

  const [patient, setPatient] =
    useState<Patient>(initialPatient);

  const [errors, setErrors] =
    useState<FormErrors>({});


  // ==========================================================
  // Submit State
  // ==========================================================

  const [isSubmitted, setIsSubmitted] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");


  // ==========================================================
  // Socket State
  // ==========================================================

  const [isSocketConnected, setIsSocketConnected] =
    useState(false);

  const [connectionStatus, setConnectionStatus] =
    useState<
      "connecting" |
      "connected" |
      "disconnected"
    >("connecting");

  const [isPatientRestored, setIsPatientRestored] =
    useState(false);


  // ==========================================================
  // Navigation State
  // ==========================================================

  const [currentStep, setCurrentStep] =
    useState<StepIndex>(0);


  // ==========================================================
  // UI State
  // ==========================================================

  const [largeText, setLargeText] =
    useState(true);

  const [showHelpMessage, setShowHelpMessage] =
    useState(false);


  // ==========================================================
  // Create New Patient Session
  // ==========================================================

  function handleNewForm() {

    // สร้าง session ใหม่
    const newSessionId =
      crypto.randomUUID();


    // บันทึก session ใหม่
    sessionStorage.setItem(
      "agnos-patient-session-id",
      newSessionId,
    );


    // --------------------------------------------------------
    // Reset patient form
    // --------------------------------------------------------

    setPatient(initialPatient);


    // --------------------------------------------------------
    // Reset validation
    // --------------------------------------------------------

    setErrors({});


    // --------------------------------------------------------
    // Reset submit error
    // --------------------------------------------------------

    setSubmitError("");


    // --------------------------------------------------------
    // Reset submit state
    // --------------------------------------------------------

    setIsSubmitted(false);


    // --------------------------------------------------------
    // Session ใหม่ถือว่า restore เสร็จแล้ว
    // --------------------------------------------------------

    setIsPatientRestored(true);


    // --------------------------------------------------------
    // กลับไป Step 1
    // --------------------------------------------------------

    setCurrentStep(0);


    // --------------------------------------------------------
    // ปิด Help
    // --------------------------------------------------------

    setShowHelpMessage(false);


    // --------------------------------------------------------
    // แจ้ง server ว่าเริ่ม session ใหม่
    // --------------------------------------------------------

    socket.emit(
      "patient:new-session",
      newSessionId,
    );
  }


  // ==========================================================
  // Socket Connection
  // ==========================================================

  useEffect(() => {

    // ดึง session ปัจจุบัน
    const sessionId =
      getPatientSessionId();


    // --------------------------------------------------------
    // Socket Connected
    // --------------------------------------------------------

    function handleConnect() {

      setIsSocketConnected(true);

      setConnectionStatus(
        "connected",
      );


      // Join patient session
      socket.emit(
        "patient:join",
        sessionId,
      );
    }


    // --------------------------------------------------------
    // Socket Disconnected
    // --------------------------------------------------------

    function handleDisconnect() {

      setIsSocketConnected(false);

      setConnectionStatus(
        "disconnected",
      );
    }


    // --------------------------------------------------------
    // Socket Connection Error
    // --------------------------------------------------------

    function handleConnectError() {

      setIsSocketConnected(false);

      setConnectionStatus(
        "disconnected",
      );
    }


    // --------------------------------------------------------
    // Restore Patient
    // --------------------------------------------------------

    function handlePatientRestore({
      patient: restoredPatient,
      status,
    }: {
      patient: Patient | null;
      status:
        | "inactive"
        | "actively-filling"
        | "submitted";
    }) {

      // ถ้ามีข้อมูลเก่า
      // ให้ restore กลับเข้า form
      if (restoredPatient) {
        setPatient(
          restoredPatient,
        );
      }


      // ตรวจสอบว่า form submit แล้วหรือไม่
      setIsSubmitted(
        status === "submitted",
      );


      // restore session เสร็จแล้ว
      setIsPatientRestored(true);


      // ถ้า submit แล้ว
      // ให้ไปหน้า Review
      if (status === "submitted") {
        setCurrentStep(4);
      }
    }


    // --------------------------------------------------------
    // Register Socket Events
    // --------------------------------------------------------

    socket.on(
      "connect",
      handleConnect,
    );

    socket.on(
      "disconnect",
      handleDisconnect,
    );

    socket.on(
      "connect_error",
      handleConnectError,
    );

    socket.on(
      "patient:restore",
      handlePatientRestore,
    );


    // --------------------------------------------------------
    // Connect
    // --------------------------------------------------------

    if (socket.connected) {

      handleConnect();

    } else {

      socket.connect();

    }


    // --------------------------------------------------------
    // Cleanup
    // --------------------------------------------------------

    return () => {

      socket.off(
        "connect",
        handleConnect,
      );

      socket.off(
        "disconnect",
        handleDisconnect,
      );

      socket.off(
        "connect_error",
        handleConnectError,
      );

      socket.off(
        "patient:restore",
        handlePatientRestore,
      );

      socket.disconnect();
    };

  }, []);


  // ==========================================================
  // Send Patient Updates
  // ==========================================================

  useEffect(() => {

    // ยังไม่พร้อมส่งข้อมูล
    if (
      !isSocketConnected ||
      !isPatientRestored ||
      isSubmitted
    ) {
      return;
    }


    // ส่งข้อมูล patient ไป server
    // ทุกครั้งที่ patient state เปลี่ยน
    socket.emit(
      "patient:update",
      patient,
    );

  }, [
    isSocketConnected,
    isPatientRestored,
    isSubmitted,
    patient,
  ]);


  // ==========================================================
  // Update Normal Patient Field
  // ==========================================================

  function updateField(
    field: PatientField,
    value: string,
  ) {

    setPatient(
      (currentPatient) => ({
        ...currentPatient,
        [field]: value,
      }),
    );


    // --------------------------------------------------------
    // ลบ error ของ field ที่กำลังแก้
    // --------------------------------------------------------

    setErrors(
      (currentErrors) => {

        const {
          [field]: removedError,
          ...remainingErrors
        } = currentErrors;

        void removedError;

        return remainingErrors;
      },
    );


    // --------------------------------------------------------
    // เมื่อแก้ข้อมูล
    // ถือว่ายังไม่ได้ submit
    // --------------------------------------------------------

    setIsSubmitted(false);

    setSubmitError("");
  }


  // ==========================================================
  // Update Emergency Contact
  // ==========================================================

  function updateEmergencyContact(
    field: keyof NonNullable<
      Patient["emergencyContact"]
    >,
    value: string,
  ) {

    setPatient(
      (currentPatient) => ({
        ...currentPatient,

        emergencyContact: {
          name:
            currentPatient
              .emergencyContact
              ?.name ?? "",

          relationship:
            currentPatient
              .emergencyContact
              ?.relationship ?? "",

          [field]: value,
        },
      }),
    );


    setIsSubmitted(false);

    setSubmitError("");
  }


  // ==========================================================
  // Submit Patient Form
  // ==========================================================

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {

    event.preventDefault();


    // --------------------------------------------------------
    // Validate form
    // --------------------------------------------------------

    const validationErrors =
      validatePatient(patient);

    setErrors(validationErrors);

    setSubmitError("");


    const isValid =
      Object.keys(
        validationErrors,
      ).length === 0;


    // --------------------------------------------------------
    // Validation Failed
    // --------------------------------------------------------

    if (!isValid) {

      // หา field แรกที่มี error
      const firstErrorField =
        requiredFields.find(
          (field) =>
            validationErrors[field],
        );


      if (firstErrorField) {

        // ----------------------------------------------------
        // Personal information
        // ----------------------------------------------------

        if (
          [
            "firstName",
            "lastName",
            "dateOfBirth",
            "gender",
          ].includes(firstErrorField)
        ) {

          setCurrentStep(0);


        // ----------------------------------------------------
        // Contact information
        // ----------------------------------------------------

        } else if (
          [
            "phoneNumber",
            "email",
            "address",
          ].includes(firstErrorField)
        ) {

          setCurrentStep(1);


        // ----------------------------------------------------
        // Additional information
        // ----------------------------------------------------

        } else {

          setCurrentStep(2);

        }
      }


      setIsSubmitted(false);

      return;
    }


    // --------------------------------------------------------
    // Socket Not Connected
    // --------------------------------------------------------

    if (!isSocketConnected) {

      setIsSubmitted(false);

      setSubmitError(
        "Your information could not be submitted because the connection is unavailable. Please wait for the connection to return and try again.",
      );

      return;
    }


    // --------------------------------------------------------
    // Submit
    // --------------------------------------------------------

    socket.emit(
      "patient:submit",
      patient,
    );


    setIsSubmitted(true);

    setCurrentStep(4);
  }


  // ==========================================================
  // Navigation
  // ==========================================================

  function nextStep() {

    setCurrentStep(
      (current) =>
        Math.min(
          current + 1,
          4,
        ) as StepIndex,
    );
  }


  function previousStep() {

    setCurrentStep(
      (current) =>
        Math.max(
          current - 1,
          0,
        ) as StepIndex,
    );
  }


  // ==========================================================
  // Review Summary
  // ==========================================================

  const summaryRows = useMemo(
    () => [
      {
        label: "First name",
        value:
          patient.firstName ||
          "Not provided",
        step: 0 as StepIndex,
      },

      {
        label: "Middle name",
        value:
          patient.middleName ||
          "Not provided",
        step: 0 as StepIndex,
      },

      {
        label: "Last name",
        value:
          patient.lastName ||
          "Not provided",
        step: 0 as StepIndex,
      },

      {
        label: "Date of birth",
        value:
          patient.dateOfBirth ||
          "Not provided",
        step: 0 as StepIndex,
      },

      {
        label: "Gender",
        value:
          patient.gender ||
          "Not provided",
        step: 0 as StepIndex,
      },

      {
        label: "Phone number",
        value:
          patient.phoneNumber ||
          "Not provided",
        step: 1 as StepIndex,
      },

      {
        label: "Email",
        value:
          patient.email ||
          "Not provided",
        step: 1 as StepIndex,
      },

      {
        label: "Address",
        value:
          patient.address ||
          "Not provided",
        step: 1 as StepIndex,
      },

      {
        label: "Preferred language",
        value:
          patient.preferredLanguage ||
          "Not provided",
        step: 2 as StepIndex,
      },

      {
        label: "Nationality",
        value:
          patient.nationality ||
          "Not provided",
        step: 2 as StepIndex,
      },

      {
        label: "Religion",
        value:
          patient.religion ||
          "Not provided",
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
            .join(" · ") ||
          "Not provided",
        step: 3 as StepIndex,
      },
    ],
    [patient],
  );


  // ==========================================================
  // Progress
  // ==========================================================

  const progress =
    ((currentStep + 1) /
      steps.length) *
    100;


  // ==========================================================
  // Render
  // ==========================================================

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: "#EFF6F3",
        color: "#12312B",
        fontFamily:
          "'IBM Plex Sans Thai', system-ui, sans-serif",
        fontSize:
          largeText
            ? "18px"
            : "16px",
      }}
    >

      {/* =====================================================
          Global Fonts
          ===================================================== */}

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap");
      `}</style>


      {/* =====================================================
          Patient Header
          ===================================================== */}

      <PatientHeader
        connectionStatus={
          connectionStatus
        }
        largeText={largeText}
        onToggleTextSize={() =>
          setLargeText(
            (current) => !current,
          )
        }
      />


      {/* =====================================================
          Main Content
          ===================================================== */}

      <div className="mx-auto max-w-3xl px-4 pb-32 pt-6 sm:px-6 sm:pt-8">

        {/* ---------------------------------------------------
            Page Introduction
            --------------------------------------------------- */}

        <header className="mb-6">

          <p
            className="text-sm font-semibold tracking-[0.12em]"
            style={{
              color: "#0B4F49",
            }}
          >
            AGNOS PATIENT SYSTEM
          </p>


          <h1
            className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{
              color: "#12312B",
              fontFamily:
                "'Fraunces', Georgia, serif",
            }}
          >
            Patient information form
          </h1>


          <p
            className="mt-3 max-w-2xl text-base leading-7"
            style={{
              color: "#4B615C",
            }}
          >
            Please provide your information
            step by step. Required fields
            are marked clearly.
          </p>

        </header>


        {/* ===================================================
            Progress
            =================================================== */}

        <PatientProgress
          currentStep={currentStep}
          totalSteps={steps.length}
          title={
            steps[currentStep].title
          }
          progress={progress}
        />


        {/* ===================================================
            Form
            =================================================== */}

        <form
          noValidate
          onSubmit={handleSubmit}
        >

          {/* -------------------------------------------------
              Submit Error
              ------------------------------------------------- */}

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


          {/* =================================================
              Step 1
              Personal Information
              ================================================= */}

          {currentStep === 0 ? (
            <PersonalInformation
              patient={patient}
              errors={errors}
              updateField={
                updateField
              }
            />
          ) : null}


          {/* =================================================
              Step 2
              Contact Information
              ================================================= */}

          {currentStep === 1 ? (
            <ContactInformation
              patient={patient}
              errors={errors}
              updateField={
                updateField
              }
            />
          ) : null}


          {/* =================================================
              Step 3
              Additional Information
              ================================================= */}

          {currentStep === 2 ? (
            <AdditionalInformation
              patient={patient}
              errors={errors}
              updateField={
                updateField
              }
            />
          ) : null}


          {/* =================================================
              Step 4
              Emergency Contact
              ================================================= */}

          {currentStep === 3 ? (
            <EmergencyContact
              patient={patient}
              updateEmergencyContact={
                updateEmergencyContact
              }
            />
          ) : null}


          {/* =================================================
              Step 5
              Review Information
              ================================================= */}

          {currentStep === 4 ? (
            <ReviewInformation
              summaryRows={
                summaryRows
              }
              hasErrors={
                Object.keys(
                  errors,
                ).length > 0
              }
              onEdit={(step) =>
                setCurrentStep(step)
              }
            />
          ) : null}


          {/* -------------------------------------------------
              Step Description
              ------------------------------------------------- */}

          <div className="mt-6 flex items-center justify-between">

            <p
              className="text-sm"
              style={{
                color: "#4B615C",
              }}
            >
              {
                steps[currentStep]
                  .description
              }
            </p>

          </div>

        </form>

      </div>


      {/* =====================================================
          Bottom Navigation + Help
          ===================================================== */}

      {!isSubmitted ? (
        <>
          {/* -------------------------------------------------
              Help Button
              ------------------------------------------------- */}

          <button
            type="button"
            onClick={() =>
              setShowHelpMessage(true)
            }
            className="fixed bottom-24 right-4 z-20 flex items-center gap-2 rounded-full px-4 py-3 font-semibold text-white shadow-lg"
            style={{
              backgroundColor:
                "#E2664A",
            }}
          >
            <PhoneCall className="h-5 w-5" />
            Help
          </button>


          {/* -------------------------------------------------
              Bottom Navigation
              ------------------------------------------------- */}

          <PatientNavigation
            currentStep={
              currentStep
            }
            onPrevious={
              previousStep
            }
            onNext={nextStep}
            onSubmit={() => {

              const form =
                document.querySelector(
                  "form",
                );


              if (
                form instanceof
                HTMLFormElement
              ) {
                form.requestSubmit();
              }

            }}
          />
        </>
      ) : null}


      {/* =====================================================
          Submitted Modal
          ===================================================== */}

      {isSubmitted ? (
        <SubmittedModal
          onNewForm={
            handleNewForm
          }
        />
      ) : null}


      {/* =====================================================
          Help Modal
          ===================================================== */}

      {showHelpMessage ? (
        <HelpModal
          onClose={() =>
            setShowHelpMessage(false)
          }
        />
      ) : null}

    </main>
  );
}