import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (value: unknown): string => {
  if (!value) return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
};

export function capitalizeFirst(value?: string | null) : string{
    if(!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1);
}

export const isStrictIsoDate = (value: string): boolean => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, y, m, d] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
};

export const formatTime = (time?: string) => {
    if (!time) return "-";

    const [hourString, minuteString] = time.split(":");
    let hour = Number(hourString);
    const minute = minuteString ?? "00";

    const suffix = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${hour}:${minute} ${suffix}`;
};

export const formatNameLastFirst = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);

    if (parts.length <= 1) return fullName;

    const lastName = parts[parts.length - 1];
    const firstNames = parts.slice(0, -1).join(" ");

    return `${lastName}, ${firstNames}`;
};
