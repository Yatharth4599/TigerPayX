// Loading spinner component

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`${sizeClasses[size]} border-4 border-[#ff6b00]/20 border-t-[#ff6b00] rounded-full animate-spin`} />
  );
}
