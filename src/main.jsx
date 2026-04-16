import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './AuthContext'
import { useAuth } from './AuthContext'
import App from './App'
import AuthScreen from './AuthScreen'

function Root() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#f5f4f0', fontFamily:"'Hiragino Sans','Yu Gothic',sans-serif" }}>
      <div style={{ textAlign:'center', color:'#888' }}>
        <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>⏱</div>
        <div>読み込み中...</div>
      </div>
    </div>
  );
  return user ? <App /> : <AuthScreen />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </React.StrictMode>
);
