import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout/Layout';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const inputStyle = {
  width: '100%', padding: '11px 14px', background: '#0f172a', border: '1px solid #334155',
  borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
};

const labelStyle = { display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '500', marginBottom: '5px' };

const statusConfig = {
  pending:  { label: 'Bekliyor',  bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24' },
  approved: { label: 'Onaylandı', bg: 'rgba(16,185,129,0.15)',  color: '#34d399' },
  rejected: { label: 'Reddedildi', bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
};

const typeLabel = { annual: 'Yıllık İzin', sick: 'Hastalık', personal: 'Kişisel', other: 'Diğer' };

export const Leaves = () => {
  const { user } = useAuth();
  const isManager = ['admin', 'manager'].includes(user?.role);
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'annual', start_date: '', end_date: '', reason: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/leaves');
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/leaves', form);
      setForm({ type: 'annual', start_date: '', end_date: '', reason: '' });
      setShowForm(false);
      setSuccess('İzin talebiniz oluşturuldu.');
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.error || 'Hata oluştu');
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.put(`/leaves/${id}/${action}`);
      fetchLeaves();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.delete(`/leaves/${id}`);
      fetchLeaves();
    } catch (err) {
      console.error(err);
    }
  };

  const daysBetween = (start, end) => {
    const d = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
    return d;
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: '26px', fontWeight: '700', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            İzin Yönetimi
          </h1>
          <p style={{ color: '#475569', margin: 0, fontSize: '14px' }}>
            {isManager ? `${leaves.filter(l => l.status === 'pending').length} bekleyen talep` : 'İzin talepleriniz'}
          </p>
        </div>
        {!isManager && (
          <button onClick={() => setShowForm(!showForm)} style={{
            padding: '10px 20px', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            background: showForm ? '#334155' : 'linear-gradient(135deg, #10b981, #3b82f6)',
            color: showForm ? '#94a3b8' : 'white',
          }}>
            {showForm ? '✕ İptal' : '+ İzin Talebi Oluştur'}
          </button>
        )}
      </div>

      {success && (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>
          {success}
        </div>
      )}

      {showForm && (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '28px', marginBottom: '24px' }}>
          <h3 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '600', margin: '0 0 20px' }}>Yeni İzin Talebi</h3>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>İzin Türü</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                  <option value="annual">Yıllık İzin</option>
                  <option value="sick">Hastalık İzni</option>
                  <option value="personal">Kişisel İzin</option>
                  <option value="other">Diğer</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Başlangıç Tarihi</label>
                <input type="date" required value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                  style={{ ...inputStyle, colorScheme: 'dark' }} />
              </div>
              <div>
                <label style={labelStyle}>Bitiş Tarihi</label>
                <input type="date" required value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                  style={{ ...inputStyle, colorScheme: 'dark' }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Açıklama (isteğe bağlı)</label>
              <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                placeholder="İzin sebebini açıklayın..." rows={3}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div>
              <button type="submit" style={{
                padding: '11px 28px', background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              }}>Talep Oluştur</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <p style={{ color: '#475569', textAlign: 'center', padding: '40px' }}>Yükleniyor...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {leaves.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#475569', fontSize: '14px' }}>
              Henüz izin talebi yok.
            </div>
          )}
          {leaves.map(leave => {
            const sc = statusConfig[leave.status];
            const days = daysBetween(leave.start_date, leave.end_date);
            const isOwn = leave.user_id === user?.id;
            return (
              <div key={leave.id} style={{
                background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '20px',
                display: 'flex', alignItems: 'center', gap: '16px',
              }}>
                {/* Tür ikonu */}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
                  background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                }}>
                  {leave.type === 'annual' ? '🌴' : leave.type === 'sick' ? '🏥' : leave.type === 'personal' ? '👤' : '📋'}
                </div>

                {/* Bilgiler */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    {isManager && leave.user && (
                      <span style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: '600' }}>
                        {leave.user.first_name} {leave.user.last_name}
                      </span>
                    )}
                    <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>
                      {typeLabel[leave.type]}
                    </span>
                    <span style={{ background: sc.bg, color: sc.color, padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                      {sc.label}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                    {new Date(leave.start_date).toLocaleDateString('tr-TR')} — {new Date(leave.end_date).toLocaleDateString('tr-TR')}
                    <span style={{ color: '#475569', marginLeft: '8px' }}>({days} gün)</span>
                  </p>
                  {leave.reason && <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '12px' }}>{leave.reason}</p>}
                </div>

                {/* Aksiyonlar */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {isManager && leave.status === 'pending' && (
                    <>
                      <button onClick={() => handleAction(leave.id, 'approve')} style={{
                        background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)',
                        padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}>
                        Onayla
                      </button>
                      <button onClick={() => handleAction(leave.id, 'reject')} style={{
                        background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)',
                        padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                        Reddet
                      </button>
                    </>
                  )}
                  {isOwn && leave.status === 'pending' && (
                    <button onClick={() => handleCancel(leave.id)} style={{
                      background: 'rgba(100,116,139,0.1)', color: '#94a3b8', border: '1px solid #334155',
                      padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                    }}>
                      İptal
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
};
