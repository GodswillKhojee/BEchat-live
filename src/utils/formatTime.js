const timeFmt = new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit" });
const dayFmt = new Intl.DateTimeFormat([], { weekday: "short" });
const dateFmt = new Intl.DateTimeFormat([], { day: "numeric", month: "short" });

const DAY = 24 * 60 * 60 * 1000;

export const formatTime = (date) => timeFmt.format(date);

// Time today, weekday this week, otherwise a short date.
export function formatListTime(date) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (date >= startOfToday) return timeFmt.format(date);
  if (date >= new Date(startOfToday.getTime() - 6 * DAY)) return dayFmt.format(date);
  return dateFmt.format(date);
}