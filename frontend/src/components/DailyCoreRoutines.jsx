import { Check, Clock, Bell, Trash2, Plus } from 'lucide-react';

function CheckIcon({ checked }) {
  return (
    <div className={`custom-checkbox ${checked ? 'checked' : ''}`}>
      {checked && <Check size={13} strokeWidth={3} />}
    </div>
  );
}

function RoutineItem({ routine, onToggle, onDelete }) {
  const isCompleted = routine.status === 'COMPLETED';
  const isMissed = routine.status === 'MISSED';

  return (
    <div
      className={`routine-item ${isCompleted ? 'completed' : ''} ${isMissed ? 'missed' : ''}`}
      onClick={() => onToggle(routine.id)}
    >
      <CheckIcon checked={isCompleted} />
      <div className="routine-info">
        <div className={`routine-title ${isCompleted ? 'completed-text' : ''}`}>
          {routine.title}
        </div>
        {(routine.startTime || routine.frequency !== 'DAILY') && (
          <div className="routine-time">
            {routine.startTime && (
              <>
                <Clock size={11} />
                {routine.startTime}{routine.endTime ? ` – ${routine.endTime}` : ''}
              </>
            )}
            {routine.frequency !== 'DAILY' && (
              <span style={{ marginLeft: 4, background: 'var(--bg-secondary)',
                border: '1px solid var(--border)', borderRadius: 4, padding: '0 5px', fontSize: '0.68rem' }}>
                {routine.frequency}
              </span>
            )}
            {routine.reminderEnabled && (
              <Bell size={10} style={{ color: 'var(--accent-purple-light)', marginLeft: 4 }} />
            )}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="streak-tag">
          🔥 {routine.streakCount}d
        </div>
        {onDelete && (
          <button
            className="task-delete-btn"
            title="Delete routine"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(routine.id);
            }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function DailyCoreRoutines({ routines, completedCount, totalCount, onToggle, onAddRoutine, onDeleteRoutine }) {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <div className="section-title">🔥 Daily Core Routines</div>
          <div className="section-subtitle">Non-negotiable habits that protect your streak</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {totalCount > 0 && (
            <span className="progress-pill">
              {completedCount}/{totalCount}
            </span>
          )}
          <button
            className="btn-primary"
            style={{ padding: '6px 13px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5 }}
            onClick={onAddRoutine}
          >
            <Plus size={14} /> Add Routine
          </button>
        </div>
      </div>

      <div className="section-body">
        {totalCount > 0 && (
          <div className="completion-bar-container">
            <div className="completion-label">{percent}% complete today</div>
            <div className="completion-bar-track">
              <div className="completion-bar-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>
        )}

        {routines.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🗓️</div>
            <p>No routines scheduled for this day.</p>
            <button
              className="btn-primary"
              style={{ marginTop: 12, padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              onClick={onAddRoutine}
            >
              <Plus size={15} /> Add Your First Core Routine
            </button>
          </div>
        ) : (
          <div className="routine-list">
            {routines.map(r => (
              <RoutineItem
                key={r.id}
                routine={r}
                onToggle={onToggle}
                onDelete={onDeleteRoutine}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
