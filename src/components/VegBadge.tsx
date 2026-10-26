import React from "react";

interface VegBadgeProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export const VegBadge: React.FC<VegBadgeProps> = ({
  size = "md",
  showLabel = false,
  className = "",
}) => {
  const dimensionClass =
    size === "sm" ? "w-3.5 h-3.5 p-[2px]" : size === "lg" ? "w-5 h-5 p-[3px]" : "w-4 h-4 p-[2px]";
  const dotClass =
    size === "sm" ? "w-1.5 h-1.5" : size === "lg" ? "w-2.5 h-2.5" : "w-2 h-2";

  return (
    <span
      className={`inline-flex items-center gap-1.5 select-none ${className}`}
      title="100% Pure Vegetarian"
    >
      <span
        className={`${dimensionClass} border border-emerald-700 rounded-[3px] flex items-center justify-center bg-white/90 shadow-2xs`}
        aria-label="Pure Vegetarian"
      >
        <span className={`${dotClass} rounded-full bg-emerald-700`} />
      </span>
      {showLabel && (
        <span className="text-[11px] font-medium tracking-wider text-emerald-800 uppercase">
          Pure Veg
        </span>
      )}
    </span>
  );
};
