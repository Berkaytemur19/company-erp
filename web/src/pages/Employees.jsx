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

const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
  }} onClick={onClose}>
    <div style={{
      background: '#1e293b', border: '1px solid #334155', borderRadius: '16px',
      padding: '28px', width: '100%', maxWidth: '480px',
    }} onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '600', margin: 0 }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

export const Employees = () => {
  const { employees, fetchEmployees, updateEmployee, deleteEmployee, isLoading } = useEmployeeStore();
  const [showForm, setShowForm] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', phone: '', role: 'employee' });
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState('');
  const [editError, setEditError] = useState('');

  useEffect(() => { fetchEmployees(); }, []);

  const filtered = employees.filter(emp => {
    const matchSearch = search === '' ||
      `${emp.first_name} ${emp.last_name} ${emp.email}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || emp.role === roleFilter;
    return matchSearch && matchRole;
  });

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

  const openEdit = (emp) => {
    setEditEmp(emp);
    setEditForm({ first_name: emp.first_name || '', last_name: emp.last_name || '', phone: emp.phone || '', role: emp.role || 'employee' });
    setEditError('');
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    try {
      await updateEmployee(editEmp.id, editForm);
      setEditEmp(null);
    } catch (err) {
      setEditError(err.response?.data?.error || 'Güncelleme başarısız');
    }
  };

  return (
    <Layout>
      {editEmp && (
        <Modal title="Çalışanı Düzenle" onClose={() => setEditEmp(null)}>
          {editError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>
              {editError}
            </div>
          )}
          <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '500', marginBottom: '5px' }}>Ad</label>
                <input value={editForm.first_name} onChange={e => setEditForm({ ...editForm, first_name: e.target.value })} style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '500', marginBottom: '5px' }}>Soyad</label>
                <input value={editForm.last_name} onChange={e => setEditForm({ ...editForm, last_name: e.target.value })} style={inputStyle} required />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '500', marginBottom: '5px' }}>Telefon</label>
              <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} style={inputStyle} placeholder="Telefon numarası" />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '500', marginBottom: '5px' }}>Rol</label>
              <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} style={inputStyle}>
                <option value="employee">Çalışan</option>
                <option value="manager">Yönetici</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button type="submit" style={{
                flex: 1, padding: '11px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              }}>Kaydet</button>
              <button type="button" onClick={() => setEditEmp(null)} style={{
                padding: '11px 20px', background: '#334155', color: '#94a3b8',
                border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer',
              }}>İptal</button>
            </div>
          </form>
        </Modal>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: '26px', fontWeight: '700', margin: '0 0 4px', letterSpacing: '-0.3px' }}>Çalışanlar</h1>
          <p style={{ color: '#475569', margin: 0, fontSize: '14px' }}>{employees.length} kişi kayıtlı</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '10px 20px', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
          background: showForm ? '#334155' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
          color: showForm ? '#94a3b8' : 'white',
        }}>
          {showForm ? '✕ İptal' : '+ Çalışan Ekle'}
        </button>
      </div>

      {/* Arama & filtre */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input
          placeholder="İsim veya email ara..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1, maxWidth: '340px' }}
        />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: '140px', flex: 'none' }}>
          <option value="all">Tüm Roller</option>
          <option value="admin">Admin</option>
          <option value="manager">Yönetici</option>
          <option value="employee">Çalışan</option>
        </select>
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
                <input key={key} type={type} placeholder={placeholder} required={required}
                  value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
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
            }}>Ekle</button>
          </form>
        </div>
      )}

      {isLoading ? (
        <p style={{ color: '#475569', textAlign: 'center', padding: '40px' }}>Yükleniyor...</p>
      ) : (
        <>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#475569', fontSize: '14px' }}>
              {search || roleFilter !== 'all' ? 'Arama kriterine uygun çalışan bulunamadı.' : 'Henüz çalışan yok.'}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {filtered.map((emp) => {
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
                        <p style={{ margin: '0 0 2px', color: '#64748b', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.email}</p>
                        {emp.phone && <p style={{ margin: 0, color: '#475569', fontSize: '12px' }}>{emp.phone}</p>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginLeft: '8px' }}>
                      <button onClick={() => openEdit(emp)}
                        style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', padding: '5px 10px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}>
                        Düzenle
                      </button>
                      <button onClick={() => deleteEmployee(emp.id)}
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '5px 10px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                        Sil
                      </button>
                    </div>
                  </div>
                  <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #0f172a' }}>
                    <span style={{ background: rc.bg, color: rc.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize' }}>
                      {emp.role}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Layout>
  );
};
