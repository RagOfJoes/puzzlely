/**
 * Format time to append a 0 if needed
 */
export function formatTime(time: number) {
  return `${time > 9 ? "" : "0"}${time}`;
}

/**
 * Transform milliseconds into days, minutes, or seconds
 */
export function millisecondsTo(
  type: "days" | "minutes" | "seconds",
  milliseconds: number
) {
  switch (type) {
    case "days":
      return Math.floor((milliseconds / 600000) % 60);
    case "minutes":
      return Math.floor((milliseconds / 60000) % 60);
    default:
      return Math.floor((milliseconds / 1000) % 60);
  }
}
