import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

export default function DateNavBar({ selectedDate, onDateChange }) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);

  const tabs = [
    { label: 'Yesterday', date: yesterday },
    { label: 'Today', date: today },
    { label: 'Tomorrow', date: tomorrow },
  ];

  return (
    <div className="date-nav">
      <button className="date-nav-btn" onClick={() => onDateChange(addDays(selectedDate, -1))}
        style={{ padding: '8px 12px' }}>
        <ChevronLeft size={16} />
      </button>

      {tabs.map(t => (
        <button key={t.label} className={`date-nav-btn ${selectedDate === t.date ? 'active' : ''}`}
          onClick={() => onDateChange(t.date)}>
          {t.label}
        </button>
      ))}

      <button className="date-nav-btn" onClick={() => onDateChange(addDays(selectedDate, 1))}
        style={{ padding: '8px 12px' }}>
        <ChevronRight size={16} />
      </button>

      {/* Date Picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
        <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
        <input type="date" className="date-input" value={selectedDate}
          onChange={e => onDateChange(e.target.value)} />
      </div>

      <div className="date-display" style={{ marginLeft: 'auto' }}>
        {formatDate(selectedDate)}
      </div>
    </div>
  );
}
