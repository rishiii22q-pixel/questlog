import { useState } from 'react';
import { X, Flame, Clock, Bell, Calendar } from 'lucide-react';

const DAYS_OF_WEEK = [
  { key: 'MON', label: 'Mon' },
  { key: 'TUE', label: 'Tue' },
  { key: 'WED', label: 'Wed' },
  { key: 'THU', label: 'Thu' },
  { key: 'FRI', label: 'Fri' },
  { key: 'SAT', label: 'Sat' },
  { key: 'SUN', label: 'Sun' },
];

export default function AddRoutineModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('20:00');
  const [frequencyType, setFrequencyType] = useState('DAILY'); // 'DAILY' | 'WEEKDAYS' | 'CUSTOM'
  const [selectedDays, setSelectedDays] = useState(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(10);
  const [loading, setLoading] = useState(false);

  function handleFrequencyChange(type) {
    setFrequencyType(type);
    if (type === 'DAILY') {
      setSelectedDays(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);
    } else if (type === 'WEEKDAYS') {
      setSelectedDays(['MON', 'TUE', 'WED', 'THU', 'FRI']);
    }
  }

  function toggleDay(dayKey) {
    setFrequencyType('CUSTOM');
    if (selectedDays.includes(dayKey)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== dayKey));
      }
    } else {
      setSelectedDays([...selectedDays, dayKey]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    await onSubmit({
      title: title.trim(),
      startTime: startTime || null,
      endTime: endTime || null,
      frequency: frequencyType === 'CUSTOM' ? 'WEEKLY' : frequencyType,
      daysOfWeek: selectedDays.join(','),
      reminderEnabled,
      reminderMinutesBefore: reminderMinutes,
    });
    setLoading(false);
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card">
        <div className="modal-title">
          <Flame size={20} style={{ color: 'var(--accent-orange)' }} />
          Add Mandatory Core Routine
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', color: 'var(--text-muted)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Quick Presets */}
          <div className="form-group">
            <label className="form-label">Quick Suggestions</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { name: 'Study (6 PM – 8 PM)', s: '18:00', e: '20:00' },
                { name: 'Morning Workout', s: '07:00', e: '08:00' },
                { name: 'DSA / LeetCode Practice', s: '21:00', e: '22:30' },
                { name: 'Read Book / Upskill', s: '22:00', e: '22:45' },
              ].map(preset => (
                <button
                  key={preset.name}
                  type="button"
                  className="date-nav-btn"
                  style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                  onClick={() => {
                    setTitle(preset.name);
                    setStartTime(preset.s);
                    setEndTime(preset.e);
                  }}
                >
                  + {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Routine Name *</label>
            <input
              className="form-input"
              placeholder="e.g. Study 6pm to 8pm, Workout, Project Work..."
              value={title}
              required
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* Time Range */}
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                Start Time
              </label>
              <input
                type="time"
                className="form-input"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                End Time
              </label>
              <input
                type="time"
                className="form-input"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Days / Schedule */}
          <div className="form-group" style={{ marginTop: 14 }}>
            <label className="form-label">
              <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
              Schedule Frequency
            </label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              {[
                { type: 'DAILY', label: 'Every Day (7 days)' },
                { type: 'WEEKDAYS', label: 'Weekdays (Mon-Fri)' },
                { type: 'CUSTOM', label: 'Custom Days' },
              ].map(opt => (
                <button
                  key={opt.type}
                  type="button"
                  className={`date-nav-btn ${frequencyType === opt.type ? 'active' : ''}`}
                  style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                  onClick={() => handleFrequencyChange(opt.type)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Day Selector Chips */}
            <div style={{ display: 'flex', gap: 6 }}>
              {DAYS_OF_WEEK.map(d => {
                const isSelected = selectedDays.includes(d.key);
                return (
                  <button
                    key={d.key}
                    type="button"
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: isSelected ? '1px solid var(--accent-orange)' : '1px solid var(--border)',
                      background: isSelected ? 'rgba(249, 115, 22, 0.15)' : 'var(--bg-secondary)',
                      color: isSelected ? 'var(--accent-orange)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onClick={() => toggleDay(d.key)}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Browser Notification Reminder */}
          <div className="form-group" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginTop: 14
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: reminderEnabled ? 10 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell size={16} style={{ color: 'var(--accent-purple-light)' }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Browser Alert Reminder</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>Send audio/notification alert before start time</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={e => setReminderEnabled(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent-purple)' }}
              />
            </div>

            {reminderEnabled && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Alert me:</span>
                <select
                  className="form-select"
                  value={reminderMinutes}
                  onChange={e => setReminderMinutes(parseInt(e.target.value))}
                  style={{ width: 'auto', padding: '4px 10px', fontSize: '0.78rem' }}
                >
                  <option value={5}>5 minutes before</option>
                  <option value={10}>10 minutes before</option>
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                  <option value={0}>Right at start time</option>
                </select>
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ marginTop: 20 }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading || !title.trim()}>
              {loading ? 'Adding...' : '🔥 Add Daily Routine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
