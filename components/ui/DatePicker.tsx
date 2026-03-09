"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Calendar } from "./Calendar";

function formatDate(date: Date | undefined): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isValidDate(date: Date | undefined): boolean {
  if (!date) return false;
  return !Number.isNaN(date.getTime());
}

function parseDateString(value: string): Date | undefined {
  if (!value?.trim()) return undefined;
  const [y, m, d] = value.trim().split("-").map(Number);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return undefined;
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  className?: string;
  closeOnSelect?: boolean;
};

export function DatePicker({
  value,
  onChange,
  id,
  placeholder = "Pick a date",
  className,
  closeOnSelect = true,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const date = React.useMemo(() => parseDateString(value), [value]);
  const [month, setMonth] = React.useState<Date>(() => date ?? new Date());
  const [displayValue, setDisplayValue] = React.useState(() => formatDate(date));

  React.useEffect(() => {
    const nextDate = parseDateString(value);
    setDisplayValue(formatDate(nextDate));
    if (nextDate) setMonth(nextDate);
  }, [value]);
  const calendarMonth = month ?? date ?? new Date();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplayValue(raw);
    const parsed = new Date(raw);
    if (isValidDate(parsed)) {
      onChange(toDateString(parsed));
      setMonth(parsed);
    }
  };

  const handleSelect = (d: Date | undefined) => {
    if (!d) return;
    onChange(toDateString(d));
    setDisplayValue(formatDate(d));
    setMonth(d);
    if (closeOnSelect) setOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next && date) setDisplayValue(formatDate(date));
  };

  return (
    <div className={className}>
      <div className=" cursor-pointer bg-input/30 flex rounded-lg border border-input items-center  shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <Input
          id={id}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="min-w-0 flex-1 border-0 bg-transparent! shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-l-lg rounded-r-none"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="shrink-0 rounded-l-none rounded-r-lg border-0 dark:hover:bg-transparent p-4"
              aria-label="Select date"
            >
              <CalendarIcon className="size-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="end" sideOffset={10}>
            <Calendar
              mode="single"
              selected={date}
              month={calendarMonth}
              onMonthChange={setMonth}
              onSelect={handleSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
