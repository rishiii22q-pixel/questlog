import { useState } from 'react';
import { X, CalendarPlus } from 'lucide-react';

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

export default function AddTaskModal({ defaultDate, onClose, onSubmit }) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = addDays(today, 1);

  const [form, setForm] = useState({
    title: '',
    targetDate: defaultDate || tomorrow,
    targetTime: '',
    xpReward: 25,
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card">
        <div className="modal-title">
          <CalendarPlus size={20} style={{ color: 'var(--accent-purple-light)' }} />
          Schedule a Sudden Task
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', color: 'var(--text-muted)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input className="form-input" placeholder="e.g. Review server logs, Client call prep..."
              value={form.title} required
              onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>

          {/* Quick date buttons */}
          <div className="form-group">
            <label className="form-label">Target Date</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              {[
                { label: 'Today', date: today },
                { label: 'Tomorrow', date: tomorrow },
                { label: 'In 2 Days', date: addDays(today, 2) },
                { label: 'This Friday', date: (() => {
                  const d = new Date(today + 'T00:00:00');
                  const diff = (5 - d.getDay() + 7) % 7 || 7;
                  return addDays(today, diff);
                })() },
              ].map(q => (
                <button key={q.label} type="button"
                  className={`date-nav-btn ${form.targetDate === q.date ? 'active' : ''}`}
                  style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                  onClick={() => setForm({ ...form, targetDate: q.date })}>
                  {q.label}
                </button>
              ))}
            </div>
            <input type="date" className="form-input" value={form.targetDate} min={today}
              onChange={e => setForm({ ...form, targetDate: e.target.value })} />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Time (Optional)</label>
              <input type="time" className="form-input" value={form.targetTime}
                onChange={e => setForm({ ...form, targetTime: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">XP Reward</label>
              <select className="form-select" value={form.xpReward}
                onChange={e => setForm({ ...form, xpReward: parseInt(e.target.value) })}>
                <option value={10}>+10 XP (Quick)</option>
                <option value={25}>+25 XP (Standard)</option>
                <option value={50}>+50 XP (Important)</option>
                <option value={100}>+100 XP (Critical)</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading || !form.title.trim()}>
              {loading ? 'Scheduling...' : '📅 Schedule Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
