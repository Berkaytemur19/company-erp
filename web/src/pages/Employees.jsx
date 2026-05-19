import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout/Layout';
import { useEmployeeStore } from '../store/employeeStore';
import api from '../services/api';

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

  const inputStyle = { padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, color: '#1e293b' }}>Çalışanlar</h1>
        <button onClick={() => setShowForm(!showForm)}
          style={{ padding: '10px 20px', background: showForm ? '#64748b' : '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          {showForm ? 'İptal' : '+ Çalışan Ekle'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 16px' }}>Yeni Çalışan</h3>
          {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <input placeholder="Ad" required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} style={inputStyle} />
              <input placeholder="Soyad" required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} style={inputStyle} />
              <input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
              <input type="password" placeholder="Şifre" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} />
              <input placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={inputStyle}>
                <option value="employee">Çalışan</option>
                <option value="manager">Yönetici</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" style={{ padding: '10px 24px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              Ekle
            </button>
          </form>
        </div>
      )}

      {isLoading ? <p>Yükleniyor...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {employees.map((emp) => (
            <div key={emp.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', color: '#1e293b' }}>{emp.first_name} {emp.last_name}</h3>
                  <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '14px' }}>{emp.email}</p>
                  {emp.phone && <p style={{ margin: '0 0 8px', color: '#64748b', fontSize: '14px' }}>{emp.phone}</p>}
                  <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', textTransform: 'capitalize' }}>{emp.role}</span>
                </div>
                <button onClick={() => deleteEmployee(emp.id)}
                  style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};
