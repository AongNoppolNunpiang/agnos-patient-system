"use client";

export type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected";

interface ConnectionStatusProps {
  status: ConnectionState;
}

const statusDetails: Record<
  ConnectionState,
  {
    label: string;
    className: string;
    dotClassName: string;
  }
> = {
  connecting: {
    label: "Connecting...",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    dotClassName: "bg-amber-500",
  },
  connected: {
    label: "Connected",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dotClassName: "bg-emerald-500",
  },
  disconnected: {
    label: "Connection lost — reconnecting...",
    className: "border-red-200 bg-red-50 text-red-800",
    dotClassName: "bg-red-500",
  },
};

export function ConnectionStatus({
  status,
}: ConnectionStatusProps) {
  const details = statusDetails[status];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Connection status: ${details.label}`}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${details.className}`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${details.dotClassName}`}
      />
      <span>{details.label}</span>
    </div>
  );
}