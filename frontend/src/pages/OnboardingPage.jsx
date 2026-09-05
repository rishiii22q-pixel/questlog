import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser, createRoutine } from '../api/api';
import { Target, Zap, Clock, Plus, Trash2, CheckCircle } from 'lucide-react';

const STEP_GOAL = 0;
const STEP_ROUTINES = 1;
const STEP_DONE = 2;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEP_GOAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: User profile
  const [profile, setProfile] = useState({ username: '', email: '', dreamGoal: '' });

  // Step 2: Routines
  const [routines, setRoutines] = useState([]);
  const [newRoutine, setNewRoutine] = useState({
    title: '', startTime: '', endTime: '', frequency: 'DAILY',
    daysOfWeek: 'MON,TUE,WED,THU,FRI,SAT,SUN', reminderEnabled: true, reminderMinutesBefore: 10
  });

  const [userId, setUserId] = useState(null);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await createUser(profile);
      setUserId(res.data.id);
      localStorage.setItem('questlog_user_id', res.data.id);
      localStorage.setItem('questlog_username', res.data.username);
      setStep(STEP_ROUTINES);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  function addRoutineToList() {
    if (!newRoutine.title.trim()) return;
    setRoutines([...routines, { ...newRoutine }]);
    setNewRoutine({ title: '', startTime: '', endTime: '', frequency: 'DAILY',
      daysOfWeek: 'MON,TUE,WED,THU,FRI,SAT,SUN', reminderEnabled: true, reminderMinutesBefore: 10 });
  }

  function removeRoutine(idx) {
    setRoutines(routines.filter((_, i) => i !== idx));
  }

  async function handleRoutinesSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      for (const r of routines) {
        await createRoutine({ ...r, userId });
      }
      setStep(STEP_DONE);
    } catch (err) {
      setError('Failed to save routines. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleEnterDashboard() {
    navigate('/dashboard');
  }

  const steps = [STEP_GOAL, STEP_ROUTINES, STEP_DONE];

  return (
    <div className="onboarding-wrapper">
      <div className="onboarding-card">
        {/* Step indicator */}
        <div className="onboarding-step-indicator">
          {steps.map((s) => (
            <div key={s} className={`step-dot ${step === s ? 'active' : step > s ? 'done' : ''}`} />
          ))}
        </div>

        {/* STEP 0: Profile & Goal */}
        {step === STEP_GOAL && (
          <form onSubmit={handleProfileSubmit}>
            <div style={{ marginBottom: 8, fontSize: '2rem' }}>🎯</div>
            <h1 className="onboarding-title">Welcome to QuestLog</h1>
            <p className="onboarding-subtitle">
              Your personal productivity command center for students and professionals.
              Let's start by setting up your profile and defining your big goal.
            </p>

            <div className="form-group">
              <label className="form-label">Your Name / Username</label>
              <input className="form-input" placeholder="e.g. alex_dev"
                value={profile.username} required
                onChange={e => setProfile({ ...profile, username: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="you@example.com"
                value={profile.email} required
                onChange={e => setProfile({ ...profile, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Target size={13} /> Your Dream Goal
              </label>
              <input className="form-input"
                placeholder="e.g. Land a Full-Stack SDE Job by December 2026"
                value={profile.dreamGoal}
                onChange={e => setProfile({ ...profile, dreamGoal: e.target.value })} />
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: 14 }}>{error}</p>}

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              disabled={loading}>
              {loading ? 'Creating...' : 'Continue →'}
            </button>
          </form>
        )}

        {/* STEP 1: Daily Routines */}
        {step === STEP_ROUTINES && (
          <form onSubmit={handleRoutinesSubmit}>
            <div style={{ marginBottom: 8, fontSize: '2rem' }}>🔥</div>
            <h1 className="onboarding-title">Your Daily Routines</h1>
            <p className="onboarding-subtitle">
              Add the non-negotiable habits you do every day. These will track your streak.
              Example: "Study Java — 6:00 PM to 8:00 PM".
            </p>

            {/* Existing routines */}
            {routines.length > 0 && (
              <div className="routine-builder-list">
                {routines.map((r, i) => (
                  <div key={i} className="routine-builder-item">
                    <div className="routine-builder-info">
                      <span className="routine-builder-title">{r.title}</span>
                      {r.startTime && (
                        <span className="routine-builder-time">
                          <Clock size={11} /> {r.startTime}{r.endTime ? ` – ${r.endTime}` : ''} • {r.frequency}
                        </span>
                      )}
                    </div>
                    <button type="button" className="btn-danger" onClick={() => removeRoutine(i)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new routine */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Routine / Habit Title</label>
                <input className="form-input" placeholder="e.g. Study Java, Morning Workout, LeetCode"
                  value={newRoutine.title}
                  onChange={e => setNewRoutine({ ...newRoutine, title: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Start Time</label>
                  <input type="time" className="form-input" value={newRoutine.startTime}
                    onChange={e => setNewRoutine({ ...newRoutine, startTime: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">End Time</label>
                  <input type="time" className="form-input" value={newRoutine.endTime}
                    onChange={e => setNewRoutine({ ...newRoutine, endTime: e.target.value })} />
                </div>
              </div>
              <div className="form-row" style={{ marginTop: 12 }}>
                <div>
                  <label className="form-label">Frequency</label>
                  <select className="form-select" value={newRoutine.frequency}
                    onChange={e => setNewRoutine({ ...newRoutine, frequency: e.target.value })}>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Reminder Before</label>
                  <select className="form-select" value={newRoutine.reminderMinutesBefore}
                    onChange={e => setNewRoutine({ ...newRoutine, reminderMinutesBefore: parseInt(e.target.value) })}>
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                  </select>
                </div>
              </div>
              <button type="button" className="btn-secondary" style={{ marginTop: 12 }} onClick={addRoutineToList}>
                <Plus size={14} /> Add Routine
              </button>
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: 14 }}>{error}</p>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}
                style={{ flex: 1, justifyContent: 'center' }}>
                Skip for now
              </button>
              <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '12px' }}
                disabled={loading || routines.length === 0}>
                {loading ? 'Saving...' : `Save ${routines.length} Routine${routines.length !== 1 ? 's' : ''} →`}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Done */}
        {step === STEP_DONE && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🎉</div>
            <h1 className="onboarding-title" style={{ textAlign: 'center', justifyContent: 'center' }}>
              You're all set!
            </h1>
            <p className="onboarding-subtitle" style={{ textAlign: 'center' }}>
              Your QuestLog is ready. Start checking off your daily routines, add sudden tasks,
              and watch your streak grow. Consistency is your superpower!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {[
                '✅ Track daily habits with streak counters',
                '📅 Schedule sudden tasks for any date',
                '⚡ Earn XP and level up as you complete tasks',
                '🔔 Get reminded before each session',
              ].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px',
                  fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'left' }}>
                  {f}
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
              onClick={handleEnterDashboard}>
              <Zap size={16} /> Enter Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
