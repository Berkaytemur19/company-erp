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
    <div style={{
      minHeight: '100vh', display: 'flex', background: '#0f172a',
    }}>
      {/* Sol panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        borderRight: '1px solid #1e293b',
      }}>
        <div style={{ maxWidth: '420px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div style={{
              width: '44px', height: '44px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: 'bold', color: 'white',
            }}>E</div>
            <span style={{ color: 'white', fontWeight: '700', fontSize: '22px' }}>
              Company <span style={{ color: '#3b82f6' }}>ERP</span>
            </span>
          </div>

          <h1 style={{ color: '#f1f5f9', fontSize: '32px', fontWeight: '700', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Tekrar hoş geldin
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px', margin: '0 0 40px' }}>
            Hesabına giriş yap ve işlemlere devam et.
          </p>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px',
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email" required placeholder="ornek@sirket.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                style={{
                  width: '100%', padding: '12px 14px', background: '#1e293b', border: '1px solid #334155',
                  borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                Şifre
              </label>
              <input
                type="password" required placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                style={{
                  width: '100%', padding: '12px 14px', background: '#1e293b', border: '1px solid #334155',
                  borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', marginTop: '8px',
              background: loading ? '#1d4ed8' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px',
              fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', color: '#475569', fontSize: '14px' }}>
            Hesabın yok mu?{' '}
            <Link to="/register" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>
              Kayıt ol
            </Link>
          </p>
        </div>
      </div>

      {/* Sağ panel — dekoratif */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#080d1a', padding: '60px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '380px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
            {[
              { label: 'Çalışanlar', value: '—', color: '#3b82f6' },
              { label: 'Ürünler', value: '—', color: '#10b981' },
              { label: 'Mesajlar', value: '—', color: '#f59e0b' },
              { label: 'Departmanlar', value: '—', color: '#6366f1' },
            ].map(card => (
              <div key={card.label} style={{
                background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px',
                padding: '20px', textAlign: 'left',
              }}>
                <p style={{ margin: '0 0 6px', color: '#475569', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                  {card.label}
                </p>
                <p style={{ margin: 0, color: card.color, fontSize: '28px', fontWeight: '700' }}>{card.value}</p>
              </div>
            ))}
          </div>
          <p style={{ color: '#1e293b', fontSize: '13px' }}>Giriş yaparak verilerine ulaş</p>
        </div>
      </div>
    </div>
  );
};
