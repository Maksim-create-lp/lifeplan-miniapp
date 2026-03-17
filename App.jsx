import React, { useState, useEffect, useCallback, useRef } from 'react';

// ==================== КОНСТАНТЫ ====================
const HABIT_ICONS = [
  '🧘', '📚', '💪', '💧', '🏃', '🚶', '🧠', '✍️', '🎯', '⏰',
  '🥗', '🍎', '💊', '😴', '🌅', '🧹', '💼', '📵', '🎨', '🎵',
  '🧘‍♀️', '🚴', '🏋️', '🥤', '☀️', '🌙', '💭', '📝', '🎓', '💰'
];

// ==================== TELEGRAM HOOK ====================
const useTelegram = () => {
  const tg = window.Telegram?.WebApp;
  const [isReady, setIsReady] = useState(false);
  const [colorScheme, setColorScheme] = useState('dark');

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      setColorScheme(tg.colorScheme || 'dark');
      tg.onEvent('themeChanged', () => setColorScheme(tg.colorScheme || 'dark'));
      setIsReady(true);
    } else {
      setIsReady(true);
    }
  }, []);

  const haptic = useCallback((type = 'light') => {
    if (tg?.HapticFeedback) {
      if (['light', 'medium', 'heavy'].includes(type)) tg.HapticFeedback.impactOccurred(type);
      else if (['success', 'warning', 'error'].includes(type)) tg.HapticFeedback.notificationOccurred(type);
      else if (type === 'selection') tg.HapticFeedback.selectionChanged();
    }
  }, []);

  const showBackButton = useCallback((onClick) => { if (tg?.BackButton) { tg.BackButton.onClick(onClick); tg.BackButton.show(); } }, []);
  const hideBackButton = useCallback(() => { if (tg?.BackButton) tg.BackButton.hide(); }, []);

  const saveToCloud = useCallback(async (key, value) => {
    return new Promise((resolve, reject) => {
      if (tg?.CloudStorage) {
        tg.CloudStorage.setItem(key, JSON.stringify(value), (err, ok) => err ? reject(err) : resolve(ok));
      } else {
        try { localStorage.setItem(`myplanner_${key}`, JSON.stringify(value)); resolve(true); } catch (e) { reject(e); }
      }
    });
  }, []);

  const loadFromCloud = useCallback(async (key) => {
    return new Promise((resolve, reject) => {
      if (tg?.CloudStorage) {
        tg.CloudStorage.getItem(key, (err, val) => err ? reject(err) : resolve(val ? JSON.parse(val) : null));
      } else {
        try { const v = localStorage.getItem(`myplanner_${key}`); resolve(v ? JSON.parse(v) : null); } catch (e) { reject(e); }
      }
    });
  }, []);

  const showAlert = useCallback((msg) => { tg?.showAlert ? tg.showAlert(msg) : alert(msg); }, []);
  const showConfirm = useCallback((msg) => new Promise(res => tg?.showConfirm ? tg.showConfirm(msg, res) : res(window.confirm(msg))), []);
  const openTelegramLink = useCallback((url) => { tg?.openTelegramLink ? tg.openTelegramLink(url) : window.open(url, '_blank'); }, []);

  return { tg, isReady, colorScheme, haptic, showBackButton, hideBackButton, saveToCloud, loadFromCloud, showAlert, showConfirm, openTelegramLink };
};

// ==================== STYLES ====================
const getStyles = (colorScheme) => {
  const isDark = colorScheme === 'dark';
  const colors = {
    bg: isDark ? '#0f172a' : '#ffffff',
    secondaryBg: isDark ? '#1e293b' : '#f1f5f9',
    text: isDark ? '#f1f5f9' : '#1e293b',
    hint: isDark ? '#64748b' : '#94a3b8',
    primary: '#5BC5A7',
    primaryDark: '#3B9B7F',
    secondary: '#7C9BDB',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    cardBg: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(241, 245, 249, 0.9)',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    inputBg: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.9)',
    inputBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  };

  return {
    colors, isDark,
    app: { minHeight: '100vh', background: isDark ? `linear-gradient(180deg, ${colors.bg}, ${colors.secondaryBg})` : colors.bg, color: colors.text, paddingBottom: '90px' },
    header: { padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', zIndex: 50, borderBottom: `1px solid ${colors.cardBorder}` },
    content: { padding: '0 16px 16px' },
    card: { background: colors.cardBg, borderRadius: '16px', padding: '16px', marginBottom: '12px', border: `1px solid ${colors.cardBorder}` },
    cardTitle: { fontSize: '15px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: colors.text },
    input: { width: '100%', padding: '12px 14px', borderRadius: '12px', border: `1px solid ${colors.inputBorder}`, background: colors.inputBg, color: colors.text, fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
    button: { padding: '12px 18px', borderRadius: '12px', border: 'none', background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`, color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    buttonSmall: { padding: '8px 14px', borderRadius: '10px', border: 'none', background: colors.primary, color: 'white', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, background: isDark ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(20px)', borderTop: `1px solid ${colors.cardBorder}`, display: 'flex', justifyContent: 'space-around', padding: '6px 0 env(safe-area-inset-bottom, 6px)', zIndex: 100 },
    navItem: (active, colors) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', color: active ? colors.primary : colors.hint, cursor: 'pointer', fontSize: '10px', fontWeight: active ? '600' : '400', padding: '6px 12px' }),
    progressBar: { height: '4px', background: isDark ? '#1e293b' : '#e2e8f0', borderRadius: '2px', overflow: 'hidden' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' },
    modalContent: { background: isDark ? '#1e293b' : '#ffffff', borderRadius: '20px', padding: '24px', maxWidth: '340px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }
  };
};

// ==================== MAIN APP ====================
const App = () => {
  const { isReady, colorScheme, haptic, showBackButton, hideBackButton, saveToCloud, loadFromCloud, showAlert, showConfirm, openTelegramLink } = useTelegram();
  const styles = getStyles(colorScheme);
  const { colors, isDark } = styles;

  const [activeTab, setActiveTab] = useState('today');
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date();
  const todayKey = today.toISOString().split('T')[0];

  // ===== СОСТОЯНИЯ =====
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([
    { id: 1, name: 'Медитация', icon: '🧘', timeOfDay: 'morning' },
    { id: 2, name: 'Чтение', icon: '📚', timeOfDay: 'evening' },
    { id: 3, name: 'Спорт', icon: '💪', timeOfDay: 'morning' },
    { id: 4, name: 'Вода', icon: '💧', timeOfDay: 'day' },
    { id: 5, name: 'Без соцсетей', icon: '📵', timeOfDay: 'morning' },
    { id: 6, name: 'Прогулка', icon: '🚶', timeOfDay: 'evening' },
  ]);
  const [habitHistory, setHabitHistory] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [debts, setDebts] = useState([]);
  const [savings, setSavings] = useState(0);
  const [dream, setDream] = useState({ name: '', targetAmount: 0 });
  const [profile, setProfile] = useState({ name: '', mood: 3, avatar: '' });
  const [focusTask, setFocusTask] = useState('');
  const [notes, setNotes] = useState('');

  // ===== ЗАГРУЗКА ДАННЫХ =====
  useEffect(() => {
    const loadData = async () => {
      if (!isReady) return;
      try {
        const [t, h, hh, tx, subs, dbt, sav, dr, pr, foc, nt] = await Promise.all([
          loadFromCloud(`tasks_${todayKey}`),
          loadFromCloud('habits'),
          loadFromCloud('habitHistory'),
          loadFromCloud('transactions'),
          loadFromCloud('subscriptions'),
          loadFromCloud('debts'),
          loadFromCloud('savings'),
          loadFromCloud('dream'),
          loadFromCloud('profile'),
          loadFromCloud(`focus_${todayKey}`),
          loadFromCloud(`notes_${todayKey}`)
        ]);
        if (t) setTasks(t);
        if (h) setHabits(h);
        if (hh) setHabitHistory(hh);
        if (tx) setTransactions(tx);
        if (subs) setSubscriptions(subs);
        if (dbt) setDebts(dbt);
        if (sav !== null) setSavings(sav);
        if (dr) setDream(dr);
        if (pr) setProfile(pr);
        if (foc) setFocusTask(foc);
        if (nt) setNotes(nt);
      } catch (e) { console.error(e); }
      setIsLoading(false);
    };
    loadData();
  }, [isReady, todayKey, loadFromCloud]);

  // ===== АВТОСОХРАНЕНИЕ =====
  useEffect(() => { if (isReady && !isLoading) saveToCloud(`tasks_${todayKey}`, tasks); }, [tasks, isReady, isLoading, todayKey, saveToCloud]);
  useEffect(() => { if (isReady && !isLoading) saveToCloud('habits', habits); }, [habits, isReady, isLoading, saveToCloud]);
  useEffect(() => { if (isReady && !isLoading) saveToCloud('habitHistory', habitHistory); }, [habitHistory, isReady, isLoading, saveToCloud]);
  useEffect(() => { if (isReady && !isLoading) saveToCloud('transactions', transactions); }, [transactions, isReady, isLoading, saveToCloud]);
  useEffect(() => { if (isReady && !isLoading) saveToCloud('subscriptions', subscriptions); }, [subscriptions, isReady, isLoading, saveToCloud]);
  useEffect(() => { if (isReady && !isLoading) saveToCloud('debts', debts); }, [debts, isReady, isLoading, saveToCloud]);
  useEffect(() => { if (isReady && !isLoading) saveToCloud('savings', savings); }, [savings, isReady, isLoading, saveToCloud]);
  useEffect(() => { if (isReady && !isLoading) saveToCloud('dream', dream); }, [dream, isReady, isLoading, saveToCloud]);
  useEffect(() => { if (isReady && !isLoading) saveToCloud('profile', profile); }, [profile, isReady, isLoading, saveToCloud]);
  useEffect(() => { if (isReady && !isLoading) saveToCloud(`focus_${todayKey}`, focusTask); }, [focusTask, isReady, isLoading, todayKey, saveToCloud]);
  useEffect(() => { if (isReady && !isLoading) saveToCloud(`notes_${todayKey}`, notes); }, [notes, isReady, isLoading, todayKey, saveToCloud]);

  // Back button
  useEffect(() => {
    if (activeTab !== 'today') showBackButton(() => { setActiveTab('today'); haptic('light'); });
    else hideBackButton();
  }, [activeTab, showBackButton, hideBackButton, haptic]);

  // ===== ВЫЧИСЛЕНИЯ =====
  const todayHabits = habitHistory[todayKey] || {};
  const completedTasks = tasks.filter(t => t.done).length;
  const taskProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const completedHabitsCount = Object.values(todayHabits).filter(Boolean).length;
  const habitProgress = habits.length > 0 ? Math.round((completedHabitsCount / habits.length) * 100) : 0;
  const overallProgress = Math.round((taskProgress + habitProgress) / 2);

  const dreamProgress = dream.targetAmount > 0 ? Math.min(100, Math.round((savings / dream.targetAmount) * 100)) : 0;

  // Streak
  const getHabitStreak = (habitId) => {
    let streak = 0;
    const d = new Date(today);
    while (true) {
      const key = d.toISOString().split('T')[0];
      if (habitHistory[key]?.[habitId]) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  };

  // ===== ФУНКЦИИ =====
  const addTask = (text, time, priority) => { if (text.trim()) { setTasks([...tasks, { id: Date.now(), text, time: time || '—', priority, done: false }]); haptic('success'); } };
  const toggleTask = (id) => { setTasks(tasks.map(t => t.id === id ? {...t, done: !t.done} : t)); haptic('light'); };
  const deleteTask = (id) => { setTasks(tasks.filter(t => t.id !== id)); haptic('warning'); };

  const toggleHabit = (id) => { setHabitHistory({ ...habitHistory, [todayKey]: { ...todayHabits, [id]: !todayHabits[id] } }); haptic('medium'); };
  const addHabit = (name, icon, timeOfDay) => { if (name.trim()) { setHabits([...habits, { id: Date.now(), name, icon, timeOfDay }]); haptic('success'); } };
  const deleteHabit = async (id) => { if (await showConfirm('Удалить привычку?')) { setHabits(habits.filter(h => h.id !== id)); haptic('warning'); } };

  const addTransaction = (text, amount, category, type) => { if (text.trim() && amount > 0) { setTransactions([...transactions, { id: Date.now(), date: todayKey, text, amount, category, type }]); haptic('success'); } };
  const deleteTransaction = (id) => { setTransactions(transactions.filter(t => t.id !== id)); haptic('warning'); };

  const addSubscription = (name, amount) => { if (name.trim()) { setSubscriptions([...subscriptions, { id: Date.now(), name, amount: amount || 0 }]); haptic('success'); } };
  const deleteSubscription = (id) => { setSubscriptions(subscriptions.filter(s => s.id !== id)); haptic('warning'); };

  const addDebt = (name, amount, type) => { if (name.trim()) { setDebts([...debts, { id: Date.now(), name, amount: amount || 0, type }]); haptic('success'); } };
  const deleteDebt = (id) => { setDebts(debts.filter(d => d.id !== id)); haptic('warning'); };

  const formatDate = (date) => {
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const getWeekDays = () => {
    const days = [];
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() + 1);
    for (let i = 0; i < 7; i++) { const d = new Date(start); d.setDate(start.getDate() + i); days.push(d); }
    return days;
  };

  const getPriorityColor = (p) => p === 'high' ? colors.danger : p === 'medium' ? colors.warning : colors.success;

  // Loading
  if (!isReady || isLoading) {
    return (
      <div style={{...styles.app, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 30px', textAlign: 'center'}}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📋</div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: colors.primary, marginBottom: '8px' }}>Мой Планер</div>
        <div style={{ fontSize: '13px', color: colors.hint }}>Загрузка...</div>
      </div>
    );
  }

  // ==================== TODAY TAB ====================
  const TodayTab = () => {
    const [newTask, setNewTask] = useState('');
    const [newTime, setNewTime] = useState('');
    const [newPriority, setNewPriority] = useState('medium');
    const [showAddHabit, setShowAddHabit] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');
    const [newHabitIcon, setNewHabitIcon] = useState('🎯');
    const [newHabitTime, setNewHabitTime] = useState('day');

    const habitsByTime = {
      morning: habits.filter(h => h.timeOfDay === 'morning'),
      day: habits.filter(h => h.timeOfDay === 'day'),
      evening: habits.filter(h => h.timeOfDay === 'evening')
    };

    const HabitItem = ({ h }) => {
      const streak = getHabitStreak(h.id);
      return (
        <div onClick={() => toggleHabit(h.id)} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 8px', minWidth: '72px',
          background: todayHabits[h.id] ? `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)` : (isDark ? 'rgba(15,23,42,0.4)' : 'rgba(0,0,0,0.03)'),
          borderRadius: '14px', cursor: 'pointer', border: todayHabits[h.id] ? `1px solid ${colors.primary}40` : '1px solid transparent', position: 'relative'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '4px', filter: todayHabits[h.id] ? 'none' : 'grayscale(0.5)', opacity: todayHabits[h.id] ? 1 : 0.6 }}>{h.icon}</div>
          <div style={{ fontSize: '10px', textAlign: 'center', color: todayHabits[h.id] ? colors.text : colors.hint, maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</div>
          {streak > 0 && <div style={{ fontSize: '9px', color: colors.warning, marginTop: '4px' }}>🔥 {streak}</div>}
          {todayHabits[h.id] && <div style={{ position: 'absolute', top: '4px', right: '4px', fontSize: '10px', color: colors.primary }}>✓</div>}
        </div>
      );
    };

    return (
      <div>
        {/* Dashboard */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
          <div style={{...styles.card, marginBottom: 0, padding: '14px'}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ fontSize: '16px' }}>✅</span><span style={{ fontSize: '12px', color: colors.hint }}>Задачи</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: '700' }}>{completedTasks}/{tasks.length}</div>
            <div style={styles.progressBar}><div style={{ height: '100%', width: `${taskProgress}%`, background: colors.primary, borderRadius: '2px' }}/></div>
          </div>
          <div style={{...styles.card, marginBottom: 0, padding: '14px'}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ fontSize: '16px' }}>🎯</span><span style={{ fontSize: '12px', color: colors.hint }}>Привычки</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: '700' }}>{completedHabitsCount}/{habits.length}</div>
            <div style={styles.progressBar}><div style={{ height: '100%', width: `${habitProgress}%`, background: colors.secondary, borderRadius: '2px' }}/></div>
          </div>
        </div>

        {/* Focus - ИСПРАВЛЕН БАГ */}
        <div style={{...styles.card, background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}15)`, border: `1px solid ${colors.primary}30`}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '18px' }}>🎯</span>
            <span style={{ fontSize: '11px', color: colors.hint, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Главный фокус дня</span>
          </div>
          <input
            type="text"
            value={focusTask}
            onChange={(e) => setFocusTask(e.target.value)}
            placeholder="Что самое важное сегодня?"
            style={{...styles.input, background: 'transparent', border: 'none', padding: '0', fontSize: '16px', fontWeight: '500'}}
          />
        </div>

        {/* Tasks */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={styles.cardTitle}><span>📋</span> Задачи</h2>
            <span style={{ fontSize: '12px', color: colors.primary, background: `${colors.primary}15`, padding: '3px 10px', borderRadius: '12px' }}>{taskProgress}%</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} style={{...styles.input, width: '90px', flex: 'none', padding: '10px'}}/>
            <input type="text" placeholder="Новая задача..." value={newTask} onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (addTask(newTask, newTime, newPriority), setNewTask(''), setNewTime(''))}
              style={{...styles.input, flex: 1, minWidth: '100px'}}/>
            <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} style={{...styles.input, width: '50px', flex: 'none', padding: '10px'}}>
              <option value="high">🔴</option><option value="medium">🟡</option><option value="low">🟢</option>
            </select>
            <button onClick={() => { addTask(newTask, newTime, newPriority); setNewTask(''); setNewTime(''); }} style={styles.buttonSmall}>+</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {tasks.length === 0 ? <div style={{ textAlign: 'center', padding: '16px', color: colors.hint, fontSize: '13px' }}>Добавьте задачу ☝️</div> :
              tasks.map(task => (
                <div key={task.id} onClick={() => toggleTask(task.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '12px',
                  background: task.done ? `${colors.primary}10` : (isDark ? 'rgba(15,23,42,0.3)' : 'rgba(0,0,0,0.03)'),
                  borderRadius: '12px', cursor: 'pointer', border: task.done ? `1px solid ${colors.primary}30` : '1px solid transparent'
                }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: `2px solid ${task.done ? colors.primary : getPriorityColor(task.priority)}`, background: task.done ? colors.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', flexShrink: 0 }}>{task.done && '✓'}</div>
                  <div style={{ flex: 1, fontSize: '14px', textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? 0.6 : 1 }}>{task.text}</div>
                  <div style={{ fontSize: '11px', color: colors.hint }}>{task.time}</div>
                  <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} style={{ background: 'none', border: 'none', color: colors.danger, fontSize: '16px', cursor: 'pointer', opacity: 0.5 }}>×</button>
                </div>
              ))}
          </div>
        </div>

        {/* Habits */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={styles.cardTitle}><span>🌱</span> Привычки</h2>
            <button onClick={() => setShowAddHabit(true)} style={{...styles.buttonSmall, padding: '6px 12px', fontSize: '12px'}}>+ Добавить</button>
          </div>
          
          {['morning', 'day', 'evening'].map(time => habitsByTime[time].length > 0 && (
            <div key={time} style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: colors.hint, marginBottom: '8px', textTransform: 'uppercase' }}>
                {time === 'morning' ? '🌅 Утро' : time === 'day' ? '☀️ День' : '🌙 Вечер'}
              </div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {habitsByTime[time].map(h => <HabitItem key={h.id} h={h} />)}
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div style={styles.card}>
          <h2 style={{...styles.cardTitle, marginBottom: '10px'}}><span>📝</span> Заметки</h2>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Мысли, идеи, благодарности..."
            style={{...styles.input, minHeight: '60px', resize: 'vertical', lineHeight: '1.5'}}/>
        </div>

        {/* Add Habit Modal */}
        {showAddHabit && (
          <div style={styles.modal} onClick={() => setShowAddHabit(false)}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', textAlign: 'center' }}>Новая привычка</h3>
              <input type="text" placeholder="Название привычки" value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} style={{...styles.input, marginBottom: '12px'}}/>
              
              <div style={{ fontSize: '13px', color: colors.hint, marginBottom: '8px' }}>Иконка</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {HABIT_ICONS.map(icon => (
                  <button key={icon} onClick={() => setNewHabitIcon(icon)} style={{
                    width: '40px', height: '40px', borderRadius: '10px', border: newHabitIcon === icon ? `2px solid ${colors.primary}` : '2px solid transparent',
                    background: newHabitIcon === icon ? `${colors.primary}20` : (isDark ? 'rgba(15,23,42,0.4)' : 'rgba(0,0,0,0.05)'),
                    fontSize: '20px', cursor: 'pointer'
                  }}>{icon}</button>
                ))}
              </div>

              <div style={{ fontSize: '13px', color: colors.hint, marginBottom: '8px' }}>Время дня</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {[{v: 'morning', l: '🌅 Утро'}, {v: 'day', l: '☀️ День'}, {v: 'evening', l: '🌙 Вечер'}].map(t => (
                  <button key={t.v} onClick={() => setNewHabitTime(t.v)} style={{
                    flex: 1, padding: '10px', borderRadius: '10px', border: newHabitTime === t.v ? `2px solid ${colors.primary}` : '2px solid transparent',
                    background: newHabitTime === t.v ? `${colors.primary}20` : (isDark ? 'rgba(15,23,42,0.4)' : 'rgba(0,0,0,0.05)'),
                    fontSize: '12px', cursor: 'pointer', color: colors.text
                  }}>{t.l}</button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowAddHabit(false)} style={{...styles.button, flex: 1, background: colors.hint}}>Отмена</button>
                <button onClick={() => { addHabit(newHabitName, newHabitIcon, newHabitTime); setShowAddHabit(false); setNewHabitName(''); }} style={{...styles.button, flex: 1}}>Добавить</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==================== WEEK TAB ====================
  const WeekTab = () => {
    const weekDays = getWeekDays();
    const formatShort = (d) => ({ day: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'][d.getDay()], date: d.getDate() });

    let weekHabitsDone = 0, weekHabitsTotal = 0;
    const dailyProgress = weekDays.map(d => {
      const key = d.toISOString().split('T')[0];
      const dh = habitHistory[key] || {};
      const hd = Object.values(dh).filter(Boolean).length;
      weekHabitsDone += hd;
      weekHabitsTotal += habits.length;
      return { date: d, key, overall: habits.length > 0 ? Math.round((hd / habits.length) * 100) : 0, habitsDone: hd };
    });
    const weekProgress = weekHabitsTotal > 0 ? Math.round((weekHabitsDone / weekHabitsTotal) * 100) : 0;

    return (
      <div>
        {/* Week Progress */}
        <div style={{...styles.card, background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}15)`, border: `1px solid ${colors.primary}30`}}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: colors.hint, textTransform: 'uppercase', marginBottom: '6px' }}>Прогресс недели</div>
            <div style={{ fontSize: '42px', fontWeight: '800', color: colors.primary }}>{weekProgress}%</div>
            <div style={{ fontSize: '12px', color: colors.hint }}>{weekProgress >= 70 ? '🔥 Отлично!' : weekProgress >= 40 ? '💪 Хорошо!' : '🚀 Вперёд!'}</div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: `conic-gradient(${colors.primary} ${weekProgress * 3.6}deg, ${colors.primary}20 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: isDark ? '#1e293b' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '700', color: colors.primary }}>{weekProgress}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Week Chart */}
        <div style={styles.card}>
          <h2 style={{...styles.cardTitle, marginBottom: '16px'}}><span>📈</span> По дням</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '80px', gap: '4px' }}>
            {dailyProgress.map((d, i) => {
              const isToday = d.key === todayKey;
              const { day, date } = formatShort(d.date);
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '100%', maxWidth: '28px', height: `${Math.max(d.overall, 8)}%`, minHeight: '6px',
                    background: isToday ? colors.primary : d.overall >= 70 ? `${colors.primary}80` : d.overall >= 40 ? `${colors.warning}80` : `${colors.hint}50`,
                    borderRadius: '4px'
                  }}/>
                  <div style={{ fontSize: '9px', color: isToday ? colors.primary : colors.hint }}>{day}</div>
                  <div style={{ fontSize: '10px', fontWeight: isToday ? '700' : '500', color: isToday ? colors.primary : colors.text }}>{date}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Habit Streaks */}
        <div style={styles.card}>
          <h2 style={{...styles.cardTitle, marginBottom: '12px'}}><span>🔥</span> Серии</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {habits.map(h => {
              const streak = getHabitStreak(h.id);
              return (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: isDark ? 'rgba(15,23,42,0.3)' : 'rgba(0,0,0,0.03)', borderRadius: '10px' }}>
                  <span style={{ fontSize: '20px' }}>{h.icon}</span>
                  <span style={{ flex: 1, fontSize: '13px' }}>{h.name}</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: streak > 0 ? colors.warning : colors.hint }}>{streak > 0 ? `🔥 ${streak} дн.` : '—'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ==================== FINANCE TAB ====================
  const FinanceTab = () => {
    const [newText, setNewText] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newCat, setNewCat] = useState('Еда');
    const [newType, setNewType] = useState('expense');
    const [tab, setTab] = useState('main');
    const [newSubName, setNewSubName] = useState('');
    const [newSubAmount, setNewSubAmount] = useState('');
    const [newDebtName, setNewDebtName] = useState('');
    const [newDebtAmount, setNewDebtAmount] = useState('');
    const [newDebtType, setNewDebtType] = useState('owe');

    const cats = ['Еда', 'Транспорт', 'Развлечения', 'Здоровье', 'Образование', 'Подписки', 'Зарплата', 'Подработка', 'Другое'];
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalSubs = subscriptions.reduce((s, sub) => s + sub.amount, 0);
    const iOwe = debts.filter(d => d.type === 'owe').reduce((s, d) => s + d.amount, 0);
    const owedToMe = debts.filter(d => d.type === 'owed').reduce((s, d) => s + d.amount, 0);

    return (
      <div>
        {/* Dream Card */}
        <div style={{...styles.card, background: `linear-gradient(135deg, ${colors.warning}15, ${colors.primary}10)`, border: `1px solid ${colors.warning}30`}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px' }}>🌟</span>
            <div style={{ flex: 1 }}>
              <input type="text" value={dream.name} onChange={(e) => setDream({...dream, name: e.target.value})} placeholder="Моя мечта..." style={{...styles.input, background: 'transparent', border: 'none', padding: 0, fontSize: '16px', fontWeight: '600'}}/>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', color: colors.hint, marginBottom: '4px' }}>Накоплено</div>
              <input type="number" value={savings || ''} onChange={(e) => setSavings(parseFloat(e.target.value) || 0)} placeholder="0" style={{...styles.input, fontSize: '18px', fontWeight: '700', color: colors.success}}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', color: colors.hint, marginBottom: '4px' }}>Цель</div>
              <input type="number" value={dream.targetAmount || ''} onChange={(e) => setDream({...dream, targetAmount: parseFloat(e.target.value) || 0})} placeholder="0" style={{...styles.input, fontSize: '18px', fontWeight: '700'}}/>
            </div>
          </div>
          <div style={styles.progressBar}>
            <div style={{ height: '100%', width: `${dreamProgress}%`, background: `linear-gradient(90deg, ${colors.warning}, ${colors.primary})`, borderRadius: '2px' }}/>
          </div>
          <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '14px', fontWeight: '600', color: colors.warning }}>{dreamProgress}% достигнуто</div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
          {[{id: 'main', l: '💰 Главное'}, {id: 'subs', l: '📱 Подписки'}, {id: 'debts', l: '📋 Долги'}].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); haptic('selection'); }} style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
              background: tab === t.id ? colors.primary : (isDark ? 'rgba(30,41,59,0.6)' : 'rgba(0,0,0,0.05)'),
              color: tab === t.id ? 'white' : colors.text, fontSize: '12px', fontWeight: '500', cursor: 'pointer'
            }}>{t.l}</button>
          ))}
        </div>

        {tab === 'main' && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
              <div style={{...styles.card, marginBottom: 0, padding: '12px', textAlign: 'center'}}>
                <div style={{ fontSize: '10px', color: colors.hint }}>Доходы</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: colors.success }}>+{totalIncome.toLocaleString()}</div>
              </div>
              <div style={{...styles.card, marginBottom: 0, padding: '12px', textAlign: 'center'}}>
                <div style={{ fontSize: '10px', color: colors.hint }}>Расходы</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: colors.danger }}>-{totalExpenses.toLocaleString()}</div>
              </div>
              <div style={{...styles.card, marginBottom: 0, padding: '12px', textAlign: 'center'}}>
                <div style={{ fontSize: '10px', color: colors.hint }}>Баланс</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: totalIncome - totalExpenses >= 0 ? colors.primary : colors.danger }}>{(totalIncome - totalExpenses).toLocaleString()}</div>
              </div>
            </div>

            {/* Add Transaction */}
            <div style={styles.card}>
              <h2 style={{...styles.cardTitle, marginBottom: '12px'}}><span>➕</span> Добавить</h2>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                <button onClick={() => setNewType('income')} style={{...styles.buttonSmall, flex: 1, background: newType === 'income' ? colors.success : `${colors.success}30`, color: newType === 'income' ? 'white' : colors.success}}>↓ Доход</button>
                <button onClick={() => setNewType('expense')} style={{...styles.buttonSmall, flex: 1, background: newType === 'expense' ? colors.danger : `${colors.danger}30`, color: newType === 'expense' ? 'white' : colors.danger}}>↑ Расход</button>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <input type="text" placeholder="Описание" value={newText} onChange={(e) => setNewText(e.target.value)} style={{...styles.input, flex: 1, minWidth: '100px'}}/>
                <input type="number" placeholder="Сумма" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} style={{...styles.input, width: '80px', flex: 'none'}}/>
                <select value={newCat} onChange={(e) => setNewCat(e.target.value)} style={{...styles.input, width: '100px', flex: 'none'}}>
                  {cats.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={() => { addTransaction(newText, parseFloat(newAmount), newCat, newType); setNewText(''); setNewAmount(''); }} style={styles.buttonSmall}>+</button>
              </div>
            </div>

            {/* History */}
            <div style={styles.card}>
              <h2 style={{...styles.cardTitle, marginBottom: '10px'}}><span>📜</span> История</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {transactions.length === 0 ? <div style={{ textAlign: 'center', padding: '16px', color: colors.hint, fontSize: '13px' }}>Нет транзакций</div> :
                  transactions.slice().reverse().slice(0, 10).map(t => (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: isDark ? 'rgba(15,23,42,0.3)' : 'rgba(0,0,0,0.03)', borderRadius: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px' }}>{t.text}</div>
                        <div style={{ fontSize: '10px', color: colors.hint }}>{t.category}</div>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: t.type === 'income' ? colors.success : colors.danger }}>{t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}</div>
                      <button onClick={() => deleteTransaction(t.id)} style={{ background: 'none', border: 'none', color: colors.danger, fontSize: '14px', cursor: 'pointer', opacity: 0.5 }}>×</button>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        {tab === 'subs' && (
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={styles.cardTitle}><span>📱</span> Подписки</h2>
              <span style={{ fontSize: '13px', color: colors.danger }}>{totalSubs.toLocaleString()} ₽/мес</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              <input type="text" placeholder="Название" value={newSubName} onChange={(e) => setNewSubName(e.target.value)} style={{...styles.input, flex: 1}}/>
              <input type="number" placeholder="₽/мес" value={newSubAmount} onChange={(e) => setNewSubAmount(e.target.value)} style={{...styles.input, width: '80px', flex: 'none'}}/>
              <button onClick={() => { addSubscription(newSubName, parseFloat(newSubAmount)); setNewSubName(''); setNewSubAmount(''); }} style={styles.buttonSmall}>+</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {subscriptions.length === 0 ? <div style={{ textAlign: 'center', padding: '16px', color: colors.hint, fontSize: '13px' }}>Нет подписок</div> :
                subscriptions.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: isDark ? 'rgba(15,23,42,0.3)' : 'rgba(0,0,0,0.03)', borderRadius: '10px' }}>
                    <span style={{ flex: 1, fontSize: '13px' }}>{s.name}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: colors.danger }}>{s.amount} ₽</span>
                    <button onClick={() => deleteSubscription(s.id)} style={{ background: 'none', border: 'none', color: colors.danger, fontSize: '14px', cursor: 'pointer', opacity: 0.5 }}>×</button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {tab === 'debts' && (
          <div style={styles.card}>
            <h2 style={{...styles.cardTitle, marginBottom: '12px'}}><span>📋</span> Долги</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
              <div style={{ padding: '10px', background: `${colors.danger}15`, borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: colors.hint }}>Я должен</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: colors.danger }}>{iOwe.toLocaleString()} ₽</div>
              </div>
              <div style={{ padding: '10px', background: `${colors.success}15`, borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: colors.hint }}>Мне должны</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: colors.success }}>{owedToMe.toLocaleString()} ₽</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              <button onClick={() => setNewDebtType('owe')} style={{...styles.buttonSmall, flex: 1, background: newDebtType === 'owe' ? colors.danger : `${colors.danger}30`, color: newDebtType === 'owe' ? 'white' : colors.danger}}>Я должен</button>
              <button onClick={() => setNewDebtType('owed')} style={{...styles.buttonSmall, flex: 1, background: newDebtType === 'owed' ? colors.success : `${colors.success}30`, color: newDebtType === 'owed' ? 'white' : colors.success}}>Мне должны</button>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              <input type="text" placeholder="Кому/от кого" value={newDebtName} onChange={(e) => setNewDebtName(e.target.value)} style={{...styles.input, flex: 1}}/>
              <input type="number" placeholder="Сумма" value={newDebtAmount} onChange={(e) => setNewDebtAmount(e.target.value)} style={{...styles.input, width: '80px', flex: 'none'}}/>
              <button onClick={() => { addDebt(newDebtName, parseFloat(newDebtAmount), newDebtType); setNewDebtName(''); setNewDebtAmount(''); }} style={styles.buttonSmall}>+</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {debts.length === 0 ? <div style={{ textAlign: 'center', padding: '16px', color: colors.hint, fontSize: '13px' }}>Нет долгов 🎉</div> :
                debts.map(d => (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: isDark ? 'rgba(15,23,42,0.3)' : 'rgba(0,0,0,0.03)', borderRadius: '10px' }}>
                    <span style={{ flex: 1, fontSize: '13px' }}>{d.name}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: d.type === 'owe' ? colors.danger : colors.success }}>{d.amount.toLocaleString()} ₽</span>
                    <button onClick={() => deleteDebt(d.id)} style={{ background: 'none', border: 'none', color: colors.danger, fontSize: '14px', cursor: 'pointer', opacity: 0.5 }}>×</button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==================== PROFILE TAB ====================
  const ProfileTab = () => {
    const [ugcForm, setUgcForm] = useState({ name: '', instagram: '', tiktok: '', audience: '' });
    const [submitted, setSubmitted] = useState(false);
    const fileRef = useRef(null);
    const moodEmojis = ['😢', '😕', '😐', '🙂', '😄'];

    const handleAvatar = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) { showAlert('Макс. 2MB'); return; }
        const reader = new FileReader();
        reader.onloadend = () => { setProfile({ ...profile, avatar: reader.result }); haptic('success'); };
        reader.readAsDataURL(file);
      }
    };

    return (
      <div>
        {/* Profile */}
        <div style={styles.card}>
          <h2 style={{...styles.cardTitle, marginBottom: '16px'}}><span>👤</span> Профиль</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div onClick={() => fileRef.current?.click()} style={{
                width: '70px', height: '70px', borderRadius: '20px',
                background: profile.avatar ? `url(${profile.avatar}) center/cover` : `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', cursor: 'pointer'
              }}>{!profile.avatar && (profile.name ? profile.name[0].toUpperCase() : '👤')}</div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }}/>
              <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '24px', height: '24px', borderRadius: '50%', background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>📷</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <input type="text" placeholder="Ваше имя" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} style={{...styles.input, fontSize: '16px', fontWeight: '600'}}/>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            <div style={{ background: isDark ? 'rgba(15,23,42,0.4)' : 'rgba(0,0,0,0.03)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: colors.primary }}>{Object.keys(habitHistory).length}</div>
              <div style={{ fontSize: '11px', color: colors.hint }}>Дней активности</div>
            </div>
            <div style={{ background: isDark ? 'rgba(15,23,42,0.4)' : 'rgba(0,0,0,0.03)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: colors.secondary }}>{transactions.length}</div>
              <div style={{ fontSize: '11px', color: colors.hint }}>Транзакций</div>
            </div>
          </div>
        </div>

        {/* Mood */}
        <div style={styles.card}>
          <h2 style={{...styles.cardTitle, marginBottom: '12px'}}><span>😊</span> Настроение</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
            {moodEmojis.map((e, i) => (
              <button key={i} onClick={() => { setProfile({ ...profile, mood: i }); haptic('selection'); }} style={{
                flex: 1, padding: '12px 8px', borderRadius: '12px',
                border: profile.mood === i ? `2px solid ${colors.warning}` : '2px solid transparent',
                background: profile.mood === i ? `${colors.warning}20` : (isDark ? 'rgba(15,23,42,0.4)' : 'rgba(0,0,0,0.03)'),
                fontSize: '22px', cursor: 'pointer'
              }}>{e}</button>
            ))}
          </div>
        </div>

        {/* UGC - ИСПРАВЛЕН БАГ с TikTok */}
        <div style={{...styles.card, background: `linear-gradient(135deg, ${colors.warning}10, ${colors.danger}05)`, border: `1px solid ${colors.warning}30`}}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎬</div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 6px', color: colors.warning }}>Стань UGC-креатором!</h2>
            <p style={{ fontSize: '12px', color: colors.hint, margin: 0 }}>Зарабатывай на контенте</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {[{i:'💵',t:'5 000 ₽',d:'за обзор'},{i:'📈',t:'до 40%',d:'с продаж'},{i:'🎁',t:'Бесплатно',d:'планеры'},{i:'🤝',t:'Поддержка',d:'команды'}].map((x,j) => (
              <div key={j} style={{ background: isDark ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px' }}>{x.i}</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: colors.warning }}>{x.t}</div>
                <div style={{ fontSize: '9px', color: colors.hint }}>{x.d}</div>
              </div>
            ))}
          </div>

          {!submitted ? (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                <input type="text" placeholder="Ваше имя *" value={ugcForm.name} onChange={(e) => setUgcForm({...ugcForm, name: e.target.value})} style={styles.input}/>
                <input type="text" placeholder="Instagram @" value={ugcForm.instagram} onChange={(e) => setUgcForm({...ugcForm, instagram: e.target.value})} style={styles.input}/>
                <input type="text" placeholder="TikTok @" value={ugcForm.tiktok} onChange={(e) => setUgcForm({...ugcForm, tiktok: e.target.value})} style={styles.input}/>
                <input type="text" placeholder="Размер аудитории" value={ugcForm.audience} onChange={(e) => setUgcForm({...ugcForm, audience: e.target.value})} style={styles.input}/>
              </div>
              <button onClick={() => { if (ugcForm.name) { setSubmitted(true); haptic('success'); } else showAlert('Введите имя'); }} style={{...styles.button, width: '100%', background: `linear-gradient(135deg, ${colors.warning}, #d97706)`}}>Отправить заявку 🚀</button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>✅</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: colors.primary }}>Заявка отправлена!</div>
            </div>
          )}

          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <button onClick={() => openTelegramLink('https://t.me/abramotti')} style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px',
              background: 'rgba(0,136,204,0.1)', borderRadius: '12px', color: '#00a8e8',
              border: '1px solid rgba(0,136,204,0.2)', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
            }}>✈️ @abramotti</button>
          </div>
        </div>
      </div>
    );
  };

  // ==================== RENDER ====================
  const tabs = [
    { id: 'today', icon: '📅', label: 'Сегодня' },
    { id: 'week', icon: '📊', label: 'Неделя' },
    { id: 'finance', icon: '💰', label: 'Финансы' },
    { id: 'profile', icon: '👤', label: 'Профиль' },
  ];

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📋</div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: colors.primary }}>Мой Планер</h1>
            <p style={{ fontSize: '10px', color: colors.hint, margin: 0 }}>{formatDate(today)}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '22px', fontWeight: '800', color: overallProgress >= 70 ? colors.primary : colors.warning }}>{overallProgress}%</div>
          <div style={{ fontSize: '9px', color: colors.hint }}>прогресс</div>
        </div>
      </header>

      <div style={styles.content}>
        {activeTab === 'today' && <TodayTab />}
        {activeTab === 'week' && <WeekTab />}
        {activeTab === 'finance' && <FinanceTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </div>

      <nav style={styles.nav}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); haptic('selection'); }} style={styles.navItem(activeTab === tab.id, colors)}>
            <span style={{ fontSize: '20px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
