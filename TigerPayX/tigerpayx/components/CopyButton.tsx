// CopyButton component for copying text to clipboard

import { useState } from "react";
import { showToast } from "./Toast";

interface CopyButtonProps {
  text: string;
  variant?: "default" | "icon" | "inline";
  size?: "sm" | "md";
  className?: string;
}

export function CopyButton({ text, variant = "icon", size = "md", className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast("Copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const sizeClasses = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const paddingClasses = size === "sm" ? "p-1.5" : "p-2";

  if (variant === "inline") {
    return (
      <button
        onClick={handleCopy}
        className={`inline-flex items-center gap-1.5 text-sm text-[#ff6b00] hover:text-[#e55a00] transition-colors ${className}`}
        title="Copy to clipboard"
      >
        {copied ? (
          <>
            <svg className={`${sizeClasses} text-green-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-600">Copied!</span>
          </>
        ) : (
          <>
            <svg className={sizeClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={`${paddingClasses} hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 ${className}`}
      title="Copy to clipboard"
    >
      {copied ? (
        <svg className={`${sizeClasses} text-green-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
      ) : (
        <svg className={`${sizeClasses} text-gray-600 dark:text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
      )}
    </button>
  );
}
