// QR Code display component

import { QRCodeSVG } from "qrcode.react";

export function QRCodeDisplay({ value, size = 200 }: { value: string; size?: number }) {
  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg">
      <QRCodeSVG value={value} size={size} level="H" />
    </div>
  );
}

