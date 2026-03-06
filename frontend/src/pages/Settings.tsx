import { useEffect } from 'react';
import { Sliders, Folder, Gift, Star, Archive } from 'lucide-react';
import { useRewardStore } from '../store/rewardStore';
import { useShallow } from 'zustand/react/shallow';
import { CollapsibleSection } from '../components/settings/CollapsibleSection';
import { PreferencesSection } from '../components/settings/PreferencesSection';
import { CategorySection } from '../components/settings/CategorySection';
import { RewardSection } from '../components/settings/RewardSection';
import { WishSection } from '../components/settings/WishSection';
import { ArchivedHabitsSection } from '../components/settings/ArchivedHabitsSection';

export default function Settings() {
  const { categories, rewards, wishes, fetchSettings } = useRewardStore(
    useShallow((s) => ({
      categories: s.categories,
      rewards: s.rewards,
      wishes: s.wishes,
      fetchSettings: s.fetchSettings,
    }))
  );

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <div className="p-4 space-y-4 pb-24">
      <h1 className="text-2xl font-bold text-saiyan-500">Settings</h1>

      <CollapsibleSection title="Preferences" icon={Sliders} defaultOpen={true}>
        <PreferencesSection />
      </CollapsibleSection>

      <CollapsibleSection title="Categories" icon={Folder} count={categories.length}>
        <CategorySection />
      </CollapsibleSection>

      <CollapsibleSection title="Capsule Rewards" icon={Gift} count={rewards.length}>
        <RewardSection />
      </CollapsibleSection>

      <CollapsibleSection title="Shenron Wishes" icon={Star} count={wishes.length}>
        <WishSection />
      </CollapsibleSection>

      <CollapsibleSection title="Archived Habits" icon={Archive}>
        <ArchivedHabitsSection />
      </CollapsibleSection>
    </div>
  );
}
