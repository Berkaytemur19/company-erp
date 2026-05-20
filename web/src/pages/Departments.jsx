import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout/Layout';
import api from '../services/api';
import { useEmployeeStore } from '../store/employeeStore';

const inputStyle = {
  width: '100%', padding: '11px 14px', background: '#0f172a', border: '1px solid #334155',
  borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
};

const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
  }} onClick={onClose}>
    <div style={{
      background: '#1e293b', border: '1px solid #334155', borderRadius: '16px',
      padding: '28px', width: '100%', maxWidth: '460px',
    }} onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '600', margin: 0 }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

export const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [editError, setEditError] = useState('');
  const { employees, fetchEmployees } = useEmployeeStore();

  useEffect(() => {
    fetchDepts();
    fetchEmployees();
  }, []);

  const fetchDepts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const empCount = (deptId) => employees.filter(e => e.department_id === deptId).length;

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/departments', form);
      setForm({ name: '', description: '' });
      setShowForm(false);
      fetchDepts();
    } catch (err) {
      setError(err.response?.data?.error || 'Hata oluştu');
    }
  };

  const openEdit = (dept) => {
    setEditDept(dept);
    setEditForm({ name: dept.name || '', description: dept.description || '' });
    setEditError('');
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    try {
      await api.put(`/departments/${editDept.id}`, editForm);
      setEditDept(null);
      fetchDepts();
    } catch (err) {
      setEditError(err.response?.data?.error || 'Güncelleme başarısız');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/departments/${id}`);
      setDepartments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6'];

  return (
    <Layout>
      {editDept && (
        <Modal title="Departmanı Düzenle" onClose={() => setEditDept(null)}>
          {editError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>
              {editError}
            </div>
          )}
          <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '500', marginBottom: '5px' }}>Departman Adı *</label>
              <input required value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '500', marginBottom: '5px' }}>Açıklama</label>
              <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Departman açıklaması..." />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button type="submit" style={{
                flex: 1, padding: '11px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              }}>Kaydet</button>
              <button type="button" onClick={() => setEditDept(null)} style={{
                padding: '11px 20px', background: '#334155', color: '#94a3b8',
                border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer',
              }}>İptal</button>
            </div>
          </form>
        </Modal>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: '26px', fontWeight: '700', margin: '0 0 4px', letterSpacing: '-0.3px' }}>Departmanlar</h1>
          <p style={{ color: '#475569', margin: 0, fontSize: '14px' }}>{departments.length} departman kayıtlı</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '10px 20px', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
          background: showForm ? '#334155' : 'linear-gradient(135deg, #6366f1, #3b82f6)',
          color: showForm ? '#94a3b8' : 'white',
        }}>
          {showForm ? '✕ İptal' : '+ Departman Ekle'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '28px', marginBottom: '28px' }}>
          <h3 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '600', margin: '0 0 20px' }}>Yeni Departman Ekle</h3>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '500', marginBottom: '5px' }}>Departman Adı *</label>
                <input required placeholder="örn. Mühendislik" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '500', marginBottom: '5px' }}>Açıklama</label>
                <input placeholder="Kısa açıklama" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={inputStyle} />
              </div>
            </div>
            <div>
              <button type="submit" style={{
                padding: '11px 28px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              }}>Ekle</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <p style={{ color: '#475569', textAlign: 'center', padding: '40px' }}>Yükleniyor...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {departments.map((dept, idx) => {
            const color = colors[idx % colors.length];
            const count = empCount(dept.id);
            return (
              <div key={dept.id} style={{
                background: '#1e293b', border: '1px solid #334155', borderRadius: '14px',
                padding: '24px', position: 'relative', overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = color}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#334155'}
              >
                <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: color, opacity: 0.06, borderRadius: '0 14px 0 80px' }} />
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px', background: `${color}22`,
                  border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color, fontSize: '18px', fontWeight: '700', marginBottom: '14px',
                }}>
                  {dept.name[0]?.toUpperCase()}
                </div>
                <h3 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '600', margin: '0 0 6px' }}>{dept.name}</h3>
                {dept.description && (
                  <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 14px', lineHeight: '1.5' }}>{dept.description}</p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #0f172a' }}>
                  <span style={{ color: '#475569', fontSize: '13px' }}>
                    <span style={{ color, fontWeight: '700' }}>{count}</span> çalışan
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => openEdit(dept)}
                      style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', padding: '5px 10px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}>
                      Düzenle
                    </button>
                    <button onClick={() => handleDelete(dept.id)}
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '5px 10px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {departments.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#475569', fontSize: '14px' }}>
              Henüz departman yok. Yeni bir departman ekle.
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};
