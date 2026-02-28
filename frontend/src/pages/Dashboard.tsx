import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Zap, TrendingUp, CheckCircle2, Target } from 'lucide-react';
import { useHabitStore } from '@/store/habitStore';
import { useTaskStore } from '@/store/taskStore';
import { usePowerStore } from '@/store/powerStore';
import { useUIStore } from '@/store/uiStore';
import { quoteApi, offDayApi, habitApi } from '@/services/api';
import type { Habit, HabitToday } from '@/types';
import PowerLevelBar from '@/components/dashboard/PowerLevelBar';
import HabitCard from '@/components/dashboard/HabitCard';
import TaskCard from '@/components/dashboard/TaskCard';
import StreakDisplay from '@/components/dashboard/StreakDisplay';
import TransformationMeter from '@/components/dashboard/TransformationMeter';
import TransformationAnimation from '@/components/animations/TransformationAnimation';
import PointsPopup from '@/components/animations/PointsPopup';
import VegetaDialog from '@/components/common/VegetaDialog';
import GokuQuote from '@/components/common/GokuQuote';
import HabitFormModal from '@/components/common/HabitFormModal';
import TaskFormModal from '@/components/common/TaskFormModal';
import OffDayModal from '@/components/common/OffDayModal';
import type { Quote, CompletionResult } from '@/types';

export default function Dashboard() {
  const { todayHabits, fetchTodayHabits, checkHabit } = useHabitStore();
  const {
    tasks, categories, todayCompletions,
    fetchTasks, fetchCategories, fetchTodayCompletions,
    createTask, completeTask, deleteTask,
  } = useTaskStore();
  const { power, transformations, newTransformation, fetchPower, fetchTransformations, updateFromCompletion, setNewTransformation } = usePowerStore();
  const { showTaskForm, showOffDayForm, setShowTaskForm, setShowOffDayForm } = useUIStore();

  const [activeQuote, setActiveQuote] = useState<Quote | null>(null);
  const [pointsPopup, setPointsPopup] = useState<number | null>(null);
  const [showTransAnimation, setShowTransAnimation] = useState(false);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchTasks();
    fetchTodayCompletions();
    fetchTodayHabits();
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

  // Handle habit check
  const handleHabitCheck = async (habitId: string) => {
    try {
      const result = await checkHabit(habitId);
      if (result.completed) {
        setPointsPopup(result.points_awarded);
        setTimeout(() => setPointsPopup(null), 2000);

        if (result.new_transformation) {
          setTimeout(() => setShowTransAnimation(true), 500);
          setNewTransformation(result.new_transformation);
        } else if (result.all_habits_completed) {
          try {
            const quote = await quoteApi.gokuMotivation('all_complete');
            setActiveQuote(quote);
            setTimeout(() => setActiveQuote(null), 6000);
          } catch {}
        } else {
          try {
            const quote = await quoteApi.gokuMotivation('task_complete');
            setActiveQuote(quote);
            setTimeout(() => setActiveQuote(null), 5000);
          } catch {}
        }
      }
      fetchPower();
    } catch (e) {
      console.error('Failed to check habit:', e);
    }
  };

  // Handle task completion
  const handleTaskComplete = async (taskId: string) => {
    try {
      const result: CompletionResult = await completeTask(taskId, undefined);
      updateFromCompletion(result);
      setPointsPopup(result.points_awarded);
      setTimeout(() => setPointsPopup(null), 2000);

      if (result.new_transformation) {
        setTimeout(() => setShowTransAnimation(true), 500);
      } else {
        try {
          const quote = await quoteApi.gokuMotivation('task_complete');
          setActiveQuote(quote);
          setTimeout(() => setActiveQuote(null), 5000);
        } catch {}
      }
      fetchTodayCompletions();
      fetchPower();
    } catch (e) {
      console.error('Failed to complete task:', e);
    }
  };

  const handleOffDay = async (data: { reason: string; notes?: string }) => {
    await offDayApi.create(data);
    fetchPower();
  };

  const handleEditHabit = async (habitId: string) => {
    try {
      const habits = await habitApi.list();
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        setEditingHabit(habit);
        setShowHabitForm(true);
      }
    } catch (e) {
      console.error('Failed to load habit for editing:', e);
    }
  };

  const handleArchiveHabit = async (habitId: string) => {
    try {
      await habitApi.update(habitId, { is_active: false } as Partial<Habit>);
      fetchTodayHabits();
    } catch (e) {
      console.error('Failed to archive habit:', e);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await habitApi.delete(habitId);
      fetchTodayHabits();
    } catch (e) {
      console.error('Failed to delete habit:', e);
    }
  };

  const handleMoveHabit = async (habitId: string, direction: 'up' | 'down') => {
    const idx = todayHabits.findIndex(h => h.id === habitId);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= todayHabits.length) return;

    try {
      await habitApi.reorder([
        { id: todayHabits[idx].id, sort_order: swapIdx },
        { id: todayHabits[swapIdx].id, sort_order: idx },
      ]);
      fetchTodayHabits();
    } catch (e) {
      console.error('Failed to reorder habits:', e);
    }
  };

  // Habit stats
  const completedHabits = todayHabits.filter(h => h.completed);
  const pendingHabits = todayHabits.filter(h => !h.completed);

  // Task stats
  const completedTaskIds = new Set(todayCompletions.map(c => c.task_id));
  const activeTasks = tasks.filter(t => !completedTaskIds.has(t.id));
  const completedTasks = tasks.filter(t => completedTaskIds.has(t.id));

  return (
    <motion.div
      className="min-h-screen"
      style={{ background: 'var(--bg-primary)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Top row: Date + Actions */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowOffDayForm(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              style={{ border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
            >
              <Calendar size={14} /> Off Day
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowHabitForm(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-saiyan-orange to-saiyan-gold text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-saiyan-orange/20"
            >
              <Plus size={14} /> Add Habit
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── LEFT COLUMN: Power + Habits + Tasks ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Power Level */}
            {power && <PowerLevelBar power={power} />}

            {/* Today's Habits */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Target size={16} className="text-saiyan-orange" />
                  Today's Habits
                  <span className="text-xs font-normal px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255, 107, 0, 0.1)', color: '#FF6B00' }}>
                    {completedHabits.length}/{todayHabits.length}
                  </span>
                </h2>
              </div>

              {todayHabits.length === 0 ? (
                <div className="card-base p-8 text-center">
                  <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                    No habits yet. Create your first daily habit!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowHabitForm(true)}
                    className="px-4 py-2 bg-saiyan-orange text-white rounded-lg font-semibold text-sm"
                  >
                    <Plus size={16} className="inline mr-1" /> Create First Habit
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {/* Pending habits first */}
                    {pendingHabits.map((habit, i) => (
                      <HabitCard key={habit.id} habit={habit} onCheck={handleHabitCheck} onEdit={handleEditHabit} onArchive={handleArchiveHabit} onDelete={handleDeleteHabit}
                        onMoveUp={(id) => handleMoveHabit(id, 'up')} onMoveDown={(id) => handleMoveHabit(id, 'down')}
                        isFirst={i === 0} isLast={i === pendingHabits.length - 1} />
                    ))}
                    {/* Completed habits below */}
                    {completedHabits.map(habit => (
                      <HabitCard key={habit.id} habit={habit} onCheck={handleHabitCheck} onEdit={handleEditHabit} onArchive={handleArchiveHabit} onDelete={handleDeleteHabit} />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* All habits completed message */}
              {todayHabits.length > 0 && completedHabits.length === todayHabits.length && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 rounded-lg text-center text-sm font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.1), rgba(255, 215, 0, 0.1))',
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                    color: '#FFD700',
                  }}
                >
                  <CheckCircle2 size={16} className="inline mr-1" />
                  All habits completed! 1.5x consistency bonus applied!
                </motion.div>
              )}
            </div>

            {/* One-off Tasks */}
            {(activeTasks.length > 0 || completedTasks.length > 0) && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <Zap size={16} className="text-saiyan-blue" />
                    One-off Tasks
                    <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>({activeTasks.length})</span>
                  </h2>
                  <button
                    onClick={() => setShowTaskForm(true)}
                    className="text-xs flex items-center gap-1 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Plus size={12} /> Add Task
                  </button>
                </div>

                <div className="space-y-2">
                  {activeTasks.map((task, i) => (
                    <TaskCard key={task.id} task={task} onComplete={handleTaskComplete} onDelete={deleteTask} index={i} />
                  ))}
                </div>

                {completedTasks.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-xs uppercase tracking-wider mb-2 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <TrendingUp size={12} /> Completed ({completedTasks.length})
                    </h3>
                    <div className="space-y-2">
                      {completedTasks.map((task, i) => (
                        <TaskCard key={task.id} task={task} onComplete={() => {}} onDelete={deleteTask} isCompleted index={i} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: Stats ── */}
          <div className="space-y-4">
            <StreakDisplay streak={power?.current_streak || 0} />

            {transformations.length > 0 && power && (
              <TransformationMeter
                transformations={transformations}
                currentLevel={power.transformation_level}
                totalPoints={power.total_power_points}
              />
            )}

            {/* Today's Summary */}
            <div className="card-base p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                Today's Summary
              </h3>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Habits</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    {completedHabits.length} / {todayHabits.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Tasks</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    {todayCompletions.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Points Today</span>
                  <span className="text-xs font-bold font-power text-saiyan-orange">
                    {power?.daily_points_today || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Daily Minimum</span>
                  <span className={`text-xs font-bold ${power?.daily_minimum_met ? 'text-green-400' : 'text-red-400'}`}>
                    {power?.daily_minimum_met ? 'MET' : 'NOT MET'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <HabitFormModal isOpen={showHabitForm} editHabit={editingHabit} onClose={() => { setShowHabitForm(false); setEditingHabit(null); fetchTodayHabits(); }} />
      <TaskFormModal show={showTaskForm} categories={categories} onClose={() => setShowTaskForm(false)} onSubmit={createTask} />
      <OffDayModal show={showOffDayForm} onClose={() => setShowOffDayForm(false)} onSubmit={handleOffDay} />

      {/* Quotes */}
      {activeQuote?.character === 'vegeta' && (
        <VegetaDialog quote={activeQuote} onClose={() => setActiveQuote(null)} />
      )}
      {(activeQuote?.character === 'goku' || activeQuote?.character === 'gohan') && (
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
    </motion.div>
  );
}
