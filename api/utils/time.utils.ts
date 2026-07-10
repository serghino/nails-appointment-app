export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const endMinutes = minutes + durationMinutes;
  const endHours = hours + Math.floor(endMinutes / 60);
  const finalMinutes = endMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
}

/**
 * Convert a time string ("HH:MM" or "HH:MM:SS") to minutes since midnight.
 */
export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
