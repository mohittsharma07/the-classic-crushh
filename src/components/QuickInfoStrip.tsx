import React from "react";
import { VegBadge } from "./VegBadge";

export const QuickInfoStrip: React.FC = () => {
  const items = [
    { label: "100% VEGETARIAN", hasVegIcon: true },
    { label: "FRESHLY MADE DAILY" },
    { label: "BAKERY & CAFE" },
    { label: "LOCAL FAVOURITES" },
  ];

  return (
    <section
      id="info-strip"
      className="border-y border-[#E8DFD3] bg-[#F7F3EC] py-4 sm:py-5 relative z-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-y-3 gap-x-6 sm:gap-x-12 text-[#3E4340]">
          {items.map((item, index) => (
            <React.Fragment key={item.label}>
              <div className="flex items-center gap-2">
                {item.hasVegIcon && <VegBadge size="sm" />}
                <span className="text-[11px] sm:text-xs font-semibold tracking-[0.24em] uppercase text-[#26332A]">
                  {item.label}
                </span>
              </div>
              {index < items.length - 1 && (
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#C59F54]/60" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
