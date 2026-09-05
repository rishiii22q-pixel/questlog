import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getDashboard,
  toggleRoutine,
  createRoutine,
  deleteRoutine,
  toggleAdhocTask,
  deleteAdhocTask,
  createAdhocTask
} from '../api/api';
import Header from '../components/Header';
import DateNavBar from '../components/DateNavBar';
import DailyCoreRoutines from '../components/DailyCoreRoutines';
import AdHocTasksPanel from '../components/AdHocTasksPanel';
import AddTaskModal from '../components/AddTaskModal';
import AddRoutineModal from '../components/AddRoutineModal';
import GoalBanner from '../components/GoalBanner';
import WeeklyView from '../components/WeeklyView';
import ConfettiOverlay from '../components/ConfettiOverlay';
import Toast from '../components/Toast';
import NotificationScheduler from '../components/NotificationScheduler';

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem('questlog_user_id');

  // Read date from URL query param (used when navigating from Calendar)
  const queryDate = new URLSearchParams(location.search).get('date');
  const todayStr = new Date().toISOString().split('T')[0];

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(queryDate || todayStr);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddRoutine, setShowAddRoutine] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [prevAllDone, setPrevAllDone] = useState(false);

  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  async function loadDashboard(date) {
    if (!userId) { navigate('/onboarding'); return; }
    try {
      setLoading(true);
      const res = await getDashboard(userId, date);
      setDashboard(res.data);
      // Trigger confetti only when we transition from incomplete → all complete
      if (res.data.allRoutinesCompleted && res.data.totalRoutinesCount > 0 && !prevAllDone) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
      setPrevAllDone(res.data.allRoutinesCompleted);
    } catch {
      addToast('Could not load dashboard. Is the backend running?', 'info');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDashboard(selectedDate); }, [selectedDate]);

  async function handleToggleRoutine(routineId) {
    try {
      const res = await toggleRoutine(routineId, selectedDate);
      const updated = res.data;
      if (updated.xpEarned > 0) addToast(`+${updated.xpEarned} XP! 🔥 ${updated.streakCount} day streak`);
      loadDashboard(selectedDate);
    } catch { addToast('Failed to update routine', 'info'); }
  }

  async function handleToggleTask(taskId) {
    try {
      const res = await toggleAdhocTask(taskId);
      if (res.data.completed) addToast(`+${res.data.xpReward} Bonus XP! ⚡`);
      loadDashboard(selectedDate);
    } catch { addToast('Failed to update task', 'info'); }
  }

  async function handleDeleteTask(taskId) {
    try {
      await deleteAdhocTask(taskId);
      addToast('Task deleted');
      loadDashboard(selectedDate);
    } catch { addToast('Failed to delete task', 'info'); }
  }

  async function handleAddTask(taskData) {
    try {
      await createAdhocTask({ ...taskData, userId: parseInt(userId) });
      const targetDate = taskData.targetDate;
      addToast(`Task scheduled for ${targetDate === todayStr ? 'today' : targetDate}! 📅`);
      setShowAddTask(false);
      if (selectedDate === targetDate) {
        loadDashboard(targetDate);
      } else {
        setSelectedDate(targetDate);
      }
    } catch (err) {
      console.error('Failed to add task:', err);
      addToast('Failed to add task', 'info');
    }
  }

  async function handleCreateRoutine(routineData) {
    try {
      await createRoutine({ ...routineData, userId: parseInt(userId) });
      addToast(`🔥 Added routine: "${routineData.title}"!`);
      setShowAddRoutine(false);
      loadDashboard(selectedDate);
    } catch (err) {
      console.error('Failed to create routine:', err);
      addToast('Failed to create routine', 'info');
    }
  }

  async function handleDeleteRoutine(routineId) {
    try {
      await deleteRoutine(routineId);
      addToast('Routine deleted');
      loadDashboard(selectedDate);
    } catch (err) {
      console.error('Failed to delete routine:', err);
      addToast('Failed to delete routine', 'info');
    }
  }

  const user = dashboard?.user;
  const routines = dashboard?.mandatoryRoutines || [];
  const tasks = dashboard?.adhocTasks || [];


  return (
    <div>
      {showConfetti && <ConfettiOverlay />}

      {/* 🔔 Notification Scheduler — fires real browser alerts for today's routines */}
      <NotificationScheduler
        routines={selectedDate === todayStr ? routines : []}
        selectedDate={selectedDate}
      />

      <Header user={user} masterStreak={dashboard?.masterStreakDays || 0} />

      <main className="main-content">
        {/* Goal Banner */}
        <GoalBanner
          goal={user?.dreamGoal || 'Master Daily Consistency'}
          masterStreak={dashboard?.masterStreakDays || 0}
        />

        {/* Date Navigation */}
        <DateNavBar selectedDate={selectedDate} onDateChange={setSelectedDate} />

        {/* Celebration Banner */}
        {dashboard?.allRoutinesCompleted && dashboard?.totalRoutinesCount > 0 && (
          <div className="celebration-banner">
            <span style={{ fontSize: '1.5rem' }}>🎉</span>
            <p>All daily routines completed! Streak protected — great work! 🔥</p>
          </div>
        )}

        {/* Streak warning if not all done today */}
        {!dashboard?.allRoutinesCompleted && dashboard?.totalRoutinesCount > 0
          && selectedDate === todayStr && dashboard?.completedRoutinesCount > 0 && (
          <div style={{
            background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)',
            borderRadius: 'var(--radius-lg)', padding: '12px 18px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: 'var(--accent-yellow)',
          }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <span>
              Complete all {dashboard.totalRoutinesCount} routines today to keep your streak!
              ({dashboard.completedRoutinesCount}/{dashboard.totalRoutinesCount} done)
            </span>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>⏳</div>
            <p style={{ fontSize: '0.9rem' }}>Loading dashboard...</p>
          </div>
        )}

        {/* Main Dashboard Grid */}
        {!loading && (
          <>
            <div className="dashboard-grid">
              <DailyCoreRoutines
                routines={routines}
                completedCount={dashboard?.completedRoutinesCount || 0}
                totalCount={dashboard?.totalRoutinesCount || 0}
                onToggle={handleToggleRoutine}
                onAddRoutine={() => setShowAddRoutine(true)}
                onDeleteRoutine={handleDeleteRoutine}
              />
              <AdHocTasksPanel
                tasks={tasks}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
                onAddTask={() => setShowAddTask(true)}
              />
            </div>

            {/* Weekly Heatmap */}
            <WeeklyView userId={userId} onSelectDate={setSelectedDate} selectedDate={selectedDate} />
          </>
        )}
      </main>

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTaskModal
          defaultDate={selectedDate}
          onClose={() => setShowAddTask(false)}
          onSubmit={handleAddTask}
        />
      )}

      {/* Add Routine Modal */}
      {showAddRoutine && (
        <AddRoutineModal
          onClose={() => setShowAddRoutine(false)}
          onSubmit={handleCreateRoutine}
        />
      )}

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(t => <Toast key={t.id} message={t.msg} type={t.type} />)}
      </div>
    </div>
  );
}

