import { useEffect, useRef, useState } from 'react';
import { Bell, BellOff, X } from 'lucide-react';

/**
 * NotificationScheduler — Real browser push notification reminders.
 *
 * - Requests notification permission from the user on first load.
 * - For each routine with reminderEnabled=true and a startTime, schedules
 *   a browser Notification to fire `reminderMinutesBefore` minutes early.
 * - Only schedules for TODAY's routines (parent passes empty array for other dates).
 * - Uses setTimeout — timers are cleared and re-set when routines change.
 * - Shows a dismissible permission banner if notifications are blocked.
 */
export default function NotificationScheduler({ routines, selectedDate }) {
  const timersRef = useRef([]);
  const [permission, setPermission] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [showBanner, setShowBanner] = useState(false);
  const [scheduled, setScheduled] = useState([]);

  // Ask for permission when component first mounts
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      // Show our custom banner asking permission
      setShowBanner(true);
    }
  }, []);

  async function requestPermission() {
    const result = await Notification.requestPermission();
    setPermission(result);
    setShowBanner(false);
    if (result === 'granted') {
      // Show a welcome notification immediately
      new Notification('🔔 QuestLog Reminders Enabled!', {
        body: "You'll be notified before your daily routines start.",
        icon: '/vite.svg',
      });
    }
  }

  // Schedule notifications for today's routines
  useEffect(() => {
    // Clear existing timers first
    timersRef.current.forEach(id => clearTimeout(id));
    timersRef.current = [];
    setScheduled([]);

    if (permission !== 'granted' || routines.length === 0) return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const newScheduled = [];

    routines.forEach(routine => {
      if (!routine.reminderEnabled || !routine.startTime || routine.status === 'COMPLETED') return;

      const [hours, minutes] = routine.startTime.split(':').map(Number);
      const reminderBefore = routine.reminderMinutesBefore || 10;

      // Build the notification fire time
      const fireTime = new Date(`${todayStr}T${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:00`);
      fireTime.setMinutes(fireTime.getMinutes() - reminderBefore);

      const delay = fireTime.getTime() - now.getTime();

      if (delay > 0) {
        const timerId = setTimeout(() => {
          new Notification(`⏰ QuestLog — Routine Starting Soon!`, {
            body: `"${routine.title}" starts in ${reminderBefore} minutes (${routine.startTime}).\nDon't break your 🔥 ${routine.streakCount} day streak!`,
            icon: '/vite.svg',
            tag: `routine-${routine.id}`,  // prevents duplicate notifications
            requireInteraction: true,
          });
        }, delay);

        timersRef.current.push(timerId);
        newScheduled.push({
          title: routine.title,
          startTime: routine.startTime,
          reminderAt: fireTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        });
      }
    });

    setScheduled(newScheduled);

    // Cleanup on unmount or routines change
    return () => {
      timersRef.current.forEach(id => clearTimeout(id));
      timersRef.current = [];
    };
  }, [routines, permission]);

  return (
    <>
      {/* Permission Request Banner */}
      {showBanner && (
        <div style={{
          position: 'fixed', bottom: 80, right: 24, zIndex: 500,
          background: 'var(--bg-card)', border: '1px solid rgba(124,58,237,0.4)',
          borderRadius: 'var(--radius-lg)', padding: '16px 20px', maxWidth: 320,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          animation: 'slideInRight 0.3s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Bell size={18} style={{ color: 'var(--accent-purple-light)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                  Enable Reminders 🔔
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Get notified before your routines start (e.g. "Study Java in 10 min!").
                </p>
              </div>
            </div>
            <button onClick={() => setShowBanner(false)}
              style={{ background: 'none', color: 'var(--text-muted)', padding: 2, flexShrink: 0 }}>
              <X size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '8px' }}
              onClick={requestPermission}>
              <Bell size={13} /> Enable
            </button>
            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setShowBanner(false)}>
              Not now
            </button>
          </div>
        </div>
      )}

      {/* Subtle indicator of scheduled notifications */}
      {permission === 'granted' && scheduled.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 24, left: 24, zIndex: 400,
          background: 'var(--bg-card)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 'var(--radius-md)', padding: '8px 14px',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: '0.75rem', color: 'var(--accent-green)',
        }}>
          <Bell size={12} />
          {scheduled.length} reminder{scheduled.length > 1 ? 's' : ''} set for today
        </div>
      )}

      {/* Blocked notification warning */}
      {permission === 'denied' && (
        <div style={{
          background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: '0.8rem', color: 'var(--accent-red)',
        }}>
          <BellOff size={13} />
          Notifications are blocked. Enable them in browser settings to get reminders.
        </div>
      )}
    </>
  );
}
