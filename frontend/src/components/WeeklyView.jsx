import { useEffect, useState } from 'react';
import { getDashboard } from '../api/api';

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function getDayLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short' });
}

function getDayNum(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.getDate();
}

export default function WeeklyView({ userId, onSelectDate, selectedDate }) {
  const [weekData, setWeekData] = useState({});
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  // Show current week (Mon to Sun)
  const currentDay = new Date(today + 'T00:00:00').getDay(); // 0=Sun
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = addDays(today, mondayOffset);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  useEffect(() => {
    async function fetchWeek() {
      if (!userId) return;
      setLoading(true);
      const results = {};
      await Promise.all(weekDates.map(async (date) => {
        try {
          const res = await getDashboard(userId, date);
          results[date] = {
            total: res.data.totalRoutinesCount,
            completed: res.data.completedRoutinesCount,
            allDone: res.data.allRoutinesCompleted,
          };
        } catch {
          results[date] = { total: 0, completed: 0, allDone: false };
        }
      }));
      setWeekData(results);
      setLoading(false);
    }
    fetchWeek();
  }, [userId, today]);

  return (
    <div className="weekly-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          📊 Weekly Consistency
        </h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Click a day to navigate
        </span>
      </div>

      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
        <div className="weekly-grid">
          {weekDates.map((date, idx) => {
            const data = weekData[date];
            const isToday = date === today;
            const isSelected = date === selectedDate;
            const allDone = data?.allDone;
            const partial = data && data.completed > 0 && !allDone;
            const isFuture = date > today;

            return (
              <div key={`week-${idx}-${date}`} className="week-day-col">
                <div className="week-day-label">{getDayLabel(date)}</div>
                <div
                  className={`week-day-cell ${isToday ? 'is-today' : ''} ${allDone ? 'all-done' : partial ? 'partial' : ''}`}
                  style={{
                    cursor: 'pointer',
                    outline: isSelected ? '2px solid var(--accent-purple)' : 'none',
                    outlineOffset: 2,
                    opacity: isFuture ? 0.5 : 1,
                  }}
                  onClick={() => onSelectDate(date)}
                  title={data ? `${data.completed}/${data.total} routines` : ''}
                >
                  {loading ? '·' : (
                    <>
                      <span style={{ fontWeight: 600 }}>{getDayNum(date)}</span>
                      {allDone && <span style={{ fontSize: '0.6rem', marginLeft: 3 }}>✓</span>}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center' }}>
          {[
            { color: 'rgba(16,185,129,0.3)', label: 'All done' },
            { color: 'rgba(251,191,36,0.3)', label: 'Partial' },
            { color: 'var(--bg-card)', label: 'Pending' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: color, border: '1px solid var(--border)' }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
