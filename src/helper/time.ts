export const getUserTimeZone = (fallback?: string) =>
  fallback || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

export const formatInTz = (
  date: string | Date,
  tz: string,
  opts?: Intl.DateTimeFormatOptions
) =>
  new Intl.DateTimeFormat("en-US", { timeZone: tz, ...opts }).format(
    new Date(date)
  );

export const formatTimeRangeInTz = (
  start: string | Date,
  end: string | Date | undefined,
  tz: string
) => {
  const base: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: tz,
  };
  const s = new Intl.DateTimeFormat("en-US", base).format(new Date(start));
  if (!end) return s;
  const e = new Intl.DateTimeFormat("en-US", base).format(new Date(end));
  return `${s} - ${e}`;
};
