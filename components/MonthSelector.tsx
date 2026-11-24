"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { currentMonthKey, shiftMonthKey } from "@/lib/format";

export function MonthSelector({ value, onChange }: { value: string; onChange: (month: string) => void }) {
  return <div className="month-selector" aria-label="Select month">
    <button className="icon-button" type="button" aria-label="Previous month" onClick={() => onChange(shiftMonthKey(value, -1))}><ChevronLeft size={16} /></button>
    <input className="field" aria-label="Month and year" type="month" value={value} onChange={(event) => { if (event.target.value) onChange(event.target.value); }} />
    <button className="icon-button" type="button" aria-label="Next month" onClick={() => onChange(shiftMonthKey(value, 1))}><ChevronRight size={16} /></button>
    {value !== currentMonthKey() && <button className="btn btn-secondary" type="button" onClick={() => onChange(currentMonthKey())}>This month</button>}
  </div>;
}
