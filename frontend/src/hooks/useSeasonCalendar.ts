import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/api/client';

interface DayFromApi {
  date: string;
  day_type: string;
  description: string | null;
  has_content: boolean;
}

// Format date as YYYY-MM-DD without timezone conversion
function formatLocalDate(year: number, month: number, day: number): string {
  const y = String(year);
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Get day of week for a date (Mon=0, Sun=6)
function getDayOfWeek(year: number, month: number, day: number): number {
  const d = new Date(year, month, day);
  return (d.getDay() + 6) % 7;
}

// Get number of days in a month
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function useSeasonCalendar(year: number) {
  return useQuery({
    queryKey: ['seasonCalendar', year],
    queryFn: async () => {
      const days = await apiGet<DayFromApi[]>(`/seasons/${year}/days`);

      // Create a map of date string -> day data
      const daysMap: Record<string, DayFromApi> = {};
      for (const day of days) {
        daysMap[day.date] = day;
      }

      const months: Array<{
        monthName: string;
        days: Array<{
          date: string;
          dayNumber: number;
          type: 'race_day' | 'quali_day' | 'practice_day' | 'test_day' | 'off_day' | 'outside_month';
          raceName?: string;
        }>;
      }> = [];

      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];

      for (let month = 0; month < 12; month++) {
        const totalDays = daysInMonth(year, month);
        const monthName = `${monthNames[month]} ${year}`;

        const monthDays: typeof months[0]['days'] = [];

        // Padding from previous month
        const startDow = getDayOfWeek(year, month, 1);
        const prevMonthDays = month > 0 ? daysInMonth(year, month - 1) : daysInMonth(year - 1, 11);
        for (let i = startDow - 1; i >= 0; i--) {
          const d = prevMonthDays - i;
          const prevMonth = month === 0 ? 11 : month - 1;
          const prevYear = month === 0 ? year - 1 : year;
          monthDays.push({
            date: formatLocalDate(prevYear, prevMonth, d),
            dayNumber: d,
            type: 'outside_month',
          });
        }

        // Days of the month
        for (let day = 1; day <= totalDays; day++) {
          const dateStr = formatLocalDate(year, month, day);
          const dayData = daysMap[dateStr];

          let type: typeof monthDays[0]['type'] = 'off_day';
          if (dayData) {
            switch (dayData.day_type) {
              case 'race_day': type = 'race_day'; break;
              case 'quali_day': type = 'quali_day'; break;
              case 'practice_day': type = 'practice_day'; break;
              case 'test_day': type = 'test_day'; break;
              default: type = 'off_day';
            }
          }

          monthDays.push({
            date: dateStr,
            dayNumber: day,
            type,
            raceName: dayData?.description || undefined,
          });
        }

        // Padding for next month
        const remainingDays = 7 - (monthDays.length % 7);
        if (remainingDays < 7) {
          const nextMonth = month === 11 ? 0 : month + 1;
          const nextYear = month === 11 ? year + 1 : year;
          for (let i = 1; i <= remainingDays; i++) {
            monthDays.push({
              date: formatLocalDate(nextYear, nextMonth, i),
              dayNumber: i,
              type: 'outside_month',
            });
          }
        }

        months.push({ monthName, days: monthDays });
      }

      return { months };
    },
    staleTime: Infinity,
  });
}
