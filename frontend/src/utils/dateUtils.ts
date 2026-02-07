import { format, parseISO, differenceInYears } from 'date-fns';
import { ru } from 'date-fns/locale';

export function formatDate(dateString: string, formatStr = 'MMM d, yyyy'): string {
  try {
    return format(parseISO(dateString), formatStr);
  } catch {
    return dateString;
  }
}

export function formatDateRu(dateString: string, formatStr = 'd MMMM yyyy'): string {
  try {
    return format(parseISO(dateString), formatStr, { locale: ru });
  } catch {
    return dateString;
  }
}

export function yearsAgo(dateString: string): number {
  try {
    return differenceInYears(new Date(), parseISO(dateString));
  } catch {
    return 0;
  }
}

export function isRaceWeekend(dayType?: string): boolean {
  return ['race', 'qualifying', 'practice'].includes(dayType || '');
}

export function getSeasonDateRange(year: number): { start: string; end: string } {
  // 2010 season ran from March 14 to November 14
  return {
    start: `${year}-03-14`,
    end: `${year}-11-14`,
  };
}

export function formatDayOfWeek(dateString: string): string {
  try {
    return format(parseISO(dateString), 'EEEE');
  } catch {
    return '';
  }
}

export function formatMonthYear(dateString: string): string {
  try {
    return format(parseISO(dateString), 'MMMM yyyy');
  } catch {
    return dateString;
  }
}

export function formatTime(timeString?: string): string {
  if (!timeString) return '';
  try {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  } catch {
    return timeString;
  }
}

export function getTodayDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
