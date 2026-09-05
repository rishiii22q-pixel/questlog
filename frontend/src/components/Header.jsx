import { Zap, LogOut, CalendarDays, LayoutDashboard } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header({ user, masterStreak }) {
  const navigate = useNavigate();
  const location = useLocation();
  const username = user?.username || localStorage.getItem('questlog_username') || 'Explorer';
  const level = user?.currentLevel || 1;
  const xp = user?.currentXp || 0;
  const xpNext = user?.xpForNextLevel || 100;
  const xpPercent = user?.xpProgressPercent || 0;

  const levelTitles = {
    1: 'Novice', 2: 'Apprentice', 3: 'Practitioner', 4: 'Specialist',
    5: 'Expert', 6: 'Master', 7: 'Tech Knight', 8: 'Architect',
    9: 'Sage', 10: 'Legend'
  };
  const title = levelTitles[Math.min(level, 10)] || 'Legend';

  function handleLogout() {
    localStorage.removeItem('questlog_user_id');
    localStorage.removeItem('questlog_username');
    navigate('/onboarding');
  }

  const isOnDashboard = location.pathname === '/dashboard';
  const isOnCalendar = location.pathname === '/calendar';

  return (
    <header className="header">
      <div className="header-logo">
        <div className="logo-icon">⚡</div>
        QuestLog
      </div>

      {/* Nav Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={() => navigate('/dashboard')}
          className={`date-nav-btn ${isOnDashboard ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: '0.82rem' }}>
          <LayoutDashboard size={13} /> Dashboard
        </button>
        <button
          onClick={() => navigate('/calendar')}
          className={`date-nav-btn ${isOnCalendar ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: '0.82rem' }}>
          <CalendarDays size={13} /> Calendar
        </button>
      </nav>

      <div className="header-center">
        {/* XP Bar */}
        <div className="xp-bar-container">
          <span className="xp-label">{xp} / {xpNext} XP</span>
          <div className="xp-bar-track">
            <div className="xp-bar-fill" style={{ width: `${Math.min(xpPercent, 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="header-right">
        {/* Level Badge */}
        <div className="level-badge">
          <Zap size={13} />
          Lv.{level} {title}
        </div>

        {/* Streak Badge — ALWAYS visible */}
        <div
          className={`streak-badge ${masterStreak > 0 ? 'streak-active' : 'streak-zero'}`}
          title={
            masterStreak > 0
              ? `🔥 ${masterStreak} Day Master Streak! All core routines were completed consecutive days.`
              : '🔥 0 Day Streak. Complete all of today’s core routines to build your streak!'
          }
        >
          <span>🔥</span>
          <span>{masterStreak || 0} Day{(masterStreak || 0) === 1 ? '' : 's'} Streak</span>
        </div>

        {/* User Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.85rem', color: 'white', flexShrink: 0,
          }}>
            {username.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            {username}
          </span>
        </div>

        <button className="btn-secondary" onClick={handleLogout} title="Switch User"
          style={{ padding: '6px 10px' }}>
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}
