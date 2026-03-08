// components/Tooltip.tsx
import React from "react";

type TooltipProps = {
  children: React.ReactNode;
  text: string;
  position?: "top" | "bottom" | "left" | "right";
};

const positionClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export const Tooltip = ({ children, text, position = "top" }: TooltipProps) => {
  return (
    <div className="relative group inline-block">
      {children}
      <div
        className={`absolute z-10 pointer-events-none opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out whitespace-nowrap bg-gray-800 text-white text-sm rounded px-2 py-1 shadow-lg ${positionClasses[position]}`}
      >
        {text}
      </div>
    </div>
  );
};
