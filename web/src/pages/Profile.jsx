import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout/Layout';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const inputStyle = {
  width: '100%', padding: '11px 14px', background: '#0f172a', border: '1px solid #334155',
  borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '500', marginBottom: '6px',
};

const roleColor = { admin: '#f59e0b', manager: '#10b981', employee: '#60a5fa' };

export const Profile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [infoSuccess, setInfoSuccess] = useState('');
  const [infoError, setInfoError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [infoLoading, setInfoLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then(res => {
      setProfile(res.data);
      setForm({ first_name: res.data.first_name || '', last_name: res.data.last_name || '', phone: res.data.phone || '' });
    }).catch(console.error);
  }, []);

  const handleInfo = async (e) => {
    e.preventDefault();
    setInfoError(''); setInfoSuccess('');
    setInfoLoading(true);
    try {
      const res = await api.put('/auth/me', form);
      setProfile(res.data);
      if (setUser) setUser(prev => ({ ...prev, first_name: res.data.first_name, last_name: res.data.last_name }));
      setInfoSuccess('Bilgiler güncellendi.');
    } catch (err) {
      setInfoError(err.response?.data?.error || 'Güncelleme başarısız');
    } finally {
      setInfoLoading(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (pwForm.new_password !== pwForm.confirm) return setPwError('Yeni şifreler eşleşmiyor');
    if (pwForm.new_password.length < 6) return setPwError('Şifre en az 6 karakter olmalı');
    setPwLoading(true);
    try {
      await api.put('/auth/me/password', { current_password: pwForm.current_password, new_password: pwForm.new_password });
      setPwForm({ current_password: '', new_password: '', confirm: '' });
      setPwSuccess('Şifre başarıyla güncellendi.');
    } catch (err) {
      setPwError(err.response?.data?.error || 'Şifre güncellenemedi');
    } finally {
      setPwLoading(false);
    }
  };

  if (!profile) return <Layout><p style={{ color: '#475569', padding: '40px', textAlign: 'center' }}>Yükleniyor...</p></Layout>;

  return (
    <Layout>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#f1f5f9', fontSize: '26px', fontWeight: '700', margin: '0 0 4px', letterSpacing: '-0.3px' }}>Profilim</h1>
        <p style={{ color: '#475569', margin: 0, fontSize: '14px' }}>Hesap bilgilerini görüntüle ve güncelle</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '900px' }}>

        {/* Profil özeti */}
        <div style={{ gridColumn: '1 / -1', background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '700', fontSize: '22px',
          }}>
            {profile.first_name?.[0]}{profile.last_name?.[0]}
          </div>
          <div>
            <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', margin: '0 0 4px' }}>
              {profile.first_name} {profile.last_name}
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px' }}>{profile.email}</p>
            <span style={{
              background: `${roleColor[profile.role] || '#60a5fa'}22`,
              color: roleColor[profile.role] || '#60a5fa',
              padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize',
            }}>
              {profile.role}
            </span>
          </div>
          {profile.last_login && (
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <p style={{ color: '#475569', fontSize: '12px', margin: 0 }}>Son giriş</p>
              <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                {new Date(profile.last_login).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
        </div>

        {/* Bilgi güncelleme */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '24px' }}>
          <h3 style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: '600', margin: '0 0 20px' }}>Kişisel Bilgiler</h3>
          {infoSuccess && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>{infoSuccess}</div>}
          {infoError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>{infoError}</div>}
          <form onSubmit={handleInfo} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Ad</label>
              <input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Soyad</label>
              <input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Telefon</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} placeholder="Telefon numarası" />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input value={profile.email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
              <p style={{ color: '#475569', fontSize: '12px', margin: '4px 0 0' }}>Email adresi değiştirilemez</p>
            </div>
            <button type="submit" disabled={infoLoading} style={{
              padding: '11px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
              cursor: infoLoading ? 'not-allowed' : 'pointer', opacity: infoLoading ? 0.7 : 1, marginTop: '4px',
            }}>
              {infoLoading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </form>
        </div>

        {/* Şifre değiştirme */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '24px' }}>
          <h3 style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: '600', margin: '0 0 20px' }}>Şifre Değiştir</h3>
          {pwSuccess && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>{pwSuccess}</div>}
          {pwError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>{pwError}</div>}
          <form onSubmit={handlePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Mevcut Şifre</label>
              <input type="password" placeholder="••••••••" value={pwForm.current_password}
                onChange={e => setPwForm({ ...pwForm, current_password: e.target.value })} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Yeni Şifre</label>
              <input type="password" placeholder="••••••••" value={pwForm.new_password}
                onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Yeni Şifre (Tekrar)</label>
              <input type="password" placeholder="••••••••" value={pwForm.confirm}
                onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} style={inputStyle} required />
            </div>
            <button type="submit" disabled={pwLoading} style={{
              padding: '11px', background: 'linear-gradient(135deg, #f59e0b, #f97316)',
              color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
              cursor: pwLoading ? 'not-allowed' : 'pointer', opacity: pwLoading ? 0.7 : 1, marginTop: '4px',
            }}>
              {pwLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </button>
          </form>
        </div>

      </div>
    </Layout>
  );
};
