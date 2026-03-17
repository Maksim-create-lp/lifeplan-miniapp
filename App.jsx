import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// ==================== КОНСТАНТЫ ====================
const HABIT_ICONS = ['🧘', '📚', '💪', '💧', '🏃', '🚶', '🧠', '✍️', '🎯', '⏰', '🥗', '🍎', '💊', '😴', '🌅', '🧹', '💼', '📵', '🎨', '🎵', '🧘‍♀️', '🚴', '🏋️', '🥤', '☀️', '🌙', '💭', '📝', '🎓', '💰'];

const QUOTES = [
  { text: "Маленькие шаги каждый день приводят к большим переменам", author: "Неизвестный" },
  { text: "Дисциплина — мост между целями и достижениями", author: "Джим Рон" },
  { text: "Начни — и ты уже на полпути", author: "Зиг Зиглар" },
  { text: "Успех — сумма маленьких усилий каждый день", author: "Роберт Кольер" },
  { text: "Лучшее время начать — сейчас", author: "Китайская пословица" },
  { text: "Привычки — архитектура повседневной жизни", author: "Гретхен Рубин" },
  { text: "Каждый день делай то, чего боишься", author: "Элеонора Рузвельт" }
];

const DEFAULT_HABITS = [
  { id: 1, name: 'Медитация', icon: '🧘', timeOfDay: 'morning' },
  { id: 2, name: 'Чтение', icon: '📚', timeOfDay: 'evening' },
  { id: 3, name: 'Спорт', icon: '💪', timeOfDay: 'morning' },
  { id: 4, name: 'Вода', icon: '💧', timeOfDay: 'day' },
  { id: 5, name: 'Без соцсетей', icon: '📵', timeOfDay: 'morning' },
  { id: 6, name: 'Прогулка', icon: '🚶', timeOfDay: 'evening' },
];

// ==================== TELEGRAM ====================
const tg = window.Telegram?.WebApp;

const useTelegram = () => {
  const [colorScheme, setColorScheme] = useState(tg?.colorScheme || 'dark');

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      const handler = () => setColorScheme(tg.colorScheme || 'dark');
      tg.onEvent('themeChanged', handler);
      return () => tg.offEvent('themeChanged', handler);
    }
  }, []);

  const haptic = useCallback((type = 'light') => {
    if (!tg?.HapticFeedback) return;
    if (['light', 'medium', 'heavy'].includes(type)) tg.HapticFeedback.impactOccurred(type);
    else if (['success', 'warning', 'error'].includes(type)) tg.HapticFeedback.notificationOccurred(type);
    else if (type === 'selection') tg.HapticFeedback.selectionChanged();
  }, []);

  const save = useCallback((key, value) => {
    const data = JSON.stringify(value);
    if (tg?.CloudStorage) {
      tg.CloudStorage.setItem(key, data, () => {});
    } else {
      localStorage.setItem(`mp_${key}`, data);
    }
  }, []);

  const load = useCallback((key) => {
    return new Promise((resolve) => {
      if (tg?.CloudStorage) {
        tg.CloudStorage.getItem(key, (err, val) => resolve(val ? JSON.parse(val) : null));
      } else {
        const v = localStorage.getItem(`mp_${key}`);
        resolve(v ? JSON.parse(v) : null);
      }
    });
  }, []);

  const alert = useCallback((msg) => tg?.showAlert ? tg.showAlert(msg) : window.alert(msg), []);
  const confirm = useCallback((msg) => new Promise(r => tg?.showConfirm ? tg.showConfirm(msg, r) : r(window.confirm(msg))), []);
  const openLink = useCallback((url) => tg?.openTelegramLink ? tg.openTelegramLink(url) : window.open(url, '_blank'), []);

  return { colorScheme, haptic, save, load, alert, confirm, openLink };
};

// ==================== STYLES ====================
const useStyles = (colorScheme) => useMemo(() => {
  const dark = colorScheme === 'dark';
  const colors = {
    bg: dark ? '#0f172a' : '#ffffff',
    card: dark ? 'rgba(30,41,59,0.6)' : 'rgba(241,245,249,0.9)',
    text: dark ? '#f1f5f9' : '#1e293b',
    hint: dark ? '#64748b' : '#94a3b8',
    border: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    input: dark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.9)',
    primary: '#5BC5A7',
    primaryDark: '#3B9B7F',
    secondary: '#7C9BDB',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
  };
  return { colors, dark };
}, [colorScheme]);

// ==================== MAIN APP ====================
const App = () => {
  const { colorScheme, haptic, save, load, alert, confirm, openLink } = useTelegram();
  const { colors, dark } = useStyles(colorScheme);
  
  const [tab, setTab] = useState('today');
  const [ready, setReady] = useState(false);
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  
  const today = new Date();
  const todayKey = today.toISOString().split('T')[0];

  // STATE
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [habitHistory, setHabitHistory] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [debts, setDebts] = useState([]);
  const [savings, setSavings] = useState(0);
  const [dream, setDream] = useState({ name: '', target: 0 });
  const [profile, setProfile] = useState({ name: '', mood: 3, avatar: '' });
  const [focus, setFocus] = useState('');
  const [notes, setNotes] = useState('');

  // LOAD
  useEffect(() => {
    Promise.all([
      load(`tasks_${todayKey}`), load('habits'), load('habitHistory'), load('transactions'),
      load('subscriptions'), load('debts'), load('savings'), load('dream'), load('profile'),
      load(`focus_${todayKey}`), load(`notes_${todayKey}`)
    ]).then(([t, h, hh, tx, sub, dbt, sav, dr, pr, foc, nt]) => {
      if (t) setTasks(t);
      if (h) setHabits(h);
      if (hh) setHabitHistory(hh);
      if (tx) setTransactions(tx);
      if (sub) setSubscriptions(sub);
      if (dbt) setDebts(dbt);
      if (sav !== null) setSavings(sav);
      if (dr) setDream(dr);
      if (pr) setProfile(pr);
      if (foc) setFocus(foc);
      if (nt) setNotes(nt);
      setReady(true);
    });
  }, [todayKey, load]);

  // SAVE
  useEffect(() => { if (ready) save(`tasks_${todayKey}`, tasks); }, [tasks, ready, todayKey, save]);
  useEffect(() => { if (ready) save('habits', habits); }, [habits, ready, save]);
  useEffect(() => { if (ready) save('habitHistory', habitHistory); }, [habitHistory, ready, save]);
  useEffect(() => { if (ready) save('transactions', transactions); }, [transactions, ready, save]);
  useEffect(() => { if (ready) save('subscriptions', subscriptions); }, [subscriptions, ready, save]);
  useEffect(() => { if (ready) save('debts', debts); }, [debts, ready, save]);
  useEffect(() => { if (ready) save('savings', savings); }, [savings, ready, save]);
  useEffect(() => { if (ready) save('dream', dream); }, [dream, ready, save]);
  useEffect(() => { if (ready) save('profile', profile); }, [profile, ready, save]);
  useEffect(() => { if (ready) save(`focus_${todayKey}`, focus); }, [focus, ready, todayKey, save]);
  useEffect(() => { if (ready) save(`notes_${todayKey}`, notes); }, [notes, ready, todayKey, save]);

  // COMPUTED
  const todayHabits = habitHistory[todayKey] || {};
  const tasksDone = tasks.filter(t => t.done).length;
  const taskPct = tasks.length ? Math.round(tasksDone / tasks.length * 100) : 0;
  const habitsDone = Object.values(todayHabits).filter(Boolean).length;
  const habitPct = habits.length ? Math.round(habitsDone / habits.length * 100) : 0;
  const totalPct = Math.round((taskPct + habitPct) / 2);
  const dreamPct = dream.target > 0 ? Math.min(100, Math.round(savings / dream.target * 100)) : 0;

  const getStreak = useCallback((id) => {
    let s = 0, d = new Date(today);
    while (habitHistory[d.toISOString().split('T')[0]]?.[id]) { s++; d.setDate(d.getDate() - 1); }
    return s;
  }, [habitHistory, today]);

  const getWeek = useCallback(() => {
    const days = [], start = new Date(today);
    start.setDate(today.getDate() - today.getDay() + 1);
    for (let i = 0; i < 7; i++) { const d = new Date(start); d.setDate(start.getDate() + i); days.push(d); }
    return days;
  }, [today]);

  const formatDate = (d) => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
  };

  // STYLES
  const S = {
    app: { minHeight: '100vh', background: dark ? `linear-gradient(180deg, ${colors.bg}, #1e293b)` : colors.bg, color: colors.text, paddingBottom: 90 },
    header: { padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: dark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', zIndex: 50, borderBottom: `1px solid ${colors.border}` },
    content: { padding: '0 16px 16px' },
    card: { background: colors.card, borderRadius: 16, padding: 16, marginBottom: 12, border: `1px solid ${colors.border}` },
    input: { width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, background: colors.input, color: colors.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' },
    btn: { padding: '12px 18px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
    btnSm: { padding: '8px 14px', borderRadius: 10, border: 'none', background: colors.primary, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, background: dark ? 'rgba(15,23,42,0.98)' : 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)', borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-around', padding: '6px 0', zIndex: 100 },
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 },
    modalBox: { background: dark ? '#1e293b' : '#fff', borderRadius: 20, padding: 24, maxWidth: 340, width: '100%', maxHeight: '80vh', overflowY: 'auto' },
  };

  // LOADING
  if (!ready) return (
    <div style={{ ...S.app, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 20 }}>📋</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: colors.primary, marginBottom: 8 }}>Мой Планер</div>
      <div style={{ fontSize: 13, color: colors.hint, marginBottom: 30 }}>Загрузка...</div>
      <div style={{ fontSize: 14, fontStyle: 'italic', color: colors.text, maxWidth: 280 }}>"{quote.text}"</div>
      <div style={{ fontSize: 12, color: colors.hint, marginTop: 8 }}>— {quote.author}</div>
    </div>
  );

  // ===================== TODAY =====================
  const TodayContent = () => {
    const [newTask, setNewTask] = useState('');
    const [newTime, setNewTime] = useState('');
    const [newPri, setNewPri] = useState('medium');
    const [modal, setModal] = useState(null); // 'add' | 'edit' | null
    const [hName, setHName] = useState('');
    const [hIcon, setHIcon] = useState('🎯');
    const [hTime, setHTime] = useState('day');

    const addTask = () => {
      if (!newTask.trim()) return;
      setTasks(p => [...p, { id: Date.now(), text: newTask, time: newTime || '—', priority: newPri, done: false }]);
      setNewTask(''); setNewTime('');
      haptic('success');
    };

    const habitsByTime = { morning: habits.filter(h => h.timeOfDay === 'morning'), day: habits.filter(h => h.timeOfDay === 'day'), evening: habits.filter(h => h.timeOfDay === 'evening') };
    const priColor = (p) => p === 'high' ? colors.danger : p === 'medium' ? colors.warning : colors.success;

    return (
      <div>
        {/* Quote */}
        <div style={{ padding: '12px 16px', marginBottom: 12, background: `${colors.primary}10`, borderRadius: 12, borderLeft: `3px solid ${colors.primary}` }}>
          <div style={{ fontSize: 13, fontStyle: 'italic', lineHeight: 1.4 }}>"{quote.text}"</div>
          <div style={{ fontSize: 11, color: colors.hint, marginTop: 6 }}>— {quote.author}</div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          {[['✅', 'Задачи', tasksDone, tasks.length, taskPct, colors.primary], ['🎯', 'Привычки', habitsDone, habits.length, habitPct, colors.secondary]].map(([icon, label, done, total, pct, color], i) => (
            <div key={i} style={{ ...S.card, marginBottom: 0, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>{icon}</span><span style={{ fontSize: 12, color: colors.hint }}>{label}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{done}/{total}</div>
              <div style={{ height: 4, background: dark ? '#1e293b' : '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Focus */}
        <div style={{ ...S.card, background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}15)`, border: `1px solid ${colors.primary}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>🎯</span>
            <span style={{ fontSize: 11, color: colors.hint, textTransform: 'uppercase', letterSpacing: 0.5 }}>Главный фокус дня</span>
          </div>
          <input type="text" value={focus} onChange={e => setFocus(e.target.value)} placeholder="Что самое важное сегодня?" style={{ ...S.input, background: 'transparent', border: 'none', padding: 0, fontSize: 16, fontWeight: 500 }} />
        </div>

        {/* Tasks */}
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><span>📋</span> Задачи</div>
            <span style={{ fontSize: 12, color: colors.primary, background: `${colors.primary}15`, padding: '3px 10px', borderRadius: 12 }}>{taskPct}%</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} style={{ ...S.input, width: 90, flex: 'none', padding: 10 }} />
            <input type="text" placeholder="Новая задача..." value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} style={{ ...S.input, flex: 1, minWidth: 100 }} />
            <select value={newPri} onChange={e => setNewPri(e.target.value)} style={{ ...S.input, width: 50, flex: 'none', padding: 10 }}>
              <option value="high">🔴</option><option value="medium">🟡</option><option value="low">🟢</option>
            </select>
            <button onClick={addTask} style={S.btnSm}>+</button>
          </div>
          {tasks.length === 0 ? <div style={{ textAlign: 'center', padding: 16, color: colors.hint, fontSize: 13 }}>Добавьте задачу ☝️</div> : tasks.map(t => (
            <div key={t.id} onClick={() => { setTasks(p => p.map(x => x.id === t.id ? { ...x, done: !x.done } : x)); haptic('light'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, marginBottom: 6, background: t.done ? `${colors.primary}10` : (dark ? 'rgba(15,23,42,0.3)' : 'rgba(0,0,0,0.03)'), borderRadius: 12, cursor: 'pointer' }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${t.done ? colors.primary : priColor(t.priority)}`, background: t.done ? colors.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', flexShrink: 0 }}>{t.done && '✓'}</div>
              <div style={{ flex: 1, fontSize: 14, textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.6 : 1 }}>{t.text}</div>
              <div style={{ fontSize: 11, color: colors.hint }}>{t.time}</div>
              <button onClick={e => { e.stopPropagation(); setTasks(p => p.filter(x => x.id !== t.id)); haptic('warning'); }} style={{ background: 'none', border: 'none', color: colors.danger, fontSize: 16, cursor: 'pointer', opacity: 0.5 }}>×</button>
            </div>
          ))}
        </div>

        {/* Habits */}
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><span>🌱</span> Привычки</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setModal('edit')} style={{ ...S.btnSm, padding: '6px 10px', fontSize: 11, background: colors.hint }}>✏️</button>
              <button onClick={() => setModal('add')} style={{ ...S.btnSm, padding: '6px 12px', fontSize: 12 }}>+</button>
            </div>
          </div>
          {['morning', 'day', 'evening'].map(time => habitsByTime[time].length > 0 && (
            <div key={time} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: colors.hint, marginBottom: 8, textTransform: 'uppercase' }}>
                {time === 'morning' ? '🌅 Утро' : time === 'day' ? '☀️ День' : '🌙 Вечер'}
              </div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {habitsByTime[time].map(h => {
                  const done = todayHabits[h.id];
                  const streak = getStreak(h.id);
                  return (
                    <div key={h.id} onClick={() => { setHabitHistory(p => ({ ...p, [todayKey]: { ...(p[todayKey] || {}), [h.id]: !done } })); haptic('medium'); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 8px', minWidth: 72, background: done ? `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)` : (dark ? 'rgba(15,23,42,0.4)' : 'rgba(0,0,0,0.03)'), borderRadius: 14, cursor: 'pointer', border: done ? `1px solid ${colors.primary}40` : '1px solid transparent', position: 'relative' }}>
                      <div style={{ fontSize: 24, marginBottom: 4, filter: done ? 'none' : 'grayscale(0.5)', opacity: done ? 1 : 0.6 }}>{h.icon}</div>
                      <div style={{ fontSize: 10, textAlign: 'center', color: done ? colors.text : colors.hint, maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</div>
                      {streak > 0 && <div style={{ fontSize: 9, color: colors.warning, marginTop: 4 }}>🔥 {streak}</div>}
                      {done && <div style={{ position: 'absolute', top: 4, right: 4, fontSize: 10, color: colors.primary }}>✓</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {habits.length === 0 && <div style={{ textAlign: 'center', padding: 16, color: colors.hint, fontSize: 13 }}>Добавьте привычку ☝️</div>}
        </div>

        {/* Notes */}
        <div style={S.card}>
          <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}><span>📝</span> Заметки</div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Мысли, идеи, благодарности..." style={{ ...S.input, minHeight: 60, resize: 'vertical', lineHeight: 1.5 }} />
        </div>

        {/* Add Modal */}
        {modal === 'add' && (
          <div style={S.modal} onClick={() => setModal(null)}>
            <div style={S.modalBox} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, textAlign: 'center' }}>Новая привычка</h3>
              <input type="text" placeholder="Название" value={hName} onChange={e => setHName(e.target.value)} style={{ ...S.input, marginBottom: 12 }} />
              <div style={{ fontSize: 13, color: colors.hint, marginBottom: 8 }}>Иконка</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {HABIT_ICONS.map(icon => (
                  <button key={icon} onClick={() => setHIcon(icon)} style={{ width: 40, height: 40, borderRadius: 10, border: hIcon === icon ? `2px solid ${colors.primary}` : '2px solid transparent', background: hIcon === icon ? `${colors.primary}20` : (dark ? 'rgba(15,23,42,0.4)' : 'rgba(0,0,0,0.05)'), fontSize: 20, cursor: 'pointer' }}>{icon}</button>
                ))}
              </div>
              <div style={{ fontSize: 13, color: colors.hint, marginBottom: 8 }}>Время дня</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[['morning', '🌅 Утро'], ['day', '☀️ День'], ['evening', '🌙 Вечер']].map(([v, l]) => (
                  <button key={v} onClick={() => setHTime(v)} style={{ flex: 1, padding: 10, borderRadius: 10, border: hTime === v ? `2px solid ${colors.primary}` : '2px solid transparent', background: hTime === v ? `${colors.primary}20` : (dark ? 'rgba(15,23,42,0.4)' : 'rgba(0,0,0,0.05)'), fontSize: 12, cursor: 'pointer', color: colors.text }}>{l}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setModal(null)} style={{ ...S.btn, flex: 1, background: colors.hint }}>Отмена</button>
                <button onClick={() => { if (hName.trim()) { setHabits(p => [...p, { id: Date.now(), name: hName, icon: hIcon, timeOfDay: hTime }]); haptic('success'); } setModal(null); setHName(''); }} style={{ ...S.btn, flex: 1 }}>Добавить</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {modal === 'edit' && (
          <div style={S.modal} onClick={() => setModal(null)}>
            <div style={S.modalBox} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, textAlign: 'center' }}>Управление привычками</h3>
              {habits.length === 0 ? <div style={{ textAlign: 'center', padding: 20, color: colors.hint }}>Нет привычек</div> : habits.map(h => (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, marginBottom: 8, background: dark ? 'rgba(15,23,42,0.4)' : 'rgba(0,0,0,0.03)', borderRadius: 12 }}>
                  <span style={{ fontSize: 20 }}>{h.icon}</span>
                  <span style={{ flex: 1, fontSize: 14 }}>{h.name}</span>
                  <span style={{ fontSize: 10, color: colors.hint }}>{h.timeOfDay === 'morning' ? '🌅' : h.timeOfDay === 'day' ? '☀️' : '🌙'}</span>
                  <button onClick={async () => { if (await confirm('Удалить привычку?')) { setHabits(p => p.filter(x => x.id !== h.id)); haptic('warning'); } }} style={{ background: 'none', border: 'none', color: colors.danger, fontSize: 18, cursor: 'pointer' }}>×</button>
                </div>
              ))}
              <button onClick={() => setModal(null)} style={{ ...S.btn, width: '100%', marginTop: 8 }}>Готово</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ===================== WEEK =====================
  const WeekContent = () => {
    const week = getWeek();
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

    let weekDone = 0, weekTotal = 0;
    const dailyPct = week.map(d => {
      const key = d.toISOString().split('T')[0];
      const dh = habitHistory[key] || {};
      const done = Object.values(dh).filter(Boolean).length;
      weekDone += done;
      weekTotal += habits.length;
      return { date: d, key, pct: habits.length ? Math.round(done / habits.length * 100) : 0 };
    });
    const weekPct = weekTotal ? Math.round(weekDone / weekTotal * 100) : 0;

    // Month
    let monthDone = 0, monthTotal = 0;
    for (let i = 1; i <= today.getDate(); i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), i);
      const key = d.toISOString().split('T')[0];
      const dh = habitHistory[key] || {};
      monthDone += Object.values(dh).filter(Boolean).length;
      monthTotal += habits.length;
    }
    const monthPct = monthTotal ? Math.round(monthDone / monthTotal * 100) : 0;

    return (
      <div>
        {/* Progress */}
        <div style={{ ...S.card, background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}15)`, border: `1px solid ${colors.primary}30` }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: colors.hint, textTransform: 'uppercase', marginBottom: 6 }}>Прогресс недели</div>
            <div style={{ fontSize: 42, fontWeight: 800, color: colors.primary }}>{weekPct}%</div>
            <div style={{ fontSize: 12, color: colors.hint }}>{weekPct >= 70 ? '🔥 Отлично!' : weekPct >= 40 ? '💪 Хорошо!' : '🚀 Вперёд!'}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
            {[[weekPct, colors.primary, 'Неделя'], [monthPct, colors.secondary, 'Месяц']].map(([pct, color, label], i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: `conic-gradient(${color} ${pct * 3.6}deg, ${color}20 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: dark ? '#1e293b' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color }}>{pct}%</div>
                </div>
                <div style={{ fontSize: 10, color: colors.hint, marginTop: 6 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div style={S.card}>
          <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><span>📈</span> По дням</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 80, gap: 4 }}>
            {dailyPct.map((d, i) => {
              const isToday = d.key === todayKey;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', maxWidth: 28, height: `${Math.max(d.pct, 8)}%`, minHeight: 6, background: isToday ? colors.primary : d.pct >= 70 ? `${colors.primary}80` : d.pct >= 40 ? `${colors.warning}80` : `${colors.hint}50`, borderRadius: 4 }} />
                  <div style={{ fontSize: 9, color: isToday ? colors.primary : colors.hint }}>{dayNames[d.date.getDay()]}</div>
                  <div style={{ fontSize: 10, fontWeight: isToday ? 700 : 500, color: isToday ? colors.primary : colors.text }}>{d.date.getDate()}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Habit Matrix */}
        <div style={S.card}>
          <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><span>🗓️</span> Привычки за неделю</div>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 300 }}>
              {habits.map(h => (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 70, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <span>{h.icon}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flex: 1, justifyContent: 'flex-end' }}>
                    {dailyPct.map((d, i) => {
                      const done = habitHistory[d.key]?.[h.id];
                      return <div key={i} style={{ width: 26, height: 26, borderRadius: 6, background: done ? colors.primary : (dark ? 'rgba(100,116,139,0.2)' : 'rgba(100,116,139,0.1)'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff' }}>{done && '✓'}</div>;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Streaks */}
        <div style={S.card}>
          <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><span>🔥</span> Серии</div>
          {habits.map(h => {
            const streak = getStreak(h.id);
            return (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, marginBottom: 6, background: dark ? 'rgba(15,23,42,0.3)' : 'rgba(0,0,0,0.03)', borderRadius: 10 }}>
                <span style={{ fontSize: 20 }}>{h.icon}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{h.name}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: streak > 0 ? colors.warning : colors.hint }}>{streak > 0 ? `🔥 ${streak} дн.` : '—'}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ===================== FINANCE =====================
  const FinanceContent = () => {
    const [subTab, setSubTab] = useState('main');
    const [text, setText] = useState('');
    const [amount, setAmount] = useState('');
    const [cat, setCat] = useState('Еда');
    const [type, setType] = useState('expense');
    const [subName, setSubName] = useState('');
    const [subAmt, setSubAmt] = useState('');
    const [debtName, setDebtName] = useState('');
    const [debtAmt, setDebtAmt] = useState('');
    const [debtType, setDebtType] = useState('owe');

    const cats = ['Еда', 'Транспорт', 'Развлечения', 'Здоровье', 'Образование', 'Подписки', 'Зарплата', 'Подработка', 'Другое'];
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const subTotal = subscriptions.reduce((s, x) => s + x.amount, 0);
    const iOwe = debts.filter(d => d.type === 'owe').reduce((s, d) => s + d.amount, 0);
    const owedMe = debts.filter(d => d.type === 'owed').reduce((s, d) => s + d.amount, 0);

    return (
      <div>
        {/* Dream */}
        <div style={{ ...S.card, background: `linear-gradient(135deg, ${colors.warning}15, ${colors.primary}10)`, border: `1px solid ${colors.warning}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>🌟</span>
            <input type="text" value={dream.name} onChange={e => setDream(p => ({ ...p, name: e.target.value }))} placeholder="Моя мечта..." style={{ ...S.input, background: 'transparent', border: 'none', padding: 0, fontSize: 16, fontWeight: 600, flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: colors.hint, marginBottom: 4 }}>Накоплено</div>
              <input type="number" value={savings || ''} onChange={e => setSavings(+e.target.value || 0)} placeholder="0" style={{ ...S.input, fontSize: 18, fontWeight: 700, color: colors.success }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: colors.hint, marginBottom: 4 }}>Цель</div>
              <input type="number" value={dream.target || ''} onChange={e => setDream(p => ({ ...p, target: +e.target.value || 0 }))} placeholder="0" style={{ ...S.input, fontSize: 18, fontWeight: 700 }} />
            </div>
          </div>
          <div style={{ height: 4, background: dark ? '#1e293b' : '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${dreamPct}%`, background: `linear-gradient(90deg, ${colors.warning}, ${colors.primary})`, borderRadius: 2 }} />
          </div>
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 14, fontWeight: 600, color: colors.warning }}>{dreamPct}% достигнуто</div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {[['main', '💰 Главное'], ['subs', '📱 Подписки'], ['debts', '📋 Долги']].map(([id, label]) => (
            <button key={id} onClick={() => { setSubTab(id); haptic('selection'); }} style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', background: subTab === id ? colors.primary : (dark ? 'rgba(30,41,59,0.6)' : 'rgba(0,0,0,0.05)'), color: subTab === id ? '#fff' : colors.text, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>{label}</button>
          ))}
        </div>

        {subTab === 'main' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
              {[['Доходы', income, colors.success, '+'], ['Расходы', expense, colors.danger, '-'], ['Баланс', income - expense, income - expense >= 0 ? colors.primary : colors.danger, '']].map(([label, val, color, prefix], i) => (
                <div key={i} style={{ ...S.card, marginBottom: 0, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: colors.hint }}>{label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color }}>{prefix}{val.toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div style={S.card}>
              <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><span>➕</span> Добавить</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                <button onClick={() => setType('income')} style={{ ...S.btnSm, flex: 1, background: type === 'income' ? colors.success : `${colors.success}30`, color: type === 'income' ? '#fff' : colors.success }}>↓ Доход</button>
                <button onClick={() => setType('expense')} style={{ ...S.btnSm, flex: 1, background: type === 'expense' ? colors.danger : `${colors.danger}30`, color: type === 'expense' ? '#fff' : colors.danger }}>↑ Расход</button>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <input type="text" placeholder="Описание" value={text} onChange={e => setText(e.target.value)} style={{ ...S.input, flex: 1, minWidth: 100 }} />
                <input type="number" placeholder="Сумма" value={amount} onChange={e => setAmount(e.target.value)} style={{ ...S.input, width: 80, flex: 'none' }} />
                <select value={cat} onChange={e => setCat(e.target.value)} style={{ ...S.input, width: 100, flex: 'none' }}>{cats.map(c => <option key={c}>{c}</option>)}</select>
                <button onClick={() => { if (text.trim() && +amount > 0) { setTransactions(p => [...p, { id: Date.now(), date: todayKey, text, amount: +amount, category: cat, type }]); haptic('success'); setText(''); setAmount(''); } }} style={S.btnSm}>+</button>
              </div>
            </div>

            <div style={S.card}>
              <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}><span>📜</span> История</div>
              {transactions.length === 0 ? <div style={{ textAlign: 'center', padding: 16, color: colors.hint, fontSize: 13 }}>Нет транзакций</div> : transactions.slice().reverse().slice(0, 10).map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, marginBottom: 6, background: dark ? 'rgba(15,23,42,0.3)' : 'rgba(0,0,0,0.03)', borderRadius: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13 }}>{t.text}</div>
                    <div style={{ fontSize: 10, color: colors.hint }}>{t.category}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: t.type === 'income' ? colors.success : colors.danger }}>{t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}</div>
                  <button onClick={() => { setTransactions(p => p.filter(x => x.id !== t.id)); haptic('warning'); }} style={{ background: 'none', border: 'none', color: colors.danger, fontSize: 14, cursor: 'pointer', opacity: 0.5 }}>×</button>
                </div>
              ))}
            </div>
          </>
        )}

        {subTab === 'subs' && (
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><span>📱</span> Подписки</div>
              <span style={{ fontSize: 13, color: colors.danger }}>{subTotal.toLocaleString()} ₽/мес</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              <input type="text" placeholder="Название" value={subName} onChange={e => setSubName(e.target.value)} style={{ ...S.input, flex: 1 }} />
              <input type="number" placeholder="₽/мес" value={subAmt} onChange={e => setSubAmt(e.target.value)} style={{ ...S.input, width: 80, flex: 'none' }} />
              <button onClick={() => { if (subName.trim()) { setSubscriptions(p => [...p, { id: Date.now(), name: subName, amount: +subAmt || 0 }]); haptic('success'); setSubName(''); setSubAmt(''); } }} style={S.btnSm}>+</button>
            </div>
            {subscriptions.length === 0 ? <div style={{ textAlign: 'center', padding: 16, color: colors.hint, fontSize: 13 }}>Нет подписок</div> : subscriptions.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, marginBottom: 6, background: dark ? 'rgba(15,23,42,0.3)' : 'rgba(0,0,0,0.03)', borderRadius: 10 }}>
                <span style={{ flex: 1, fontSize: 13 }}>{s.name}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.danger }}>{s.amount} ₽</span>
                <button onClick={() => { setSubscriptions(p => p.filter(x => x.id !== s.id)); haptic('warning'); }} style={{ background: 'none', border: 'none', color: colors.danger, fontSize: 14, cursor: 'pointer', opacity: 0.5 }}>×</button>
              </div>
            ))}
          </div>
        )}

        {subTab === 'debts' && (
          <div style={S.card}>
            <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><span>📋</span> Долги</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div style={{ padding: 10, background: `${colors.danger}15`, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: colors.hint }}>Я должен</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: colors.danger }}>{iOwe.toLocaleString()} ₽</div>
              </div>
              <div style={{ padding: 10, background: `${colors.success}15`, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: colors.hint }}>Мне должны</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: colors.success }}>{owedMe.toLocaleString()} ₽</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <button onClick={() => setDebtType('owe')} style={{ ...S.btnSm, flex: 1, background: debtType === 'owe' ? colors.danger : `${colors.danger}30`, color: debtType === 'owe' ? '#fff' : colors.danger }}>Я должен</button>
              <button onClick={() => setDebtType('owed')} style={{ ...S.btnSm, flex: 1, background: debtType === 'owed' ? colors.success : `${colors.success}30`, color: debtType === 'owed' ? '#fff' : colors.success }}>Мне должны</button>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              <input type="text" placeholder="Кому/от кого" value={debtName} onChange={e => setDebtName(e.target.value)} style={{ ...S.input, flex: 1 }} />
              <input type="number" placeholder="Сумма" value={debtAmt} onChange={e => setDebtAmt(e.target.value)} style={{ ...S.input, width: 80, flex: 'none' }} />
              <button onClick={() => { if (debtName.trim()) { setDebts(p => [...p, { id: Date.now(), name: debtName, amount: +debtAmt || 0, type: debtType }]); haptic('success'); setDebtName(''); setDebtAmt(''); } }} style={S.btnSm}>+</button>
            </div>
            {debts.length === 0 ? <div style={{ textAlign: 'center', padding: 16, color: colors.hint, fontSize: 13 }}>Нет долгов 🎉</div> : debts.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, marginBottom: 6, background: dark ? 'rgba(15,23,42,0.3)' : 'rgba(0,0,0,0.03)', borderRadius: 10 }}>
                <span style={{ flex: 1, fontSize: 13 }}>{d.name}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: d.type === 'owe' ? colors.danger : colors.success }}>{d.amount.toLocaleString()} ₽</span>
                <button onClick={() => { setDebts(p => p.filter(x => x.id !== d.id)); haptic('warning'); }} style={{ background: 'none', border: 'none', color: colors.danger, fontSize: 14, cursor: 'pointer', opacity: 0.5 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ===================== PROFILE =====================
  const ProfileContent = () => {
    const [ugc, setUgc] = useState({ name: '', ig: '', tt: '', aud: '' });
    const [sent, setSent] = useState(false);
    const fileRef = useRef(null);
    const moods = ['😢', '😕', '😐', '🙂', '😄'];

    return (
      <div>
        <div style={S.card}>
          <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><span>👤</span> Профиль</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div onClick={() => fileRef.current?.click()} style={{ width: 70, height: 70, borderRadius: 20, background: profile.avatar ? `url(${profile.avatar}) center/cover` : `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, cursor: 'pointer' }}>{!profile.avatar && (profile.name?.[0]?.toUpperCase() || '👤')}</div>
              <input ref={fileRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { if (f.size > 2*1024*1024) { alert('Макс. 2MB'); return; } const r = new FileReader(); r.onloadend = () => { setProfile(p => ({...p, avatar: r.result})); haptic('success'); }; r.readAsDataURL(f); } }} style={{ display: 'none' }} />
              <div style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: '50%', background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>📷</div>
            </div>
            <input type="text" placeholder="Ваше имя" value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))} style={{ ...S.input, flex: 1, fontSize: 16, fontWeight: 600 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[[Object.keys(habitHistory).length, 'Дней активности', colors.primary], [transactions.length, 'Транзакций', colors.secondary]].map(([val, label, color], i) => (
              <div key={i} style={{ background: dark ? 'rgba(15,23,42,0.4)' : 'rgba(0,0,0,0.03)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color }}>{val}</div>
                <div style={{ fontSize: 11, color: colors.hint }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={S.card}>
          <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><span>😊</span> Настроение</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
            {moods.map((m, i) => (
              <button key={i} onClick={() => { setProfile(p => ({...p, mood: i})); haptic('selection'); }} style={{ flex: 1, padding: '12px 8px', borderRadius: 12, border: profile.mood === i ? `2px solid ${colors.warning}` : '2px solid transparent', background: profile.mood === i ? `${colors.warning}20` : (dark ? 'rgba(15,23,42,0.4)' : 'rgba(0,0,0,0.03)'), fontSize: 22, cursor: 'pointer' }}>{m}</button>
            ))}
          </div>
        </div>

        {/* UGC */}
        <div style={{ ...S.card, background: `linear-gradient(135deg, ${colors.warning}10, ${colors.danger}05)`, border: `1px solid ${colors.warning}30` }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px', color: colors.warning }}>Стань UGC-креатором!</h2>
            <p style={{ fontSize: 12, color: colors.hint, margin: 0 }}>Зарабатывай на контенте</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {[['💵', '5 000 ₽', 'за обзор'], ['📈', 'до 40%', 'с продаж'], ['🎁', 'Бесплатно', 'планеры'], ['🤝', 'Поддержка', 'команды']].map(([icon, val, desc], i) => (
              <div key={i} style={{ background: dark ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.6)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 18 }}>{icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: colors.warning }}>{val}</div>
                <div style={{ fontSize: 9, color: colors.hint }}>{desc}</div>
              </div>
            ))}
          </div>

          {!sent ? (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                <input type="text" placeholder="Ваше имя *" value={ugc.name} onChange={e => setUgc(p => ({...p, name: e.target.value}))} style={S.input} />
                <input type="text" placeholder="Instagram @" value={ugc.ig} onChange={e => setUgc(p => ({...p, ig: e.target.value}))} style={S.input} />
                <input type="text" placeholder="TikTok @" value={ugc.tt} onChange={e => setUgc(p => ({...p, tt: e.target.value}))} style={S.input} />
                <input type="text" placeholder="Размер аудитории" value={ugc.aud} onChange={e => setUgc(p => ({...p, aud: e.target.value}))} style={S.input} />
              </div>
              <button onClick={() => { if (ugc.name) { setSent(true); haptic('success'); } else alert('Введите имя'); }} style={{ ...S.btn, width: '100%', background: `linear-gradient(135deg, ${colors.warning}, #d97706)` }}>Отправить заявку 🚀</button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: colors.primary }}>Заявка отправлена!</div>
            </div>
          )}

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: colors.hint, marginBottom: 10 }}>Или напишите напрямую:</p>
            <button onClick={() => openLink('https://t.me/abramotti')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: 'rgba(0,136,204,0.1)', borderRadius: 12, color: '#00a8e8', border: '1px solid rgba(0,136,204,0.2)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>✈️ @abramotti</button>
          </div>
        </div>
      </div>
    );
  };

  // ===================== RENDER =====================
  const tabs = [
    { id: 'today', icon: '📅', label: 'Сегодня' },
    { id: 'week', icon: '📊', label: 'Неделя' },
    { id: 'finance', icon: '💰', label: 'Финансы' },
    { id: 'profile', icon: '👤', label: 'Профиль' },
  ];

  return (
    <div style={S.app}>
      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📋</div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: colors.primary }}>Мой Планер</h1>
            <p style={{ fontSize: 10, color: colors.hint, margin: 0 }}>{formatDate(today)}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: totalPct >= 70 ? colors.primary : colors.warning }}>{totalPct}%</div>
          <div style={{ fontSize: 9, color: colors.hint }}>прогресс</div>
        </div>
      </header>

      <div style={S.content}>
        {tab === 'today' && <TodayContent />}
        {tab === 'week' && <WeekContent />}
        {tab === 'finance' && <FinanceContent />}
        {tab === 'profile' && <ProfileContent />}
      </div>

      <nav style={S.nav}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); haptic('selection'); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', color: tab === t.id ? colors.primary : colors.hint, cursor: 'pointer', fontSize: 10, fontWeight: tab === t.id ? 600 : 400, padding: '6px 12px' }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
