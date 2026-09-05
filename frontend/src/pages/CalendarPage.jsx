import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMonthCalendar, getDashboard, createAdhocTask } from '../api/api';
import Header from '../components/Header';
import AddTaskModal from '../components/AddTaskModal';
import Toast from '../components/Toast';
import { ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

function getDayOfWeekOffset(year, month) {
  // Returns how many empty cells to show before the 1st (Mon=0)
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  return firstDay === 0 ? 6 : firstDay - 1;
}

function DayCell({ data, isSelected, onClick }) {
  if (!data) return <div style={{ minHeight: 72 }} />;

  const { date, totalRoutines, completedRoutines, totalAdhocTasks, allRoutinesDone, isToday, isFuture } = data;
  const dayNum = parseInt(date.split('-')[2]);
  const partial = completedRoutines > 0 && !allRoutinesDone && totalRoutines > 0;

  let bgColor = 'var(--bg-card)';
  let borderColor = 'var(--border)';
  let dotColor = null;

  if (!isFuture && totalRoutines > 0) {
    if (allRoutinesDone) { bgColor = 'rgba(16,185,129,0.08)'; borderColor = 'rgba(16,185,129,0.35)'; dotColor = '#10b981'; }
    else if (partial) { bgColor = 'rgba(251,191,36,0.08)'; borderColor = 'rgba(251,191,36,0.3)'; dotColor = '#fbbf24'; }
    else if (!isFuture) { bgColor = 'rgba(239,68,68,0.05)'; borderColor = 'rgba(239,68,68,0.2)'; dotColor = '#ef4444'; }
  }

  if (isToday) borderColor = 'var(--accent-purple)';
  if (isSelected) { bgColor = 'rgba(124,58,237,0.15)'; borderColor = 'var(--accent-purple)'; }

  return (
    <div
      onClick={onClick}
      style={{
        minHeight: 72, background: bgColor, border: `1px solid ${borderColor}`,
        borderRadius: 8, padding: '8px 10px', cursor: 'pointer', transition: 'all 0.15s ease',
        position: 'relative', userSelect: 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {/* Day number */}
      <div style={{
        fontSize: '0.85rem', fontWeight: isToday ? 700 : 500,
        color: isToday ? 'var(--accent-purple-light)' : 'var(--text-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4,
      }}>
        {dayNum}
        {isToday && (
          <span style={{ fontSize: '0.6rem', background: 'var(--accent-purple)', color: 'white',
            borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>TODAY</span>
        )}
      </div>

      {/* Routine progress */}
      {totalRoutines > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
          <div style={{
            width: '100%', height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${Math.round((completedRoutines / totalRoutines) * 100)}%`,
              background: dotColor || 'var(--border-light)', borderRadius: 99, transition: 'width 0.3s',
            }} />
          </div>
        </div>
      )}

      {/* Info pills */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {totalRoutines > 0 && (
          <span style={{ fontSize: '0.65rem', color: dotColor || 'var(--text-muted)',
            background: dotColor ? `${dotColor}18` : 'transparent' }}>
            {completedRoutines}/{totalRoutines} ✓
          </span>
        )}
        {totalAdhocTasks > 0 && (
          <span style={{ fontSize: '0.65rem', color: 'var(--accent-purple-light)' }}>
            📅 {totalAdhocTasks}
          </span>
        )}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('questlog_user_id');

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [calData, setCalData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
  const [dayDetail, setDayDetail] = useState(null);
  const [loadingCal, setLoadingCal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  useEffect(() => {
    if (!userId) { navigate('/onboarding'); return; }
    loadCalendar();
  }, [year, month]);

  useEffect(() => {
    if (selectedDate) loadDayDetail(selectedDate);
  }, [selectedDate]);

  async function loadCalendar() {
    setLoadingCal(true);
    try {
      const res = await getMonthCalendar(userId, year, month);
      setCalData(res.data);
    } catch { addToast('Could not load calendar', 'info'); }
    finally { setLoadingCal(false); }
  }

  async function loadDayDetail(date) {
    setLoadingDetail(true);
    try {
      const res = await getDashboard(userId, date);
      setDayDetail(res.data);
      if (!user) setUser(res.data.user);
    } catch { addToast('Could not load day details', 'info'); }
    finally { setLoadingDetail(false); }
  }

  async function handleAddTask(taskData) {
    try {
      await createAdhocTask({ ...taskData, userId: parseInt(userId) });
      addToast('Task scheduled! 📅');
      setShowAddTask(false);
      loadDayDetail(selectedDate);
      loadCalendar();  // refresh calendar dots
    } catch { addToast('Failed to add task', 'info'); }
  }

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  // Build calendar grid (Mon-first)
  const offset = getDayOfWeekOffset(year, month);
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    cells.push(calData.find(c => c.date === dateStr) || { date: dateStr, isFuture: true, totalRoutines: 0, completedRoutines: 0, totalAdhocTasks: 0, allRoutinesDone: false, isToday: false });
  }
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedDayNum = selectedDate ? parseInt(selectedDate.split('-')[2]) : null;

  const formatDateFriendly = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div>
      <Header user={user} masterStreak={dayDetail?.masterStreakDays || 0} />

      <main className="main-content">
        {/* Page Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              📆 Monthly Calendar
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Click any day to view details, add tasks, and track consistency
            </p>
          </div>
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <LayoutDashboard size={14} /> Dashboard
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          {/* === Calendar Grid === */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', padding: 20 }}>

            {/* Month Navigator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <button className="btn-secondary" onClick={prevMonth} style={{ padding: '6px 10px' }}>
                <ChevronLeft size={16} />
              </button>
              <h2 style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                {MONTHS[month - 1]} {year}
              </h2>
              <button className="btn-secondary" onClick={nextMonth} style={{ padding: '6px 10px' }}>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Day Labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8 }}>
              {DAY_LABELS.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 600,
                  color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 0' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Cells */}
            {loadingCal ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Loading calendar...
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                {cells.map((cell, i) => (
                  <DayCell
                    key={i}
                    data={cell}
                    isSelected={cell?.date === selectedDate}
                    onClick={() => cell && setSelectedDate(cell.date)}
                  />
                ))}
              </div>
            )}

            {/* Legend */}
            <div style={{ display: 'flex', gap: 20, marginTop: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { color: 'rgba(16,185,129,0.4)', label: 'All routines done' },
                { color: 'rgba(251,191,36,0.4)', label: 'Partial completion' },
                { color: 'rgba(239,68,68,0.3)', label: 'Routines missed' },
                { color: 'var(--border)', label: 'No routines' },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: color,
                    border: '1px solid var(--border)' }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* === Day Detail Panel === */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', overflow: 'hidden', position: 'sticky', top: 88 }}>

            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                  {formatDateFriendly(selectedDate)}
                </div>
                {dayDetail && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {dayDetail.completedRoutinesCount}/{dayDetail.totalRoutinesCount} routines · {dayDetail.adhocTasks?.length || 0} tasks
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => setShowAddTask(true)}>
                  + Add Task
                </button>
                <button className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                  onClick={() => navigate(`/dashboard?date=${selectedDate}`)}>
                  Open
                </button>
              </div>
            </div>

            <div style={{ padding: '14px 18px', maxHeight: '70vh', overflowY: 'auto' }}>
              {loadingDetail ? (
                <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Loading...
                </div>
              ) : dayDetail ? (
                <>
                  {/* Routines */}
                  {dayDetail.mandatoryRoutines?.length > 0 && (
                    <>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                        🔥 Daily Routines
                      </div>
                      {dayDetail.mandatoryRoutines.map(r => (
                        <div key={r.id} style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                          background: 'var(--bg-card)', border: `1px solid ${r.status === 'COMPLETED' ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                          borderRadius: 8, marginBottom: 6,
                        }}>
                          <div style={{
                            width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                            background: r.status === 'COMPLETED' ? 'var(--accent-green)' : 'transparent',
                            border: `2px solid ${r.status === 'COMPLETED' ? 'var(--accent-green)' : 'var(--border-light)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {r.status === 'COMPLETED' && <span style={{ color: 'white', fontSize: '0.6rem' }}>✓</span>}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 500,
                              color: r.status === 'COMPLETED' ? 'var(--text-muted)' : 'var(--text-primary)',
                              textDecoration: r.status === 'COMPLETED' ? 'line-through' : 'none' }}>
                              {r.title}
                            </div>
                            {r.startTime && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                ⏰ {r.startTime}{r.endTime ? ` – ${r.endTime}` : ''}
                              </div>
                            )}
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--accent-orange-light)' }}>🔥{r.streakCount}</span>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Ad-hoc Tasks */}
                  {dayDetail.adhocTasks?.length > 0 && (
                    <>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.08em', margin: '14px 0 10px' }}>
                        📅 Scheduled Tasks
                      </div>
                      {dayDetail.adhocTasks.map(t => (
                        <div key={t.id} style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                          background: 'var(--bg-card)', border: `1px solid ${t.completed ? 'rgba(16,185,129,0.25)' : 'var(--border)'}`,
                          borderRadius: 8, marginBottom: 6, opacity: t.completed ? 0.7 : 1,
                        }}>
                          <div style={{
                            width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                            background: t.completed ? 'var(--accent-green)' : 'transparent',
                            border: `2px solid ${t.completed ? 'var(--accent-green)' : 'var(--border-light)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {t.completed && <span style={{ color: 'white', fontSize: '0.6rem' }}>✓</span>}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)',
                              textDecoration: t.completed ? 'line-through' : 'none' }}>
                              {t.title}
                            </div>
                            {t.targetTime && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>⏰ {t.targetTime}</div>}
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-yellow)',
                            background: 'rgba(251,191,36,0.12)', borderRadius: 99, padding: '2px 7px', border: '1px solid rgba(251,191,36,0.25)' }}>
                            +{t.xpReward}XP
                          </span>
                        </div>
                      ))}
                    </>
                  )}

                  {dayDetail.mandatoryRoutines?.length === 0 && dayDetail.adhocTasks?.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: '2rem', marginBottom: 10 }}>📭</div>
                      <p style={{ fontSize: '0.85rem' }}>Nothing scheduled for this day.</p>
                      <p style={{ fontSize: '0.78rem', marginTop: 6 }}>Click "+ Add Task" to schedule something!</p>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      {/* Add Task Modal with pre-selected date */}
      {showAddTask && (
        <AddTaskModal
          defaultDate={selectedDate}
          onClose={() => setShowAddTask(false)}
          onSubmit={handleAddTask}
        />
      )}

      <div className="toast-container">
        {toasts.map(t => <Toast key={t.id} message={t.msg} type={t.type} />)}
      </div>
    </div>
  );
}
