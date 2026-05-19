import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Register = () => {
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form.email, form.password, form.first_name, form.last_name);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '8px', color: '#1d4ed8' }}>Kayıt Ol</h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '32px' }}>Yeni hesap oluşturun</p>

        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="text" placeholder="Ad" required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} style={inputStyle} />
          <input type="text" placeholder="Soyad" required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} style={inputStyle} />
          <input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
          <input type="password" placeholder="Şifre" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} />
          <button type="submit" disabled={loading}
            style={{ padding: '12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#64748b' }}>
          Zaten hesabın var mı? <Link to="/login" style={{ color: '#1d4ed8' }}>Giriş yap</Link>
        </p>
      </div>
    </div>
  );
};
