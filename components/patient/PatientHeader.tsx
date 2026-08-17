import { Type } from "lucide-react";

import {
  ConnectionStatus,
  type ConnectionState,
} from "../connection-status";

// PatientHeader:
// - แสดงชื่อ AGNOS
// - แสดงชื่อหน้าปัจจุบัน
// - แสดงสถานะ Socket connection
// - ปุ่มปรับขนาดตัวอักษร
// ตัว component นี้รับ state/action ผ่าน props
// เพื่อไม่ให้มันต้องรู้จัก socket หรือจัดการ state เอง

type PatientHeaderProps = {
  // สถานะการเชื่อมต่อกับ Socket.IO
  connectionStatus: ConnectionState;

  // สถานะว่ากำลังใช้ตัวหนังสือขนาดใหญ่หรือไม่
  largeText: boolean;

  // ฟังก์ชันสำหรับสลับขนาดตัวหนังสือ
  onToggleTextSize: () => void;
};

const TOKENS = {
  ink: "#12312B",
  inkSoft: "#4B615C",
  tealDeep: "#0B4F49",
  mintPale: "#EFF6F3",
  paper: "#FCFAF6",
  line: "#DDE7E2",
};

export default function PatientHeader({
  connectionStatus,
  largeText,
  onToggleTextSize,
}: PatientHeaderProps) {
  return (
    <div className="sticky top-0 z-30 border-b backdrop-blur">
      <div
        className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6"
        style={{
          backgroundColor: `${TOKENS.mintPale}F2`,
          borderColor: TOKENS.line,
        }}
      >
        {/* AGNOS branding */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{
              backgroundColor: TOKENS.tealDeep,
            }}
          >
            A
          </div>

          <div>
            <p
              className="font-semibold leading-none"
              style={{
                color: TOKENS.ink,
              }}
            >
              AGNOS
            </p>

            <p
              className="mt-1 text-xs"
              style={{
                color: TOKENS.inkSoft,
              }}
            >
              Patient information
            </p>
          </div>
        </div>

        {/* Connection status + text size control */}
        <div className="flex items-center gap-2">
          {/* แสดงสถานะ Connected / Disconnected */}
          <ConnectionStatus status={connectionStatus} />

          {/* ปุ่มเปลี่ยนขนาดตัวอักษร */}
          <button
            type="button"
            onClick={onToggleTextSize}
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

            <span className="text-sm">
              ก
            </span>

            <span className="text-base">
              ก
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}