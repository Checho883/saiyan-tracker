import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Zap, TrendingUp } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { usePowerStore } from '@/store/powerStore';
import { useUIStore } from '@/store/uiStore';
import { quoteApi } from '@/services/api';
import PowerLevelBar from '@/components/dashboard/PowerLevelBar';
import TaskCard from '@/components/dashboard/TaskCard';
import StreakDisplay from '@/components/dashboard/StreakDisplay';
import EnergySelector from '@/components/dashboard/EnergySelector';
import TransformationMeter from '@/components/dashboard/TransformationMeter';
import TransformationAnimation from '@/components/animations/TransformationAnimation';
import PointsPopup from '@/components/animations/PointsPopup';
import VegetaDialog from '@/components/common/VegetaDialog';
import GokuQuote from '@/components/common/GokuQuote';
import TaskFormModal from '@/components/common/TaskFormModal';
import OffDayModal from '@/components/common/OffDayModal';
import { offDayApi } from '@/services/api';
import type { Quote, CompletionResult } from '@/types';

export default function Dashboard() {
  const {
    tasks, categories, todayCompletions, selectedEnergy,
    fetchTasks, fetchCategories, fetchTodayCompletions,
    createTask, completeTask, setSelectedEnergy, deleteTask,
  } = useTaskStore();

  const { power, transformations, newTransformation, fetchPower, fetchTransformations, updateFromCompletion, setNewTransformation } = usePowerStore();
  const { showTaskForm, showOffDayForm, setShowTaskForm, setShowOffDayForm } = useUIStore();

  const [activeQuote, setActiveQuote] = useState<Quote | null>(null);
  const [pointsPopup, setPointsPopup] = useState<number | null>(null);
  const [showTransAnimation, setShowTransAnimation] = useState(false);

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
    fetchTasks();
    fetchTodayCompletions();
    fetchPower();
    fetchTransformations();
    loadContextualQuote();
  }, []);

  const loadContextualQuote = async () => {
    try {
      const quote = await quoteApi.contextual();
      setActiveQuote(quote);
    } catch {}
  };

  // Handle task completion
  const handleComplete = async (taskId: string) => {
    try {
      const result: CompletionResult = await completeTask(taskId, selectedEnergy || undefined);
      updateFromCompletion(result);

      // Show points popup
      setPointsPopup(result.points_awarded);
      setTimeout(() => setPointsPopup(null), 2000);

      // Check for new transformation
      if (result.new_transformation) {
        setTimeout(() => setShowTransAnimation(true), 500);
      } else {
        // Show Goku quote on completion
        try {
          const quote = await quoteApi.gokuMotivation('task_complete');
          setActiveQuote(quote);
          setTimeout(() => setActiveQuote(null), 5000);
        } catch {}
      }

      // Refresh data
      fetchTodayCompletions();
      fetchPower();
    } catch (e) {
      console.error('Failed to complete task:', e);
    }
  };

  const handleCreateTask = async (data: Parameters<typeof createTask>[0]) => {
    await createTask(data);
  };

  const handleOffDay = async (data: { reason: string; notes?: string }) => {
    await offDayApi.create(data);
    fetchPower();
  };

  // Filter/sort tasks based on energy
  const completedTaskIds = new Set(todayCompletions.map(c => c.task_id));
  const activeTasks = tasks.filter(t => !completedTaskIds.has(t.id));
  const completedTasks = tasks.filter(t => completedTaskIds.has(t.id));

  // Sort by energy match
  const energyOrder = { low: 0, medium: 1, high: 2 };
  const sortedTasks = selectedEnergy
    ? [...activeTasks].sort((a, b) => {
        const aMatch = Math.abs(energyOrder[a.energy_level as keyof typeof energyOrder] - energyOrder[selectedEnergy]);
        const bMatch = Math.abs(energyOrder[b.energy_level as keyof typeof energyOrder] - energyOrder[selectedEnergy]);
        return aMatch - bMatch;
      })
    : activeTasks;

  return (
    <div className="min-h-screen bg-saiyan-dark">
      {/* Header */}
      <header className="border-b border-saiyan-border bg-saiyan-darker px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-saiyan-orange" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              SAIYAN TRACKER
            </h1>
            <p className="text-xs text-saiyan-muted mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowOffDayForm(true)}
              className="px-4 py-2 border border-saiyan-border rounded-lg text-saiyan-muted hover:text-saiyan-blue hover:border-saiyan-blue text-sm flex items-center gap-2"
            >
              <Calendar size={16} /> Off Day
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTaskForm(true)}
              className="px-4 py-2 bg-saiyan-orange text-white rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-orange-600"
            >
              <Plus size={16} /> New Task
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Power + Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Power Level Bar */}
            {power && <PowerLevelBar power={power} />}

            {/* Energy Selector */}
            <EnergySelector selected={selectedEnergy} onSelect={setSelectedEnergy} />

            {/* Active Tasks */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-saiyan-text flex items-center gap-2">
                  <Zap size={18} className="text-saiyan-orange" />
                  Training Tasks
                  <span className="text-sm text-saiyan-muted">({sortedTasks.length})</span>
                </h2>
              </div>

              {sortedTasks.length === 0 ? (
                <div className="bg-saiyan-card border border-saiyan-border rounded-xl p-8 text-center">
                  <p className="text-saiyan-muted mb-3">No tasks yet. Time to train!</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowTaskForm(true)}
                    className="px-4 py-2 bg-saiyan-orange text-white rounded-lg font-semibold text-sm"
                  >
                    <Plus size={16} className="inline mr-1" /> Create First Task
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedTasks.map((task, i) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleComplete}
                      onDelete={deleteTask}
                      index={i}
                    />
                  ))}
                </div>
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm text-saiyan-muted uppercase tracking-wider mb-2 flex items-center gap-2">
                    <TrendingUp size={14} /> Completed Today ({completedTasks.length})
                  </h3>
                  <div className="space-y-2">
                    {completedTasks.map((task, i) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onComplete={() => {}}
                        onDelete={deleteTask}
                        isCompleted
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Stats */}
          <div className="space-y-6">
            {/* Streak */}
            <StreakDisplay streak={power?.current_streak || 0} />

            {/* Transformation Path */}
            {transformations.length > 0 && power && (
              <TransformationMeter
                transformations={transformations}
                currentLevel={power.transformation_level}
                totalPoints={power.total_power_points}
              />
            )}

            {/* Today's Summary */}
            <div className="bg-saiyan-card border border-saiyan-border rounded-xl p-4">
              <h3 className="text-sm text-saiyan-muted uppercase tracking-wider mb-3">Today's Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-saiyan-muted text-sm">Tasks Completed</span>
                  <span className="text-saiyan-text font-bold">{todayCompletions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-saiyan-muted text-sm">Points Earned</span>
                  <span className="text-saiyan-orange font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {todayCompletions.reduce((sum, c) => sum + c.points_awarded, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-saiyan-muted text-sm">Daily Minimum</span>
                  <span className={`font-bold ${power?.daily_minimum_met ? 'text-green-400' : 'text-red-400'}`}>
                    {power?.daily_minimum_met ? 'MET ✓' : 'NOT MET'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals & Overlays */}
      <TaskFormModal
        show={showTaskForm}
        categories={categories}
        onClose={() => setShowTaskForm(false)}
        onSubmit={handleCreateTask}
      />

      <OffDayModal
        show={showOffDayForm}
        onClose={() => setShowOffDayForm(false)}
        onSubmit={handleOffDay}
      />

      {/* Quotes */}
      {activeQuote?.character === 'vegeta' && (
        <VegetaDialog quote={activeQuote} onClose={() => setActiveQuote(null)} />
      )}
      {activeQuote?.character === 'goku' && (
        <GokuQuote quote={activeQuote} onClose={() => setActiveQuote(null)} />
      )}

      {/* Points Popup */}
      <PointsPopup points={pointsPopup} />

      {/* Transformation Animation */}
      {newTransformation && (
        <TransformationAnimation
          level={newTransformation.new_level}
          name={newTransformation.new_name}
          show={showTransAnimation}
          onClose={() => {
            setShowTransAnimation(false);
            setNewTransformation(null);
          }}
        />
      )}
    </div>
  );
}
