import { useState, useEffect } from 'react';
import type { AnalyticsSummary, CalendarDay, AnalyticsPeriod, OffDaySummary, CompletionTrend } from '../types';
import { analyticsApi, habitsApi } from '../services/api';

interface UseAnalyticsDataReturn {
  summary: AnalyticsSummary | null;
  calendarDays: CalendarDay[];
  offDaySummary: OffDaySummary | null;
  completionTrend: CompletionTrend | null;
  isLoading: boolean;
}

export function useAnalyticsData(period: AnalyticsPeriod, month: string): UseAnalyticsDataReturn {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [offDaySummary, setOffDaySummary] = useState<OffDaySummary | null>(null);
  const [completionTrend, setCompletionTrend] = useState<CompletionTrend | null>(null);
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

  useEffect(() => {
    let cancelled = false;
    analyticsApi
      .offDaySummary(period)
      .then((data) => {
        if (!cancelled) setOffDaySummary(data);
      })
      .catch(() => {
        /* toast handled by API layer */
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  useEffect(() => {
    let cancelled = false;
    analyticsApi
      .completionTrend()
      .then((data) => {
        if (!cancelled) setCompletionTrend(data);
      })
      .catch(() => {
        /* toast handled by API layer */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { summary, calendarDays, offDaySummary, completionTrend, isLoading };
}
