import { useEffect, useState } from 'react';
import { useHabitStore } from '../store/habitStore';
import { usePowerStore } from '../store/powerStore';
import { useRewardStore } from '../store/rewardStore';
import { useStatusStore } from '../store/statusStore';

export function useInitApp() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    Promise.all([
      useHabitStore.getState().fetchToday(today),
      usePowerStore.getState().fetchPower(),
      useRewardStore.getState().fetchRewards(),
      useRewardStore.getState().fetchWishes(),
      useRewardStore.getState().fetchCategories(),
      useRewardStore.getState().fetchSettings(),
      useStatusStore.getState().fetchStatus(today),
    ])
      .then(() => setIsReady(true))
      .catch((err) => setError((err as Error).message));
  }, []);

  return { isReady, error };
}
