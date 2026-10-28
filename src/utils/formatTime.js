const timeFmt = new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit" });
const dayFmt = new Intl.DateTimeFormat([], { weekday: "short" });
const dateFmt = new Intl.DateTimeFormat([], { day: "numeric", month: "short" });

const DAY = 24 * 60 * 60 * 1000;

function parseDate(input) {
  if (!input) return null;
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

export const formatTime = (date) => {
  const d = parseDate(date) ?? new Date();
  return timeFmt.format(d);
};

// Time today, weekday this week, otherwise a short date.
export function formatListTime(date) {
  const d = parseDate(date) ?? new Date();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (d >= startOfToday) return timeFmt.format(d);
  if (d >= new Date(startOfToday.getTime() - 6 * DAY)) return dayFmt.format(d);
  return dateFmt.format(d);
}