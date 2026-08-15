import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#EFF6F3] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-center">
        {/* Header */}
        <header className="mb-10 text-center sm:mb-14">
          <p className="text-sm font-semibold tracking-[0.18em] text-[#0B4F49]">
            AGNOS PATIENT SYSTEM
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#163B37] sm:text-5xl">
            Welcome
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#58706C] sm:text-lg">
            Please choose how you would like to use the system.
          </p>
        </header>

        {/* Role Selection */}
        <section
          aria-label="Choose system role"
          className="grid gap-5 sm:grid-cols-2"
        >
          {/* Patient */}
          <Link
            href="/patient"
className="group flex h-[300px] flex-col rounded-3xl border border-[#D5E5E1] bg-[#FCFAF6] p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#9BC2BB] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#B8D8D2] sm:p-9"          >
            <div className="mt-4 flex flex-1 flex-col">
  <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#6B8984]">
    Patient
  </p>

  <h2 className="mt-2 text-2xl font-semibold text-[#163B37]">
    Fill out your information
  </h2>

  <p className="mt-3 text-base leading-7 text-[#58706C]">
    Complete your patient information through a simple step-by-step form.
  </p>

  <div className="mt-auto pt-8 flex items-center gap-2 text-sm font-semibold text-[#0B4F49]">
    Continue as patient
    <span className="transition-transform duration-200 group-hover:translate-x-1">
      →
    </span>
  </div>
</div>
          </Link>

          {/* Staff */}
          <Link
            href="/staff"
            className="group flex h-[300px] flex-col rounded-3xl border border-[#D5E5E1] bg-[#FCFAF6] p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#9BC2BB] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#B8D8D2] sm:p-9"
          >
            <div className="mt-4 flex flex-1 flex-col">
  <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#6B8984]">
    Staff
  </p>

  <h2 className="mt-2 text-2xl font-semibold text-[#163B37]">
    Monitor patient information
  </h2>

  <p className="mt-3 text-base leading-7 text-[#58706C]">
    View the current patient and monitor information in real time.
  </p>

  <div className="mt-auto pt-8 flex items-center gap-2 text-sm font-semibold text-[#0B4F49]">
    Continue as staff
    <span className="transition-transform duration-200 group-hover:translate-x-1">
      →
    </span>
  </div>
</div>
          </Link>
        </section>

        {/* Footer */}
        <footer className="mt-10 text-center sm:mt-12">
          <p className="text-xs tracking-wide text-[#78918D]">
            AGNOS Healthcare · Patient Information System
          </p>
        </footer>
      </div>
    </main>
  );
}