// QR Code Scanner component

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const startScanning = async () => {
      try {
        // Dynamically import html5-qrcode to avoid SSR issues
        const { Html5Qrcode } = await import("html5-qrcode");
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText: string) => {
            onScan(decodedText);
            stopScanning();
          },
          (errorMessage: string) => {
            // Ignore scanning errors
          }
        );
        setScanning(true);
      } catch (err: any) {
        setError(err.message || "Failed to start camera");
        console.error("QR Scanner error:", err);
      }
    };

    if (typeof window !== "undefined") {
      startScanning();
    }

    return () => {
      stopScanning();
    };
  }, []);

  const stopScanning = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      setScanning(false);
    }
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#161A1E] border border-white/10 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Scan QR Code</h3>
            <button
              onClick={() => {
                stopScanning();
                onClose();
              }}
              className="text-zinc-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div id="qr-reader" className="w-full rounded-lg overflow-hidden mb-4 min-h-[300px] bg-black" />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-400">{error}</p>
              <p className="text-xs text-red-300 mt-1">Make sure camera permissions are granted</p>
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm text-zinc-400 mb-2">Or enter address manually:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleManualSubmit()}
                className="flex-1 bg-[#0a0d0f] border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                placeholder="Paste Solana address"
              />
              <button
                onClick={handleManualSubmit}
                className="px-4 py-2 bg-[#ff6b00] text-black font-semibold rounded-lg hover:bg-orange-500 transition-colors"
              >
                Use
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              stopScanning();
              onClose();
            }}
            className="w-full bg-zinc-700 text-white font-semibold py-3 rounded-lg hover:bg-zinc-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

