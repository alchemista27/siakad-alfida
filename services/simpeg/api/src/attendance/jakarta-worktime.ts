export function jakartaMinutes(now: Date): number {
  const parts = new Intl.DateTimeFormat('en-GB', {timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'}).formatToParts(now);
  const value = (type: string) => Number(parts.find(part => part.type === type)?.value);
  return value('hour') * 60 + value('minute');
}
export function hhmmMinutes(value: string): number {
  if (!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(value)) throw new Error('Jam harus HH:mm.');
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}
export function jakartaDateKey(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit'}).formatToParts(now);
  const value = (type: string) => parts.find(part => part.type === type)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}
export function overtimeMinutesFor(input: {date: string; checkIn: Date; checkOut: Date | null; overtimeStartTime: string | null}): number {
  const {date, checkIn, checkOut, overtimeStartTime} = input;
  if (!checkOut || !overtimeStartTime || !Number.isFinite(checkIn.getTime()) || !Number.isFinite(checkOut.getTime()) ||
    checkOut <= checkIn || jakartaDateKey(checkIn) !== date || jakartaDateKey(checkOut) !== date) return 0;
  const threshold = new Date(`${date}T${overtimeStartTime}:00+07:00`).getTime();
  if (!Number.isFinite(threshold)) return 0;
  return Math.max(0, Math.floor((checkOut.getTime() - Math.max(threshold, checkIn.getTime())) / 60000));
}
