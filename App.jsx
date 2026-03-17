import React, { useState, useEffect, useCallback, useRef } from 'react';

// ==================== TELEGRAM HOOK ====================
const useTelegram = () => {
  const tg = window.Telegram?.WebApp;
  const [isReady, setIsReady] = useState(false);
  const [colorScheme, setColorScheme] = useState('dark');
  const [themeParams, setThemeParams] = useState({});

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      setColorScheme(tg.colorScheme || 'dark');
      setThemeParams(tg.themeParams || {});
      tg.onEvent('themeChanged', () => {
        setColorScheme(tg.colorScheme || 'dark');
        setThemeParams(tg.themeParams || {});
      });
      setIsReady(true);
    } else {
      setIsReady(true); // Для работы в браузере без Telegram
    }
  }, []);

  const haptic = useCallback((type = 'light') => {
    if (tg?.HapticFeedback) {
      if (['light', 'medium', 'heavy'].includes(type)) {
        tg.HapticFeedback.impactOccurred(type);
      } else if (['success', 'warning', 'error'].includes(type)) {
        tg.HapticFeedback.notificationOccurred(type);
      } else if (type === 'selection') {
        tg.HapticFeedback.selectionChanged();
      }
    }
  }, []);

  const showBackButton = useCallback((onClick) => {
    if (tg?.BackButton) {
      tg.BackButton.onClick(onClick);
      tg.BackButton.show();
    }
  }, []);

  const hideBackButton = useCallback(() => {
    if (tg?.BackButton) {
      tg.BackButton.hide();
    }
  }, []);

  const saveToCloud = useCallback(async (key, value) => {
    return new Promise((resolve, reject) => {
      if (tg?.CloudStorage) {
        tg.CloudStorage.setItem(key, JSON.stringify(value), (error, success) => {
          if (error) reject(error);
          else resolve(success);
        });
      } else {
        try {
          localStorage.setItem(`lifeplan_${key}`, JSON.stringify(value));
          resolve(true);
        } catch (e) {
          reject(e);
        }
      }
    });
  }, []);

  const loadFromCloud = useCallback(async (key) => {
    return new Promise((resolve, reject) => {
      if (tg?.CloudStorage) {
        tg.CloudStorage.getItem(key, (error, value) => {
          if (error) reject(error);
          else resolve(value ? JSON.parse(value) : null);
        });
      } else {
        try {
          const value = localStorage.getItem(`lifeplan_${key}`);
          resolve(value ? JSON.parse(value) : null);
        } catch (e) {
          reject(e);
        }
      }
    });
  }, []);

  const showAlert = useCallback((message) => {
    if (tg?.showAlert) {
      tg.showAlert(message);
    } else {
      alert(message);
    }
  }, []);

  const showConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      if (tg?.showConfirm) {
        tg.showConfirm(message, (confirmed) => resolve(confirmed));
      } else {
        resolve(window.confirm(message));
      }
    });
  }, []);

  const openTelegramLink = useCallback((url) => {
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  }, []);

  return {
    tg, isReady, colorScheme, themeParams, haptic,
    showBackButton, hideBackButton, saveToCloud, loadFromCloud,
    showAlert, showConfirm, openTelegramLink
  };
};

// ==================== STYLES ====================
const getStyles = (colorScheme, themeParams) => {
  const isDark = colorScheme === 'dark';
  
  const colors = {
    bg: themeParams.bg_color || (isDark ? '#0f172a' : '#ffffff'),
    secondaryBg: themeParams.secondary_bg_color || (isDark ? '#1e293b' : '#f1f5f9'),
    text: themeParams.text_color || (isDark ? '#f1f5f9' : '#1e293b'),
    hint: themeParams.hint_color || (isDark ? '#64748b' : '#94a3b8'),
    primary: '#5BC5A7',
    primaryDark: '#3B9B7F',
    secondary: '#7C9BDB',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    cardBg: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(241, 245, 249, 0.8)',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    inputBg: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
    inputBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  };

  return {
    colors,
    isDark,
    app: {
      minHeight: '100vh',
      background: isDark 
        ? `linear-gradient(135deg, ${colors.bg} 0%, ${colors.secondaryBg} 50%, ${colors.bg} 100%)`
        : colors.bg,
      color: colors.text,
      paddingBottom: '100px',
    },
    header: {
      padding: '16px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      background: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      zIndex: 50,
      borderBottom: `1px solid ${colors.cardBorder}`,
    },
    content: { padding: '0 16px 16px' },
    card: {
      background: colors.cardBg,
      borderRadius: '20px',
      padding: '20px',
      marginBottom: '12px',
      border: `1px solid ${colors.cardBorder}`,
    },
    cardTitle: {
      fontSize: '17px',
      fontWeight: '600',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: colors.text,
    },
    input: {
      flex: 1,
      padding: '14px 16px',
      borderRadius: '14px',
      border: `1px solid ${colors.inputBorder}`,
      background: colors.inputBg,
      color: colors.text,
      fontSize: '15px',
      outline: 'none',
    },
    button: {
      padding: '14px 20px',
      borderRadius: '14px',
      border: 'none',
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
      color: 'white',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    nav: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: isDark ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(20px)',
      borderTop: `1px solid ${colors.cardBorder}`,
      display: 'flex',
      justifyContent: 'space-around',
      padding: '8px 0 env(safe-area-inset-bottom, 8px)',
      zIndex: 100,
    },
    navItem: (active, colors) => ({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      background: 'none',
      border: 'none',
      color: active ? colors.primary : colors.hint,
      cursor: 'pointer',
      fontSize: '11px',
      fontWeight: active ? '600' : '400',
      padding: '8px 16px',
    }),
    progressBar: {
      height: '6px',
      background: isDark ? '#1e293b' : '#e2e8f0',
      borderRadius: '3px',
      overflow: 'hidden',
    },
  };
};

// ==================== MAIN APP ====================
const App = () => {
  const {
    isReady, colorScheme, themeParams, haptic,
    showBackButton, hideBackButton, saveToCloud, loadFromCloud,
    showAlert, showConfirm, openTelegramLink
  } = useTelegram();

  const styles = getStyles(colorScheme, themeParams);
  const { colors, isDark } = styles;

  const [activeTab, setActiveTab] = useState('today');
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const today = new Date();
  const todayKey = today.toISOString().split('T')[0];
  
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([
    { id: 1, name: 'Медитация', icon: '🧘' },
    { id: 2, name: 'Чтение', icon: '📚' },
    { id: 3, name: 'Спорт', icon: '💪' },
    { id: 4, name: 'Вода', icon: '💧' },
    { id: 5, name: 'Без соцсетей', icon: '📵' },
    { id: 6, name: 'Прогулка', icon: '🚶' },
  ]);
  const [habitHistory, setHabitHistory] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [profile, setProfile] = useState({ name: '', mood: 3, avatar: '' });
  const [focusTask, setFocusTask] = useState('');
  const [notes, setNotes] = useState('');

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!isReady) return;
      try {
        const [t, h, hh, tr, p, f, n] = await Promise.all([
          loadFromCloud(`tasks_${todayKey}`),
          loadFromCloud('habits'),
          loadFromCloud('habitHistory'),
          loadFromCloud('transactions'),
          loadFromCloud('profile'),
          loadFromCloud(`focus_${todayKey}`),
          loadFromCloud(`notes_${todayKey}`)
        ]);
        if (t) setTasks(t);
        if (h) setHabits(h);
        if (hh) setHabitHistory(hh);
        if (tr) setTransactions(tr);
        if (p) setProfile(p);
        if (f) setFocusTask(f);
        if (n) setNotes(n);
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    };
    loadData();
  }, [isReady, todayKey, loadFromCloud]);

  // Auto-save
  useEffect(() => { if (isReady && !isLoading) saveToCloud(`tasks_${todayKey}`, tasks); }, [tasks]);
  useEffect(() => { if (isReady && !isLoading) saveToCloud('habits', habits); }, [habits]);
  useEffect(() => { if (isReady && !isLoading) saveToCloud('habitHistory', habitHistory); }, [habitHistory]);
  useEffect(() => { if (isReady && !isLoading) saveToCloud('transactions', transactions); }, [transactions]);
  useEffect(() => { if (isReady && !isLoading) saveToCloud('profile', profile); }, [profile]);
  useEffect(() => { if (isReady && !isLoading) saveToCloud(`focus_${todayKey}`, focusTask); }, [focusTask]);
  useEffect(() => { if (isReady && !isLoading) saveToCloud(`notes_${todayKey}`, notes); }, [notes]);

  // Back button
  useEffect(() => {
    if (activeTab !== 'today') {
      showBackButton(() => { setActiveTab('today'); haptic('light'); });
    } else {
      hideBackButton();
    }
  }, [activeTab]);

  // Calculations
  const todayHabits = habitHistory[todayKey] || {};
  const completedTasks = tasks.filter(t => t.done).length;
  const taskProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const completedHabits = Object.values(todayHabits).filter(Boolean).length;
  const habitProgress = habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0;
  const overallProgress = Math.round((taskProgress + habitProgress) / 2);
  
  const todayTransactions = transactions.filter(t => t.date === todayKey);
  const todayIncome = todayTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const todayExpenses = todayTransactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  // Functions
  const addTask = (text, time, priority) => {
    if (text.trim()) {
      setTasks([...tasks, { id: Date.now(), text, time: time || '—', priority, category: 'Личное', done: false }]);
      haptic('success');
    }
  };
  const toggleTask = (id) => { setTasks(tasks.map(t => t.id === id ? {...t, done: !t.done} : t)); haptic('light'); };
  const deleteTask = (id) => { setTasks(tasks.filter(t => t.id !== id)); haptic('warning'); };
  const toggleHabit = (id) => {
    setHabitHistory({ ...habitHistory, [todayKey]: { ...todayHabits, [id]: !todayHabits[id] } });
    haptic('medium');
  };
  const addTransaction = (text, amount, category) => {
    if (text.trim() && amount) {
      setTransactions([...transactions, { id: Date.now(), date: todayKey, text, amount: parseFloat(amount), category }]);
      haptic('success');
    }
  };
  const deleteTransaction = (id) => { setTransactions(transactions.filter(t => t.id !== id)); haptic('warning'); };

  const formatDate = (date) => {
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const getWeekDays = () => {
    const days = [];
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() + 1);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getPriorityColor = (p) => p === 'high' ? colors.danger : p === 'medium' ? colors.warning : colors.success;

  // Loading screen
  if (!isReady || isLoading) {
    return (
      <div style={{...styles.app, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: colors.primary }}>LifePlan</div>
          <div style={{ fontSize: '14px', color: colors.hint, marginTop: '8px' }}>Загрузка...</div>
        </div>
      </div>
    );
  }

  // ==================== TODAY TAB ====================
  const TodayTab = () => {
    const [newTask, setNewTask] = useState('');
    const [newTime, setNewTime] = useState('');
    const [newPriority, setNewPriority] = useState('medium');

    return (
      <div>
        {/* Dashboard */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
          <div style={{...styles.card, marginBottom: 0, border: `1px solid ${colors.primary}30`}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span>✅</span><span style={{ fontSize: '13px', color: colors.hint }}>Задачи</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '700' }}>{completedTasks}/{tasks.length}</div>
            <div style={styles.progressBar}>
              <div style={{ height: '100%', width: `${taskProgress}%`, background: colors.primary, borderRadius: '3px' }}/>
            </div>
          </div>
          <div style={{...styles.card, marginBottom: 0, border: `1px solid ${colors.secondary}30`}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span>🎯</span><span style={{ fontSize: '13px', color: colors.hint }}>Привычки</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '700' }}>{completedHabits}/{habits.length}</div>
            <div style={styles.progressBar}>
              <div style={{ height: '100%', width: `${habitProgress}%`, background: colors.secondary, borderRadius: '3px' }}/>
            </div>
          </div>
          <div style={{...styles.card, marginBottom: 0, border: `1px solid ${colors.success}30`}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span>💰</span><span style={{ fontSize: '13px', color: colors.hint }}>Баланс</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: todayIncome - todayExpenses >= 0 ? colors.success : colors.danger }}>
              {todayIncome - todayExpenses >= 0 ? '+' : ''}{(todayIncome - todayExpenses).toLocaleString()} ₽
            </div>
          </div>
          <div style={{...styles.card, marginBottom: 0, border: `1px solid ${colors.warning}30`}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span>⚡</span><span style={{ fontSize: '13px', color: colors.hint }}>Прогресс</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '700', color: overallProgress >= 70 ? colors.primary : colors.warning }}>
              {overallProgress}%
            </div>
          </div>
        </div>

        {/* Focus */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)`,
          borderRadius: '20px', padding: '20px', marginBottom: '12px', border: `1px solid ${colors.primary}40`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '22px' }}>🎯</span>
            <span style={{ fontSize: '13px', color: colors.hint, textTransform: 'uppercase' }}>Главный фокус дня</span>
          </div>
          <input
            type="text" value={focusTask} onChange={(e) => setFocusTask(e.target.value)}
            placeholder="Введите главную цель..."
            style={{...styles.input, width: '100%', background: 'transparent', border: 'none', padding: 0, fontSize: '17px', fontWeight: '600'}}
          />
        </div>

        {/* Tasks */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={styles.cardTitle}><span>📋</span> Задачи</h2>
            <span style={{ fontSize: '13px', color: colors.primary, background: `${colors.primary}15`, padding: '4px 12px', borderRadius: '20px' }}>{taskProgress}%</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} style={{...styles.input, width: '100px', flex: 'none'}}/>
            <input type="text" placeholder="Добавить задачу..." value={newTask} onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (addTask(newTask, newTime, newPriority), setNewTask(''), setNewTime(''))}
              style={{...styles.input, minWidth: '120px'}}/>
            <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} style={{...styles.input, width: '90px', flex: 'none'}}>
              <option value="high">🔴</option><option value="medium">🟡</option><option value="low">🟢</option>
            </select>
            <button onClick={() => { addTask(newTask, newTime, newPriority); setNewTask(''); setNewTime(''); }} style={styles.button}>+</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: colors.hint }}>Добавьте первую задачу 👆</div>
            ) : tasks.map(task => (
              <div key={task.id} onClick={() => toggleTask(task.id)} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                background: task.done ? `${colors.primary}15` : (isDark ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.6)'),
                borderRadius: '14px', cursor: 'pointer', border: task.done ? `1px solid ${colors.primary}40` : '1px solid transparent'
              }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '8px',
                  border: `2px solid ${task.done ? colors.primary : getPriorityColor(task.priority)}`,
                  background: task.done ? colors.primary : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'white', flexShrink: 0
                }}>{task.done && '✓'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? 0.6 : 1 }}>{task.text}</div>
                </div>
                <div style={{ fontSize: '13px', color: colors.hint, background: `${colors.hint}20`, padding: '4px 10px', borderRadius: '6px' }}>{task.time}</div>
                <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} style={{ background: 'none', border: 'none', color: colors.danger, fontSize: '18px', cursor: 'pointer', opacity: 0.6 }}>×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Habits */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={styles.cardTitle}><span>🌱</span> Привычки</h2>
            <span style={{ fontSize: '13px', color: colors.secondary, background: `${colors.secondary}15`, padding: '4px 12px', borderRadius: '20px' }}>{habitProgress}%</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px' }}>
            {habits.map(h => (
              <div key={h.id} onClick={() => toggleHabit(h.id)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 10px',
                background: todayHabits[h.id] ? `linear-gradient(135deg, ${colors.primary}25, ${colors.secondary}25)` : (isDark ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.6)'),
                borderRadius: '16px', cursor: 'pointer', border: todayHabits[h.id] ? `1px solid ${colors.primary}50` : '1px solid transparent'
              }}>
                <div style={{ fontSize: '28px', marginBottom: '6px', filter: todayHabits[h.id] ? 'none' : 'grayscale(0.5)', opacity: todayHabits[h.id] ? 1 : 0.5 }}>{h.icon}</div>
                <div style={{ fontSize: '11px', textAlign: 'center', color: todayHabits[h.id] ? colors.text : colors.hint }}>{h.name}</div>
                {todayHabits[h.id] && <div style={{ marginTop: '6px', fontSize: '10px', color: colors.primary, background: `${colors.primary}25`, padding: '2px 8px', borderRadius: '10px' }}>✓</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={styles.card}>
          <h2 style={{...styles.cardTitle, marginBottom: '16px'}}><span>📝</span> Заметки</h2>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Благодарности, мысли, идеи..."
            style={{ width: '100%', minHeight: '80px', background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, borderRadius: '14px', padding: '14px 16px', color: colors.text, fontSize: '15px', resize: 'vertical', outline: 'none' }}/>
        </div>
      </div>
    );
  };

  // ==================== WEEK TAB ====================
  const WeekTab = () => {
    const weekDays = getWeekDays();
    const formatShort = (d) => ({ day: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'][d.getDay()], date: d.getDate() });
    
    let weekTasksDone = 0, weekTasksTotal = 0, weekHabitsDone = 0, weekHabitsTotal = 0;
    const dailyProgress = weekDays.map(d => {
      const key = d.toISOString().split('T')[0];
      const dh = habitHistory[key] || {};
      const hd = Object.values(dh).filter(Boolean).length;
      weekHabitsDone += hd;
      weekHabitsTotal += habits.length;
      const hp = habits.length > 0 ? Math.round((hd / habits.length) * 100) : 0;
      return { date: d, key, overall: hp, habitsDone: hd };
    });
    const weekHabitProg = weekHabitsTotal > 0 ? Math.round((weekHabitsDone / weekHabitsTotal) * 100) : 0;

    return (
      <div>
        {/* Main Dashboard */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.primary}25, ${colors.secondary}25)`,
          borderRadius: '24px', padding: '24px', marginBottom: '12px', border: `1px solid ${colors.primary}40`
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', color: colors.hint, marginBottom: '8px', textTransform: 'uppercase' }}>Прогресс недели</div>
            <div style={{ fontSize: '56px', fontWeight: '800', color: colors.primary }}>{weekHabitProg}%</div>
            <div style={{ fontSize: '13px', color: colors.hint }}>{weekHabitProg >= 70 ? '🔥 Отличная неделя!' : weekHabitProg >= 40 ? '💪 Хороший прогресс!' : '🚀 Есть куда расти!'}</div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: `conic-gradient(${colors.secondary} ${weekHabitProg * 3.6}deg, ${colors.secondary}30 0deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: isDark ? '#1e293b' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: colors.secondary }}>{weekHabitProg}%</span>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: colors.hint, marginTop: '8px' }}>Привычки</div>
            </div>
          </div>
        </div>

        {/* Progress Chart */}
        <div style={styles.card}>
          <h2 style={{...styles.cardTitle, marginBottom: '20px'}}><span>📈</span> Прогресс по дням</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px', gap: '6px' }}>
            {dailyProgress.map((d, i) => {
              const isToday = d.key === todayKey;
              const { day, date } = formatShort(d.date);
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '100%', maxWidth: '32px', height: `${Math.max(d.overall, 8)}%`, minHeight: '8px',
                    background: isToday ? `linear-gradient(180deg, ${colors.primary}, ${colors.primaryDark})` : d.overall >= 70 ? `${colors.primary}99` : d.overall >= 40 ? `${colors.warning}99` : `${colors.hint}66`,
                    borderRadius: '6px 6px 3px 3px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '2px'
                  }}>
                    {d.overall > 20 && <span style={{ fontSize: '9px', fontWeight: '600', color: 'white' }}>{d.overall}</span>}
                  </div>
                  <div style={{ fontSize: '10px', color: isToday ? colors.primary : colors.hint, fontWeight: isToday ? '600' : '400' }}>{day}</div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: isToday ? colors.primary : colors.text }}>{date}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Week Calendar */}
        <div style={styles.card}>
          <h2 style={{...styles.cardTitle, marginBottom: '20px'}}><span>📅</span> Дни недели</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {dailyProgress.map((d, i) => {
              const isToday = d.key === todayKey;
              const { day, date } = formatShort(d.date);
              return (
                <div key={i} style={{
                  textAlign: 'center', padding: '12px 8px', borderRadius: '12px',
                  background: isToday ? `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})` : (isDark ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.6)')
                }}>
                  <div style={{ fontSize: '11px', color: isToday ? 'rgba(255,255,255,0.8)' : colors.hint }}>{day}</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: isToday ? 'white' : colors.text }}>{date}</div>
                  <div style={{ fontSize: '10px', color: isToday ? 'rgba(255,255,255,0.7)' : colors.hint, marginTop: '4px' }}>{d.habitsDone}/{habits.length}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Habits Matrix */}
        <div style={styles.card}>
          <h2 style={{...styles.cardTitle, marginBottom: '16px'}}><span>🌱</span> Привычки за неделю</h2>
          <div style={{ overflowX: 'auto' }}>
            {habits.map(h => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '80px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <span>{h.icon}</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', flex: 1, justifyContent: 'flex-end' }}>
                  {dailyProgress.map((d, i) => {
                    const done = habitHistory[d.key]?.[h.id];
                    return (
                      <div key={i} style={{
                        width: '26px', height: '26px', borderRadius: '6px',
                        background: done ? colors.primary : (isDark ? 'rgba(100,116,139,0.2)' : 'rgba(100,116,139,0.1)'),
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'white'
                      }}>{done && '✓'}</div>
                    );
                  })}
                </div>
              </div>
            ))}
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
    const [filter, setFilter] = useState('all');
    const cats = ['Еда', 'Транспорт', 'Развлечения', 'Здоровье', 'Образование', 'Подписки', 'Доход', 'Другое'];
    
    const totalIncome = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    
    const expByCat = {};
    transactions.filter(t => t.amount < 0).forEach(t => { expByCat[t.category] = (expByCat[t.category] || 0) + Math.abs(t.amount); });
    
    const filtered = filter === 'all' ? transactions : filter === 'income' ? transactions.filter(t => t.amount > 0) : transactions.filter(t => t.amount < 0);

    return (
      <div>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
          <div style={{...styles.card, marginBottom: 0, textAlign: 'center', border: `1px solid ${colors.success}30`}}>
            <div style={{ fontSize: '11px', color: colors.hint }}>Доходы</div>
            <div style={{ fontSize: '17px', fontWeight: '700', color: colors.success }}>+{totalIncome.toLocaleString()}</div>
          </div>
          <div style={{...styles.card, marginBottom: 0, textAlign: 'center', border: `1px solid ${colors.danger}30`}}>
            <div style={{ fontSize: '11px', color: colors.hint }}>Расходы</div>
            <div style={{ fontSize: '17px', fontWeight: '700', color: colors.danger }}>-{totalExpenses.toLocaleString()}</div>
          </div>
          <div style={{...styles.card, marginBottom: 0, textAlign: 'center', border: `1px solid ${colors.primary}30`}}>
            <div style={{ fontSize: '11px', color: colors.hint }}>Баланс</div>
            <div style={{ fontSize: '17px', fontWeight: '700', color: totalIncome - totalExpenses >= 0 ? colors.primary : colors.danger }}>{(totalIncome - totalExpenses).toLocaleString()}</div>
          </div>
        </div>

        {/* Add */}
        <div style={styles.card}>
          <h2 style={{...styles.cardTitle, marginBottom: '16px'}}><span>➕</span> Новая транзакция</h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Описание..." value={newText} onChange={(e) => setNewText(e.target.value)} style={{...styles.input, minWidth: '120px'}}/>
            <input type="number" placeholder="±Сумма" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} style={{...styles.input, width: '100px', flex: 'none'}}/>
            <select value={newCat} onChange={(e) => setNewCat(e.target.value)} style={{...styles.input, width: '110px', flex: 'none'}}>
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => { addTransaction(newText, newAmount, newCat); setNewText(''); setNewAmount(''); }} style={styles.button}>+</button>
          </div>
        </div>

        {/* By Category */}
        {Object.keys(expByCat).length > 0 && (
          <div style={styles.card}>
            <h2 style={{...styles.cardTitle, marginBottom: '16px'}}><span>📊</span> Расходы по категориям</h2>
            {Object.entries(expByCat).sort((a,b) => b[1] - a[1]).map(([cat, amt]) => {
              const pct = totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0;
              return (
                <div key={cat} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px' }}>{cat}</span>
                    <span style={{ fontSize: '13px', color: colors.hint }}>{amt.toLocaleString()} ₽ ({pct}%)</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{ height: '100%', width: `${pct}%`, background: colors.danger, borderRadius: '3px' }}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* History */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={styles.cardTitle}><span>📜</span> История</h2>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['all', 'income', 'expense'].map(f => (
                <button key={f} onClick={() => { setFilter(f); haptic('selection'); }} style={{
                  padding: '6px 12px', borderRadius: '8px', border: 'none',
                  background: filter === f ? colors.primary : `${colors.hint}20`,
                  color: filter === f ? 'white' : colors.hint, fontSize: '12px', cursor: 'pointer'
                }}>{f === 'all' ? 'Все' : f === 'income' ? '↑' : '↓'}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: colors.hint }}>Нет транзакций</div>
            ) : filtered.slice().reverse().slice(0, 20).map(t => (
              <div key={t.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px',
                background: isDark ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.6)', borderRadius: '14px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>{t.text}</div>
                  <div style={{ fontSize: '11px', color: colors.hint }}>{t.category} • {t.date}</div>
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: t.amount > 0 ? colors.success : colors.danger, marginRight: '8px' }}>
                  {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()} ₽
                </div>
                <button onClick={() => deleteTransaction(t.id)} style={{ background: 'none', border: 'none', color: colors.danger, fontSize: '18px', cursor: 'pointer', opacity: 0.6 }}>×</button>
              </div>
            ))}
          </div>
        </div>
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

    const removeAvatar = async () => {
      if (await showConfirm('Удалить аватарку?')) {
        setProfile({ ...profile, avatar: '' });
        haptic('warning');
      }
    };

    const submitUGC = () => {
      if (!ugcForm.name.trim() || !ugcForm.instagram.trim()) { showAlert('Заполните имя и Instagram'); return; }
      console.log('UGC:', ugcForm);
      setSubmitted(true);
      haptic('success');
    };

    return (
      <div>
        {/* Profile */}
        <div style={styles.card}>
          <h2 style={{...styles.cardTitle, marginBottom: '20px'}}><span>👤</span> Мой профиль</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ position: 'relative' }}>
              <div onClick={() => fileRef.current?.click()} style={{
                width: '80px', height: '80px', borderRadius: '24px',
                background: profile.avatar ? `url(${profile.avatar}) center/cover` : `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px',
                border: `3px solid ${colors.primary}40`, cursor: 'pointer'
              }}>{!profile.avatar && (profile.name ? profile.name[0].toUpperCase() : '👤')}</div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }}/>
              <div style={{
                position: 'absolute', bottom: '-4px', right: '-4px', width: '28px', height: '28px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${isDark ? '#1e293b' : '#fff'}`, fontSize: '14px'
              }}>📷</div>
              {profile.avatar && (
                <button onClick={removeAvatar} style={{
                  position: 'absolute', top: '-4px', right: '-4px', width: '24px', height: '24px', borderRadius: '50%',
                  background: colors.danger, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${isDark ? '#1e293b' : '#fff'}`, fontSize: '12px', color: 'white', cursor: 'pointer', padding: 0
                }}>×</button>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <input type="text" placeholder="Ваше имя" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                style={{...styles.input, width: '100%', fontSize: '17px', fontWeight: '600'}}/>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div style={{ background: isDark ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.6)', borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: colors.primary }}>{Object.keys(habitHistory).length}</div>
              <div style={{ fontSize: '12px', color: colors.hint }}>Дней активности</div>
            </div>
            <div style={{ background: isDark ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.6)', borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: colors.secondary }}>{transactions.length}</div>
              <div style={{ fontSize: '12px', color: colors.hint }}>Транзакций</div>
            </div>
          </div>
        </div>

        {/* Mood */}
        <div style={styles.card}>
          <h2 style={{...styles.cardTitle, marginBottom: '16px'}}><span>😊</span> Настроение</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
            {moodEmojis.map((e, i) => (
              <button key={i} onClick={() => { setProfile({ ...profile, mood: i }); haptic('selection'); }} style={{
                flex: 1, padding: '14px', borderRadius: '14px',
                border: profile.mood === i ? `2px solid ${colors.warning}` : '2px solid transparent',
                background: profile.mood === i ? `${colors.warning}25` : (isDark ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.6)'),
                fontSize: '26px', cursor: 'pointer'
              }}>{e}</button>
            ))}
          </div>
        </div>

        {/* UGC */}
        <div style={{...styles.card, background: `linear-gradient(135deg, ${colors.warning}15, ${colors.danger}10)`, border: `1px solid ${colors.warning}40`}}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎬</div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 8px', color: colors.warning }}>Стань UGC-креатором!</h2>
            <p style={{ fontSize: '13px', color: colors.hint, margin: 0 }}>Зарабатывай, создавая контент</p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>💰 Что вы получаете</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {[{i:'💵',t:'от 5 000 ₽',d:'за обзор'},{i:'📈',t:'до 40%',d:'с продаж'},{i:'🎁',t:'Бесплатно',d:'все планеры'},{i:'🤝',t:'Поддержка',d:'с контентом'}].map((x,j) => (
                <div key={j} style={{ background: isDark ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.6)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', marginBottom: '4px' }}>{x.i}</div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: colors.warning }}>{x.t}</div>
                  <div style={{ fontSize: '10px', color: colors.hint }}>{x.d}</div>
                </div>
              ))}
            </div>
          </div>

          {!submitted ? (
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>📝 Оставить заявку</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                <input type="text" placeholder="Ваше имя *" value={ugcForm.name} onChange={(e) => setUgcForm({...ugcForm, name: e.target.value})} style={styles.input}/>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <input type="text" placeholder="Instagram @ *" value={ugcForm.instagram} onChange={(e) => setUgcForm({...ugcForm, instagram: e.target.value})} style={styles.input}/>
                  <input type="text" placeholder="TikTok @" value={ugcForm.tiktok} onChange={(e) => setUgcForm({...ugcForm, tiktok: e.target.value})} style={styles.input}/>
                </div>
                <input type="text" placeholder="Размер аудитории" value={ugcForm.audience} onChange={(e) => setUgcForm({...ugcForm, audience: e.target.value})} style={styles.input}/>
              </div>
              <button onClick={submitUGC} style={{...styles.button, width: '100%', background: `linear-gradient(135deg, ${colors.warning}, #d97706)`, padding: '16px', fontSize: '16px'}}>Отправить заявку 🚀</button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: colors.primary }}>Заявка отправлена!</h3>
              <p style={{ fontSize: '13px', color: colors.hint }}>Мы свяжемся с вами</p>
            </div>
          )}

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: colors.hint, marginBottom: '10px' }}>Или напишите напрямую:</p>
            <button onClick={() => openTelegramLink('https://t.me/abramotti')} style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
              background: 'rgba(0,136,204,0.15)', borderRadius: '14px', color: '#00a8e8',
              border: '1px solid rgba(0,136,204,0.3)', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
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
      {/* Header */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
          }}>📋</div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', margin: 0, color: colors.primary }}>LifePlan</h1>
            <p style={{ fontSize: '11px', color: colors.hint, margin: 0 }}>{formatDate(today)}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '26px', fontWeight: '800', color: overallProgress >= 70 ? colors.primary : colors.warning }}>{overallProgress}%</div>
          <div style={{ fontSize: '10px', color: colors.hint }}>сегодня</div>
        </div>
      </header>

      {/* Content */}
      <div style={styles.content}>
        {activeTab === 'today' && <TodayTab />}
        {activeTab === 'week' && <WeekTab />}
        {activeTab === 'finance' && <FinanceTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); haptic('selection'); }} style={styles.navItem(activeTab === tab.id, colors)}>
            <span style={{ fontSize: '22px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
