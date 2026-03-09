"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { cn } from "@/lib/utils";

function parse24h(value: string): { hour12: number; minute: number; ampm: "AM" | "PM" } {
  if (!value?.trim()) {
    return { hour12: 12, minute: 0, ampm: "AM" };
  }
  const [h, m] = value
    .trim()
    .split(":")
    .map((s) => parseInt(s, 10) || 0);
  const hour24 = Math.min(23, Math.max(0, isNaN(h) ? 0 : h));
  const minute = Math.min(59, Math.max(0, isNaN(m) ? 0 : m));
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  const ampm = hour24 < 12 ? "AM" : "PM";
  return { hour12, minute, ampm };
}

function to24h(hour12: number, minute: number, ampm: "AM" | "PM"): string {
  let hour24 = hour12;
  if (ampm === "PM" && hour12 !== 12) hour24 += 12;
  if (ampm === "AM" && hour12 === 12) hour24 = 0;
  const h = String(hour24).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  return `${h}:${m}`;
}

const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

type Props = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
};

export function TimeInput({ value, onChange, id, className, disabled }: Props) {
  const { hour12, minute, ampm } = parse24h(value);

  const handleHourChange = (v: string) => {
    const h = parseInt(v, 10);
    onChange(to24h(h, minute, ampm));
  };
  const handleMinuteChange = (v: string) => {
    const m = parseInt(v, 10);
    onChange(to24h(hour12, m, ampm));
  };
  const handleAmPmChange = (v: "AM" | "PM") => {
    onChange(to24h(hour12, minute, v));
  };

  return (
    <div
      className={cn(
        "flex items-center w-fit h-fit gap-2 rounded-md border border-input bg-transparent shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        disabled && "opacity-50 pointer-events-none",
        className,
      )}
      data-slot="time-input"
    >
      <Select value={String(hour12)} onValueChange={handleHourChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          className="cursor-pointer pr-0 border-none rounded-none bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 w-auto [&>*:last-child]:hidden"
          aria-label="Hour"
        >
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {HOURS_12.map((h) => (
            <SelectItem key={h} value={String(h)}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground font-medium">:</span>
      <Select value={String(minute)} onValueChange={handleMinuteChange} disabled={disabled}>
        <SelectTrigger
          className="cursor-pointer  border-0 bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 w-auto  [&>*:last-child]:hidden"
          aria-label="Minute"
        >
          <SelectValue placeholder="Min" />
        </SelectTrigger>
        <SelectContent>
          {MINUTES.map((m) => (
            <SelectItem key={m} value={String(m)}>
              {String(m).padStart(2, "0")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={ampm}
        onValueChange={(v) => handleAmPmChange(v as "AM" | "PM")}
        disabled={disabled}
      >
        <SelectTrigger
          className="cursor-pointer border-0 border-l rounded-none bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 w-auto  [&>*:last-child]:hidden"
          aria-label="AM or PM"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
