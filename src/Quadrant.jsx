import { useState } from 'react';

const QUADRANT_CONFIG = {
  a: { label: 'A 重要・緊急',   desc: '今すぐやる仕事',         badgeStyle: { background:'#fee2e2', color:'#b91c1c' }, borderColor: '#fca5a5' },
  b: { label: 'B 重要・非緊急', desc: '計画的に取り組む仕事',   badgeStyle: { background:'#dbeafe', color:'#1d4ed8' }, borderColor: '#93c5fd' },
  c: { label: 'C 小さな雑草',   desc: '素早く片付けるか委任',   badgeStyle: { background:'#f3f4f6', color:'#374151' }, borderColor: '#d1d5db' },
  d: { label: 'D 無駄・緊急',   desc: 'できれば委任する',       badgeStyle: { background:'#fef9c3', color:'#92400e' }, borderColor: '#fcd34d' },
  e: { label: 'E 無駄・非緊急', desc: 'やめるか後回し',         badgeStyle: { background:'#f3f4f6', color:'#6b7280' }, borderColor: '#d1d5db' },
};

export default function Quadrant({ quadrant, tasks, stats, onAdd, onToggle, onDelete, wide }) {
  const [inputVal, setInputVal] = useState('');
  const cfg = QUADRANT_CONFIG[quadrant];

  const handleAdd = () => {
    const t = inputVal.trim();
    if (!t) return;
    onAdd(t);
    setInputVal('');
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '0.85rem',
      border: `1.5px solid ${cfg.borderColor}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      gridColumn: wide ? '1 / -1' : undefined,
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <span style={{ display:'inline-block', padding:'0.25rem 0.65rem', borderRadius:'20px', fontSize:'0.75rem', fontWeight:'700', ...cfg.badgeStyle }}>
            {cfg.label}
          </span>
          <div style={{ fontSize:'0.7rem', color:'#999', marginTop:'0.15rem' }}>{cfg.desc}</div>
        </div>
        <span style={{ fontSize:'0.7rem', color:'#aaa', whiteSpace:'nowrap' }}>
          {stats.done}/{stats.total} {stats.total > 0 ? `(${stats.pct}%)` : ''}
        </span>
      </div>

      {/* Progress bar */}
      {stats.total > 0 && (
        <div style={{ height:'3px', background:'#eee', borderRadius:'2px', overflow:'hidden' }}>
          <div style={{ width:`${stats.pct}%`, height:'100%', background: quadrant === 'a' ? '#ef4444' : quadrant === 'b' ? '#3b82f6' : quadrant === 'd' ? '#f59e0b' : '#9ca3af', transition:'width 0.4s' }} />
        </div>
      )}

      {/* Task list */}
      <ul style={{ listStyle:'none', display:'flex', flexDirection: wide ? 'row' : 'column', flexWrap: wide ? 'wrap' : 'nowrap', gap:'0.35rem', margin:0, padding:0 }}>
        {tasks.map(task => (
          <li key={task.id} style={{
            display:'flex', alignItems:'center', gap:'0.5rem',
            padding:'0.45rem 0.6rem', background:'#fafaf9',
            borderRadius:'8px', border:'1px solid #f0ede8',
            opacity: task.done ? 0.55 : 1,
            width: wide ? 'calc(50% - 0.175rem)' : '100%',
            boxSizing: 'border-box',
          }}>
            <CheckCircle checked={task.done} onClick={() => onToggle(task.id)} />
            <span style={{ flex:1, fontSize:'0.82rem', color:'#333', textDecoration: task.done ? 'line-through' : 'none' }}>
              {task.text}
            </span>
            <button onClick={() => onDelete(task.id)} style={{ background:'none', border:'none', color:'#ccc', cursor:'pointer', fontSize:'1rem', lineHeight:1, padding:'0 0.2rem', transition:'color 0.15s' }}
              onMouseEnter={e => e.target.style.color='#ef4444'} onMouseLeave={e => e.target.style.color='#ccc'}>
              ×
            </button>
          </li>
        ))}
      </ul>

      {/* Add task */}
      <div style={{ display:'flex', gap:'0.4rem' }}>
        <input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="タスクを追加..."
          style={{ flex:1, padding:'0.4rem 0.6rem', border:'1.5px solid #e8e5e0', borderRadius:'7px', fontSize:'0.82rem', outline:'none', background:'#fafaf9' }}
        />
        <button onClick={handleAdd} style={{ padding:'0.4rem 0.75rem', background:'#4a6cf7', color:'#fff', border:'none', borderRadius:'7px', fontSize:'0.82rem', cursor:'pointer', fontWeight:'600' }}>
          追加
        </button>
      </div>
    </div>
  );
}

function CheckCircle({ checked, onClick }) {
  return (
    <div onClick={onClick} style={{
      width:'17px', height:'17px', borderRadius:'50%',
      border: checked ? 'none' : '2px solid #d1d5db',
      background: checked ? '#4a6cf7' : '#fff',
      cursor:'pointer', flexShrink:0,
      display:'flex', alignItems:'center', justifyContent:'center',
      transition:'all 0.2s',
    }}>
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
}
