import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout/Layout';
import { useEmployeeStore } from '../store/employeeStore';
import api from '../services/api';

const inputStyle = {
  width: '100%', padding: '11px 14px', background: '#0f172a', border: '1px solid #334155',
  borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
};

const roleColor = (role) => {
  if (role === 'admin') return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' };
  if (role === 'manager') return { bg: 'rgba(16,185,129,0.15)', color: '#10b981' };
  return { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' };
};

export const Employees = () => {
  const { employees, fetchEmployees, deleteEmployee, isLoading } = useEmployeeStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', phone: '', role: 'employee' });
  const [error, setError] = useState('');

  useEffect(() => { fetchEmployees(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/employees', form);
      setForm({ first_name: '', last_name: '', email: '', password: '', phone: '', role: 'employee' });
      setShowForm(false);
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.error || 'Hata oluştu');
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: '26px', fontWeight: '700', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            Çalışanlar
          </h1>
          <p style={{ color: '#475569', margin: 0, fontSize: '14px' }}>{employees.length} kişi kayıtlı</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px', border: 'none', borderRadius: '10px', fontSize: '14px',
            fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.15s',
            background: showForm ? '#334155' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: showForm ? '#94a3b8' : 'white',
          }}
        >
          {showForm ? '✕ İptal' : '+ Çalışan Ekle'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '28px', marginBottom: '28px' }}>
          <h3 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '600', margin: '0 0 20px' }}>Yeni Çalışan Ekle</h3>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              {[
                { placeholder: 'Ad', key: 'first_name', required: true },
                { placeholder: 'Soyad', key: 'last_name', required: true },
                { placeholder: 'Email', key: 'email', type: 'email', required: true },
                { placeholder: 'Şifre', key: 'password', type: 'password', required: true },
                { placeholder: 'Telefon', key: 'phone' },
              ].map(({ placeholder, key, type = 'text', required }) => (
                <input
                  key={key} type={type} placeholder={placeholder} required={required}
                  value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                  style={inputStyle}
                />
              ))}
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={inputStyle}>
                <option value="employee">Çalışan</option>
                <option value="manager">Yönetici</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" style={{
              padding: '11px 28px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            }}>
              Ekle
            </button>
          </form>
        </div>
      )}

      {isLoading ? (
        <p style={{ color: '#475569', textAlign: 'center', padding: '40px' }}>Yükleniyor...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {employees.map((emp) => {
            const rc = roleColor(emp.role);
            return (
              <div key={emp.id} style={{
                background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '20px',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#475569'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#334155'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: '700', fontSize: '15px',
                    }}>
                      {emp.first_name?.[0]}{emp.last_name?.[0]}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: '0 0 2px', color: '#f1f5f9', fontSize: '15px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {emp.first_name} {emp.last_name}
                      </p>
                      <p style={{ margin: '0 0 2px', color: '#64748b', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {emp.email}
                      </p>
                      {emp.phone && <p style={{ margin: 0, color: '#475569', fontSize: '12px' }}>{emp.phone}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEmployee(emp.id)}
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '5px 10px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', flexShrink: 0, marginLeft: '8px' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                  >
                    Sil
                  </button>
                </div>
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #0f172a' }}>
                  <span style={{ background: rc.bg, color: rc.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize' }}>
                    {emp.role}
                  </span>
                </div>
              </div>
            );
          })}
          {employees.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#475569', fontSize: '14px' }}>
              Henüz çalışan yok. Yeni bir çalışan ekle.
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};
