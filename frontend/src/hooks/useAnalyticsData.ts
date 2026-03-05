import { useState, useEffect } from 'react';
import type { AnalyticsSummary, CalendarDay, AnalyticsPeriod } from '../types';
import { analyticsApi, habitsApi } from '../services/api';

interface UseAnalyticsDataReturn {
  summary: AnalyticsSummary | null;
  calendarDays: CalendarDay[];
  isLoading: boolean;
}

export function useAnalyticsData(period: AnalyticsPeriod, month: string): UseAnalyticsDataReturn {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    analyticsApi
      .summary(period)
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch(() => {
        /* toast handled by API layer */
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  useEffect(() => {
    let cancelled = false;
    habitsApi
      .calendarAll(month)
      .then((data) => {
        if (!cancelled) setCalendarDays(data);
      })
      .catch(() => {
        /* toast handled by API layer */
      });
    return () => {
      cancelled = true;
    };
  }, [month]);

  return { summary, calendarDays, isLoading };
}
