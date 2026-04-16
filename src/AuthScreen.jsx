import { useState } from 'react';
import { useAuth } from './AuthContext';

export default function AuthScreen() {
  const { register, login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('メールとパスワードを入力してください'); return; }
    if (password.length < 6) { setError('パスワードは6文字以上にしてください'); return; }
    if (isRegister && !name) { setError('お名前を入力してください'); return; }

    setLoading(true);
    try {
      if (isRegister) await register(email, password, name);
      else await login(email, password);
    } catch (err) {
      const msgs = {
        'auth/user-not-found': 'メールアドレスが見つかりません',
        'auth/wrong-password': 'パスワードが正しくありません',
        'auth/email-already-in-use': 'このメールアドレスは既に登録されています',
        'auth/invalid-email': 'メールアドレスの形式が正しくありません',
        'auth/invalid-credential': 'メールアドレスまたはパスワードが正しくありません',
      };
      setError(msgs[err.code] || 'エラーが発生しました: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.icon}>⏱</div>
        <h1 style={styles.title}>時間管理マトリックス</h1>
        <p style={styles.sub}>{isRegister ? '新規アカウント作成' : 'ログイン'}</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>メールアドレス</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>パスワード</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="6文字以上"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>
          {isRegister && (
            <div style={styles.field}>
              <label style={styles.label}>お名前</label>
              <input
                style={styles.input}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="山田 太郎"
              />
            </div>
          )}
          <button type="submit" style={{...styles.btn, opacity: loading ? 0.7 : 1}} disabled={loading}>
            {loading ? '処理中...' : (isRegister ? '新規登録' : 'ログイン')}
          </button>
        </form>

        <p style={styles.switchText}>
          {isRegister ? 'すでにアカウントをお持ちの方は' : 'アカウントをお持ちでない方は'}{' '}
          <span style={styles.switchLink} onClick={() => { setIsRegister(!isRegister); setError(''); }}>
            {isRegister ? 'ログイン' : '新規登録'}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrap: { display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', padding:'1rem', background:'#f5f4f0' },
  card: { background:'#fff', borderRadius:'16px', padding:'2.5rem', width:'100%', maxWidth:'380px', boxShadow:'0 4px 24px rgba(0,0,0,0.08)' },
  icon: { textAlign:'center', fontSize:'2.5rem', marginBottom:'0.5rem' },
  title: { textAlign:'center', fontSize:'1.3rem', fontWeight:'700', color:'#1a1a1a', marginBottom:'0.25rem' },
  sub: { textAlign:'center', fontSize:'0.85rem', color:'#888', marginBottom:'1.75rem' },
  error: { background:'#fff0f0', color:'#d32f2f', padding:'0.6rem 0.9rem', borderRadius:'8px', fontSize:'0.83rem', marginBottom:'1rem' },
  field: { marginBottom:'1rem' },
  label: { display:'block', fontSize:'0.8rem', fontWeight:'600', color:'#555', marginBottom:'0.35rem' },
  input: { width:'100%', padding:'0.65rem 0.9rem', border:'1.5px solid #e0e0e0', borderRadius:'8px', fontSize:'0.95rem', outline:'none', boxSizing:'border-box' },
  btn: { width:'100%', padding:'0.75rem', background:'#4a6cf7', color:'#fff', border:'none', borderRadius:'8px', fontSize:'0.95rem', fontWeight:'600', cursor:'pointer' },
  switchText: { textAlign:'center', marginTop:'1rem', fontSize:'0.85rem', color:'#888' },
  switchLink: { color:'#4a6cf7', cursor:'pointer', fontWeight:'600' },
};
