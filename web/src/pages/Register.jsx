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

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: '#1e293b', border: '1px solid #334155',
    borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '500', marginBottom: '6px',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{
        width: '100%', maxWidth: '460px', margin: '40px 20px',
        background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '40px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{
            width: '36px', height: '36px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '700', fontSize: '18px',
          }}>E</div>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>
            Company <span style={{ color: '#3b82f6' }}>ERP</span>
          </span>
        </div>

        <h1 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: '700', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
          Hesap Oluştur
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 32px' }}>
          Bilgilerini gir, hemen başla.
        </p>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px',
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Ad</label>
              <input placeholder="Ahmet" required value={form.first_name}
                onChange={e => setForm({ ...form, first_name: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Soyad</label>
              <input placeholder="Yılmaz" required value={form.last_name}
                onChange={e => setForm({ ...form, last_name: e.target.value })} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" placeholder="ornek@sirket.com" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Şifre</label>
            <input type="password" placeholder="••••••••" required value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} style={inputStyle} />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px', marginTop: '8px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px',
            fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#475569', fontSize: '14px' }}>
          Zaten hesabın var mı?{' '}
          <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  );
};
