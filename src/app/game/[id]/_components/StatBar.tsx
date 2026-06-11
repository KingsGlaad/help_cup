import React from "react";

export const StatBar = ({
  label,
  homeValue,
  awayValue,
  isPercentage = false,
}: {
  label: string;
  homeValue: number;
  awayValue: number;
  isPercentage?: boolean;
}) => {
  const total = homeValue + awayValue;
  const homePercent = total === 0 ? 50 : (homeValue / total) * 100;
  const awayPercent = total === 0 ? 50 : (awayValue / total) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm font-semibold mb-2">
        <span className="text-primary">
          {homeValue}
          {isPercentage ? "%" : ""}
        </span>
        <span className="text-muted-foreground uppercase text-xs tracking-wider">
          {label}
        </span>
        <span className="text-primary">
          {awayValue}
          {isPercentage ? "%" : ""}
        </span>
      </div>
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-muted">
        <div
          className="bg-blue-500 transition-all duration-1000 ease-in-out"
          style={{ width: `${homePercent}%` }}
        />
        <div className="w-1 bg-background z-10" />
        <div
          className="bg-red-500 transition-all duration-1000 ease-in-out"
          style={{ width: `${awayPercent}%` }}
        />
      </div>
    </div>
  );
};
