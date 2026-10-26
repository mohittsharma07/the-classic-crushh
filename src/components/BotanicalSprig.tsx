import React from "react";

interface BotanicalSprigProps {
  className?: string;
  side?: "left" | "right";
  color?: string;
}

export const BotanicalSprig: React.FC<BotanicalSprigProps> = ({
  className = "",
  side = "left",
  color = "#6E776F",
}) => {
  const isRight = side === "right";

  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      stroke={color}
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-7 sm:w-10 h-5 sm:h-7 shrink-0 opacity-70 transition-opacity ${
        isRight ? "scale-x-[-1]" : ""
      } ${className}`}
      aria-hidden="true"
    >
      {/* Central Stem */}
      <path d="M4 28 C 14 24, 26 18, 44 6" />
      {/* Leaves */}
      <path d="M12 24 C 10 18, 14 14, 18 18 C 16 22, 14 24, 12 24 Z" />
      <path d="M22 19 C 24 13, 29 11, 31 16 C 27 19, 24 20, 22 19 Z" />
      <path d="M30 15 C 30 8, 36 6, 38 12 C 34 14, 32 15, 30 15 Z" />
      <path d="M38 10 C 40 4, 46 4, 46 8 C 43 10, 40 10, 38 10 Z" />
    </svg>
  );
};
