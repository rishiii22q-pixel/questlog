import { Plus, Trash2, Check } from 'lucide-react';

function getDateTagClass(label) {
  if (label === 'Today') return 'today';
  if (label === 'Tomorrow') return 'tomorrow';
  if (label === 'Overdue') return 'overdue';
  return 'future';
}

function TaskItem({ task, onToggle, onDelete }) {
  const tagClass = getDateTagClass(task.dateLabel);
  return (
    <div className={`task-item ${task.completed ? 'task-completed' : ''} ${task.dateLabel === 'Overdue' ? 'task-overdue' : ''}`}>
      <div className={`custom-checkbox ${task.completed ? 'checked' : ''}`}
        style={{ cursor: 'pointer' }} onClick={() => onToggle(task.id)}>
        {task.completed && <Check size={13} strokeWidth={3} />}
      </div>

      <div className="task-info" onClick={() => onToggle(task.id)} style={{ cursor: 'pointer' }}>
        <div className={`task-title ${task.completed ? 'completed-text' : ''}`}>
          {task.title}
        </div>
        <div className="task-meta">
          <span className={`date-tag ${tagClass}`}>{task.dateLabel}</span>
          {task.targetTime && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>⏰ {task.targetTime}</span>
          )}
        </div>
      </div>

      <span className="xp-pill">+{task.xpReward} XP</span>

      <div className="task-actions">
        <button className="btn-danger" onClick={() => onDelete(task.id)} title="Delete task">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

export default function AdHocTasksPanel({ tasks, onToggle, onDelete, onAddTask }) {
  const pending = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <div className="section-title">📅 Scheduled Ad-hoc Tasks</div>
          <div className="section-subtitle">One-off tasks — missing one never breaks your streak</div>
        </div>
        <button className="btn-primary" onClick={onAddTask}>
          <Plus size={14} /> New Task
        </button>
      </div>

      <div className="section-body">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✨</div>
            <p>No tasks scheduled for this day.</p>
            <p style={{ marginTop: 6, fontSize: '0.8rem' }}>
              Click "+ New Task" to schedule a sudden task for any date.
            </p>
          </div>
        ) : (
          <div className="task-list">
            {pending.length > 0 && (
              <>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  Pending
                </div>
                {pending.map(t => <TaskItem key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} />)}
              </>
            )}
            {completed.length > 0 && (
              <>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 12, marginBottom: 4 }}>
                  Completed
                </div>
                {completed.map(t => <TaskItem key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} />)}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
