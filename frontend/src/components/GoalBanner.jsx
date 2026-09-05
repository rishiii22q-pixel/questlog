import { Target, Flame } from 'lucide-react';

export default function GoalBanner({ goal, masterStreak = 0 }) {
  if (!goal) return null;
  return (
    <div className="goal-banner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="goal-icon"><Target size={22} style={{ color: 'var(--accent-purple-light)' }} /></div>
        <div className="goal-text">
          <div className="goal-label">🎯 Your Dream Goal</div>
          <div className="goal-value">{goal}</div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: masterStreak > 0
            ? 'linear-gradient(135deg, rgba(249,115,22,0.18), rgba(234,88,12,0.1))'
            : 'rgba(255,255,255,0.03)',
          border: masterStreak > 0
            ? '1px solid rgba(249,115,22,0.45)'
            : '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 16px',
        }}
        title="Your Master Consistency Streak! Complete all mandatory routines today to increment it."
      >
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: masterStreak > 0 ? 'rgba(249,115,22,0.2)' : 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: masterStreak > 0 ? 'var(--accent-orange)' : 'var(--text-muted)'
        }}>
          <Flame size={20} />
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Master Streak
          </div>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: 800,
            color: masterStreak > 0 ? 'var(--accent-orange-light)' : 'var(--text-secondary)'
          }}>
            {masterStreak} Day{masterStreak === 1 ? '' : 's'} {masterStreak > 0 ? '🔥' : '⚡'}
          </div>
        </div>
      </div>
    </div>
  );
}
