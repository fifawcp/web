export function formatKickoffTime(date: Date): string {
  const h = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${period}`;
}
