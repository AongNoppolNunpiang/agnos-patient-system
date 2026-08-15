# AGNOS Patient System

A real-time patient information system designed to allow patients to complete their personal information through a simple multi-step form while staff can monitor the patient's information and status in real time.

The system focuses on usability, responsive design, real-time communication, and a clear separation between the patient-facing form and the staff monitoring view.

---

## Project Overview

The AGNOS Patient System consists of two main interfaces:

### Patient View

A mobile-friendly multi-step form that allows patients to:

- Enter personal information
- Enter contact information
- Provide additional information
- Provide emergency contact information
- Review their information before submission
- Submit the completed form
- Start a new patient session after submission
- Adjust text size for better readability

The interface is designed to be simple and accessible, including for users who may not be familiar with digital forms.

### Staff View

A read-only dashboard that allows staff to:

- Monitor the current patient's information
- See the patient's current form status in real time
- View the most recently completed patient
- Switch between the current and previous patient
- Monitor the Socket.IO connection status

---

## Features

### Patient Form

- 5-step wizard form
- Step-by-step progress indicator
- Form validation
- Large and accessible input controls
- Mobile responsive layout
- Text size adjustment
- Simple and user-friendly wording
- Tap-based selection for commonly used options
- Gender selection with multiple options
- Emergency contact relationship selection
- Custom relationship input
- Review information before submission
- Confirmation before submitting
- Fixed bottom navigation actions
- New patient session reset

### Staff Monitoring

- Real-time patient information updates
- Current patient status
- Previous patient information
- Read-only patient information
- Connection status indicator
- Automatic session recovery after a short browser refresh
- Responsive staff interface

### Real-time Communication

The system uses Socket.IO to synchronize patient information between the patient and staff interfaces.

Patient updates are sent to the Socket.IO server and broadcast to connected staff clients.

The system also supports:

- Patient session identification
- Patient status synchronization
- Patient submission events
- Previous patient tracking
- New patient sessions
- Browser refresh recovery

---

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Real-time Communication

- Socket.IO
- Socket.IO Client

### Runtime / Server

- Node.js
- TypeScript
- `tsx`

### Deployment

- Vercel — Frontend
- Render — Socket.IO server

### Development Tools

- Git
- GitHub
- Visual Studio Code

---

## System Architecture

The application is separated into a frontend application and a real-time Socket.IO server.

```text
                  ┌─────────────────────┐
                  │       Patient       │
                  │   Next.js / React   │
                  └──────────┬──────────┘
                             │
                             │ Socket.IO
                             ▼
                  ┌─────────────────────┐
                  │    Socket.IO Server │
                  │       Node.js       │
                  │       Render        │
                  └──────────┬──────────┘
                             │
                             │ Socket.IO
                             ▼
                  ┌─────────────────────┐
                  │        Staff        │
                  │   Next.js / React   │
                  └─────────────────────┘
```

The frontend is deployed on Vercel, while the Socket.IO server runs separately on Render.

The production frontend connects to the Render Socket.IO server through the `NEXT_PUBLIC_SOCKET_URL` environment variable.

---

## Real-time Communication Flow

### Patient Joins

When a patient opens the patient form, the client creates or restores a patient session and sends:

```text
patient:join
```

The Socket.IO server stores the patient's socket ID and session ID.

---

### Patient Updates Information

As the patient fills in the form, patient information is sent to the server using:

```text
patient:update
```

The server verifies that the update comes from the active patient socket, stores the current patient information, and broadcasts the update to connected staff clients.

```text
Patient
   │
   │ patient:update
   ▼
Socket.IO Server
   │
   │ patient:update
   ▼
Staff
```

This allows staff to see the patient's information while the form is being completed.

---

### Patient Submits

When the patient completes the form:

```text
patient:submit
```

is sent to the server.

The server changes the patient status to:

```text
submitted
```

and broadcasts:

```text
patient:update
patient:status
```

to staff clients.

---

### New Patient Session

After completing a form, the patient can select:

```text
Fill out a new form
```

The client starts a new session using:

```text
patient:new-session
```

The previous patient is stored as the last patient.

The staff view receives:

```text
patient:current
patient:last
patient:status
```

This allows staff to continue monitoring the new patient while still being able to access the previous patient's information.

---

## Patient Status

The system uses three patient states:

```text
inactive
actively-filling
submitted
```

### `inactive`

No active patient session is connected.

### `actively-filling`

A patient is currently completing the form.

### `submitted`

The patient has completed and submitted the form.

The status is synchronized between the patient and staff interfaces through Socket.IO.

---

## Session Recovery

The system includes a short reconnection window to handle browser refreshes.

When the patient browser is refreshed:

```text
Old Socket disconnects
        ↓
Server waits briefly
        ↓
New Socket connects
        ↓
Same session ID is detected
        ↓
Existing patient data is restored
```

This prevents the patient's information from being immediately cleared during a normal browser refresh.

If the patient does not reconnect within the recovery window, the session is ended and the current patient is moved to the last patient record.

---

## Project Structure

```text
agnos-patient-system/
│
├── app/
│   ├── patient/
│   │   └── page.tsx
│   │
│   ├── staff/
│   │   └── page.tsx
│   │
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── staff/
│   │   ├── patient-information-section.tsx
│   │   └── patient-status.tsx
│   │
│   └── connection-status.tsx
│
├── lib/
│   └── socket.ts
│
├── server/
│   └── index.ts
│
├── types/
│   └── patient.ts
│
├── public/
│
├── package.json
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Git

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
```

Navigate into the project:

```bash
cd agnos-patient-system
```

Install dependencies:

```bash
npm install
```

---

## Running the Application Locally

The application consists of two processes:

1. Next.js frontend
2. Socket.IO server

### 1. Start the Socket.IO Server

```bash
npm run start:socket
```

The Socket.IO server will run on:

```text
http://localhost:3001
```

### 2. Start the Next.js Application

Open another terminal:

```bash
npm run dev
```

The Next.js application will normally be available at:

```text
http://localhost:3000
```

---

## Environment Variables

The frontend uses the following environment variable for the Socket.IO server:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

For production, this variable points to the deployed Render Socket.IO server:

```env
NEXT_PUBLIC_SOCKET_URL=https://agnos-patient-socket.onrender.com
```

The environment variable is used by the Socket.IO client to determine which server the frontend should connect to.

---

## Socket.IO Client

The Socket.IO client is configured in:

```text
lib/socket.ts
```

Example:

```ts
import { io } from "socket.io-client";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export const socket = io(socketUrl, {
  autoConnect: false,
});
```

The client uses `autoConnect: false` so that each page can control when the Socket.IO connection is established.

---

## Production Deployment

### Frontend

The Next.js frontend is deployed using Vercel.

The production frontend uses:

```env
NEXT_PUBLIC_SOCKET_URL=https://agnos-patient-socket.onrender.com
```

After updating environment variables, the Vercel deployment must be redeployed so the new environment variable is included in the production build.

### Socket.IO Server

The Socket.IO server is deployed as a Render Web Service.

The server uses the Render-provided `PORT` environment variable:

```ts
const PORT = Number(process.env.PORT) || 3001;
```

This allows the same server to run locally on port `3001` and use the port provided by Render in production.

---

## Deployment Architecture

```text
                   Production

       ┌────────────────────────────┐
       │          Vercel            │
       │                            │
       │  Next.js Patient / Staff   │
       └─────────────┬──────────────┘
                     │
                     │ HTTPS / Socket.IO
                     │
                     ▼
       ┌────────────────────────────┐
       │           Render           │
       │                            │
       │     Node.js Socket.IO      │
       │          Server            │
       └────────────────────────────┘
```

---

## Patient Form Flow

The patient workflow is divided into five steps:

```text
Step 1
Personal Information
        ↓
Step 2
Contact Information
        ↓
Step 3
Additional Information
        ↓
Step 4
Emergency Contact
        ↓
Step 5
Review & Submit
        ↓
Confirm & Submit
        ↓
Submitted
        ↓
Fill out a new form
        ↓
New Patient Session
```

The multi-step design reduces the amount of information shown at one time and makes the form easier to complete on smaller screens.

---

## Staff Flow

The Staff View is read-only and follows the current patient session.

```text
Staff connects
      ↓
staff:join
      ↓
Receive current patient
      ↓
Receive patient status
      ↓
Monitor real-time updates
      ↓
Patient submits
      ↓
Current patient becomes completed
      ↓
Patient starts a new session
      ↓
Previous patient becomes Last Patient
```

Staff can view the previous patient while the new patient is completing the form.

---

## Component Architecture

The application separates responsibilities into UI, communication, and server layers.

```text
Next.js Application
│
├── Patient Interface
│   └── Patient Form
│       ├── Step Navigation
│       ├── Form Fields
│       ├── Validation
│       ├── Review
│       └── Submit
│
├── Staff Interface
│   └── Staff Page
│       ├── Connection Status
│       ├── Patient Status
│       ├── Patient Information Section
│       └── Current / Last Patient
│
└── Real-Time Layer
    ├── Socket.IO Client
    └── Socket.IO Server
```

### Patient Page

`app/patient/page.tsx` contains the patient-facing form and manages:

- Form state
- Step navigation
- Validation
- Review state
- Submission
- New patient session
- Socket.IO communication

### Staff Page

`app/staff/page.tsx` manages:

- Current patient
- Last patient
- Current view
- Patient status
- Socket.IO connection status

The Staff View listens for real-time Socket.IO events and updates the interface accordingly.

### Patient Information Section

`components/staff/patient-information-section.tsx` is a reusable component used to display grouped patient information.

### Patient Status

`components/staff/patient-status.tsx` displays:

- Inactive
- Actively filling
- Submitted

### Connection Status

`components/connection-status.tsx` displays the current Socket.IO connection state.

---

## Socket.IO Events

The following events are used for communication between the Patient, Socket.IO server, and Staff.

### Patient → Server

| Event                 | Purpose                           |
| --------------------- | --------------------------------- |
| `patient:join`        | Join or restore a patient session |
| `patient:update`      | Send updated patient information  |
| `patient:submit`      | Submit the completed patient form |
| `patient:new-session` | Start a new patient session       |

### Staff → Server

| Event        | Purpose                                               |
| ------------ | ----------------------------------------------------- |
| `staff:join` | Register the Staff View and receive the current state |

### Server → Client

| Event             | Purpose                             |
| ----------------- | ----------------------------------- |
| `patient:restore` | Restore the current patient session |
| `patient:update`  | Send patient information to Staff   |
| `patient:status`  | Update patient status               |
| `patient:current` | Update or clear the current patient |
| `patient:last`    | Update the last completed patient   |

---

## Real-time Update Flow

When a patient updates their information:

```text
Patient Form
    │
    │ patient:update
    ▼
Socket.IO Server
    │
    │ Update currentPatient
    │
    │ Broadcast patient:update
    ▼
Staff View
    │
    │ Update React state
    ▼
Staff UI
```

When the patient submits:

```text
Patient Form
    │
    │ patient:submit
    ▼
Socket.IO Server
    │
    ├── currentPatient = submitted patient
    ├── currentStatus = submitted
    │
    ├── patient:update ──────► Staff
    │
    └── patient:status ──────► Staff
```

When the patient starts a new session:

```text
Current Patient
      │
      │ patient:new-session
      ▼
Socket.IO Server
      │
      ├── currentPatient → null
      ├── previous patient → lastPatient
      ├── new session created
      └── status → actively-filling
              │
              ├── patient:current
              ├── patient:last
              └── patient:status
                       │
                       ▼
                     Staff
```

---

## Data Management

The current implementation keeps the active patient state in memory inside the Socket.IO server.

The server maintains:

```text
patientSocketId
patientSessionId
currentPatient
lastPatient
currentStatus
disconnectTimer
```

### Current Patient

`currentPatient` represents the patient currently using the form.

### Last Patient

`lastPatient` represents the most recently completed patient session.

### Patient Session

`patientSessionId` is used to identify the current patient session and support session restoration after a browser refresh.

---

## Testing

The following test scenarios were completed during development.

### Functional Tests

| Test                            | Result |
| ------------------------------- | ------ |
| Clean State                     | Passed |
| Patient Submit                  | Passed |
| Fill out a new form             | Passed |
| Staff View Last Patient         | Passed |
| Patient enters new information  | Passed |
| Staff switches between patients | Passed |
| Patient submits new patient     | Passed |

### Real-time Testing

The Patient and Staff interfaces were tested simultaneously.

Example:

```text
Patient Browser
      │
      │ Fill form
      ▼
Socket.IO Server
      │
      │ Broadcast update
      ▼
Staff Browser
```

Patient information entered in the Patient interface was successfully reflected in the Staff interface in real time.

### Production Testing

The deployed application was tested using:

```text
Vercel Patient
      ↓
Render Socket.IO Server
      ↓
Vercel Staff
```

Real-time communication was successfully verified in the production environment.

Render server logs were also checked to confirm that clients were connecting and that patient/staff Socket.IO events were being received.

---

## UI / UX Design

The interface was designed with a focus on:

- Mobile-first usage
- Simple wording
- Clear visual hierarchy
- Large interactive controls
- Readability
- Responsive layouts
- Easy navigation
- Reduced cognitive load

The Patient Form uses a step-by-step wizard instead of displaying a long form on one page.

A review step is provided before submission so patients can verify their information before completing the form.

The Staff interface keeps a simple read-only layout focused on readability and real-time monitoring.

---

## Accessibility Considerations

The Patient interface includes several usability considerations for users who may have difficulty using digital forms:

- Larger text and controls
- Text size adjustment
- Clear step progress
- Simple wording
- Large navigation buttons
- Touch-friendly controls
- Mobile responsive layout
- Clear confirmation before final submission
- Review before submission

---

## Known Limitations

This project is implemented as an assignment prototype and currently focuses on the core patient form and real-time staff monitoring workflow.

The current implementation does not include persistent database storage. Patient and session state is maintained in memory by the Socket.IO server.

Potential production improvements include:

- Persistent database storage
- Authentication and authorization
- Multiple concurrent patient sessions
- Multiple staff rooms
- Patient history management
- More comprehensive accessibility support
- Production monitoring and logging
- Persistent session storage
- Stronger data security and privacy controls

---

## Future Improvements

Possible improvements for a production-ready version include:

1. Introduce a database for persistent patient records.
2. Add authentication and authorization for staff users.
3. Support multiple patient sessions simultaneously.
4. Separate patients and staff into dedicated rooms.
5. Add stronger server-side validation.
6. Add structured error handling.
7. Add automated unit and integration tests.
8. Add monitoring and alerting.
9. Improve accessibility based on user testing.
10. Add secure data handling appropriate for healthcare applications.

---

## Deployment URLs

### Frontend

Vercel:

https://agnos-patient-system-seven.vercel.app

### Socket.IO Server

Render:

https://agnos-patient-socket.onrender.com

---

## Summary

AGNOS Patient System is a responsive real-time patient information system built with:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Node.js
- Socket.IO

The project separates the patient-facing form from the staff monitoring interface while using Socket.IO to synchronize patient information and status in real time.

The Patient interface provides a simple five-step workflow designed for mobile devices and ease of use.

The Staff interface provides a read-only view of the current patient, previous patient, and real-time patient status.

The frontend is deployed on Vercel and the Socket.IO server is deployed independently on Render.

```text
Next.js / React
      │
      │ Socket.IO
      ▼
Node.js + Socket.IO
      │
      │ Socket.IO
      ▼
Staff View
```

The production environment has been tested successfully for real-time communication between the Patient and Staff interfaces.
