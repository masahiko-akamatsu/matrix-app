import { useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useTasks } from './useTasks';
import { useTimer } from './useTimer';
import Quadrant from './Quadrant';

const STAT_COLORS = { a:'#ef4444', b:'#3b82f6', c:'#9ca3af', d:'#f59e0b', e:'#d1d5db', total:'#4a6cf7' };

export default function App() {
  const { user, logout } = useAuth();
  const { tasks, synced, addTask, toggleTask, deleteTask, getStats, getTotalStats } = useTasks(user?.uid);
  const timer = useTimer();
  const [limitHours, setLimitHours] = useState(8);
  const [alarmSet, setAlarmSet] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);

  const playAlarmSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.5, 1.0].forEach(offset => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.4);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.5);
      });
    } catch {}
  };

  const handleSetAlarm = () => {
    timer.setAlarm(limitHours, () => {
      setShowAlarm(true);
      playAlarmSound();
    });
    setAlarmSet(true);
  };

  const totalStats = getTotalStats();
  const timerColor = timer.warningLevel === 'danger' ? '#ef4444'
    : timer.warningLevel === 'warning' ? '#f59e0b' : '#1a1a1a';

  if (!synced) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#f5f4f0' }}>
      <div style={{ textAlign:'center', color:'#888' }}>
        <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>⏱</div>
        <div>読み込み中...</div>
      </div>
    </div>
  );

  return (
    <div style={{ background:'#f5f4f0', minHeight:'100vh', fontFamily:"'Hiragino Sans','Yu Gothic',sans-serif" }}>
      {/* HEADER */}
      <div style={{ background:'#fff', padding:'0.85rem 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #ebebeb', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ fontSize:'1.05rem', fontWeight:'700', color:'#1a1a1a' }}>⏱ 時間管理マトリックス</div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <span style={{ fontSize:'0.8rem', color:'#666' }}>{user?.displayName || user?.email} さん</span>
          <button onClick={logout} style={{ padding:'0.35rem 0.85rem', background:'transparent', border:'1.5px solid #e0e0e0', borderRadius:'6px', fontSize:'0.8rem', cursor:'pointer', color:'#555' }}>
            ログアウト
          </button>
        </div>
      </div>

      {/* STATS BAR */}
      <div style={{ background:'#fff', padding:'0.75rem 1.25rem', display:'flex', gap:'1rem', borderBottom:'1px solid #ebebeb', overflowX:'auto' }}>
        {[['total','全体達成率'],['a','A達成率'],['b','B達成率'],['c','C達成率'],['d','D達成率'],['e','E達成率']].map(([key, label]) => {
          const s = key === 'total' ? totalStats : getStats(key);
          return (
            <div key={key} style={{ display:'flex', flexDirection:'column', alignItems:'center', minWidth:'72px' }}>
              <span style={{ fontSize:'0.7rem', color:'#888', marginBottom:'0.15rem', whiteSpace:'nowrap' }}>{label}</span>
              <span style={{ fontSize:'1.05rem', fontWeight:'700', color:'#1a1a1a' }}>{s.pct}%</span>
              <div style={{ height:'4px', background:'#eee', borderRadius:'2px', width:'72px', marginTop:'0.2rem', overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:'2px', background: STAT_COLORS[key], width:`${s.pct}%`, transition:'width 0.4s' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* TIMER */}
      <div style={{ background:'#fff', margin:'0.75rem 0.75rem 0', borderRadius:'12px', padding:'0.85rem 1.1rem', border:'1px solid #ebebeb' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
          <span style={{ fontSize:'0.8rem', fontWeight:'600', color:'#555' }}>⏰ 今日の作業時間</span>
          <span style={{ fontSize:'1.3rem', fontWeight:'700', fontVariantNumeric:'tabular-nums', color: timerColor }}>{timer.formatted}</span>
          <button onClick={timer.running ? timer.stop : timer.start}
            style={{ padding:'0.3rem 0.75rem', borderRadius:'6px', border:'1.5px solid', borderColor: timer.running ? '#4a6cf7' : '#e0e0e0', background: timer.running ? '#4a6cf7' : '#fff', color: timer.running ? '#fff' : '#555', fontSize:'0.78rem', cursor:'pointer', fontWeight:'600' }}>
            {timer.running ? '停止' : '開始'}
          </button>
          <button onClick={timer.reset} style={btnSm}>リセット</button>
          <span style={{ fontSize:'0.8rem', color:'#555', marginLeft:'0.5rem' }}>制限:</span>
          <input type="number" value={limitHours} onChange={e => setLimitHours(Number(e.target.value))} min="1" max="24"
            style={{ width:'55px', padding:'0.3rem 0.5rem', border:'1.5px solid #e0e0e0', borderRadius:'6px', fontSize:'0.85rem', textAlign:'center' }} />
          <span style={{ fontSize:'0.8rem', color:'#888' }}>時間</span>
          <button onClick={handleSetAlarm} style={btnSm}>アラームセット</button>
          {alarmSet && <span style={{ fontSize:'0.78rem', color:'#4a6cf7', fontWeight:'600' }}>🔔 {limitHours}時間後にアラーム</span>}
        </div>
      </div>

      {/* MATRIX */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem', padding:'0.75rem' }}>
        <Quadrant quadrant="b" tasks={tasks.b} stats={getStats('b')} onAdd={t => addTask('b',t)} onToggle={id => toggleTask('b',id)} onDelete={id => deleteTask('b',id)} />
        <Quadrant quadrant="a" tasks={tasks.a} stats={getStats('a')} onAdd={t => addTask('a',t)} onToggle={id => toggleTask('a',id)} onDelete={id => deleteTask('a',id)} />
        <Quadrant quadrant="c" tasks={tasks.c} stats={getStats('c')} onAdd={t => addTask('c',t)} onToggle={id => toggleTask('c',id)} onDelete={id => deleteTask('c',id)} wide />
        <Quadrant quadrant="e" tasks={tasks.e} stats={getStats('e')} onAdd={t => addTask('e',t)} onToggle={id => toggleTask('e',id)} onDelete={id => deleteTask('e',id)} />
        <Quadrant quadrant="d" tasks={tasks.d} stats={getStats('d')} onAdd={t => addTask('d',t)} onToggle={id => toggleTask('d',id)} onDelete={id => deleteTask('d',id)} />
      </div>

      {/* ALARM MODAL */}
      {showAlarm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:'16px', padding:'2rem', textAlign:'center', maxWidth:'320px', width:'90%' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>🔔</div>
            <div style={{ fontSize:'1.2rem', fontWeight:'700', color:'#1a1a1a', marginBottom:'0.5rem' }}>時間制限に達しました！</div>
            <div style={{ fontSize:'0.9rem', color:'#666', marginBottom:'1.25rem' }}>{limitHours}時間の作業時間が終了しました。<br />休憩を取りましょう！</div>
            <button onClick={() => setShowAlarm(false)} style={{ padding:'0.65rem 2rem', background:'#4a6cf7', color:'#fff', border:'none', borderRadius:'8px', fontSize:'0.95rem', fontWeight:'600', cursor:'pointer' }}>
              確認
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const btnSm = { padding:'0.3rem 0.75rem', borderRadius:'6px', border:'1.5px solid #e0e0e0', background:'#fff', fontSize:'0.78rem', cursor:'pointer', fontWeight:'600', color:'#555' };
