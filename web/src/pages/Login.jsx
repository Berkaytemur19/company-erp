import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '8px', color: '#1d4ed8' }}>Company ERP</h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '32px' }}>Hesabınıza giriş yapın</p>

        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="email" placeholder="Email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
          />
          <input
            type="password" placeholder="Şifre" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
          />
          <button type="submit" disabled={loading}
            style={{ padding: '12px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#64748b' }}>
          Hesabın yok mu? <Link to="/register" style={{ color: '#1d4ed8' }}>Kayıt ol</Link>
        </p>
      </div>
    </div>
  );
};
