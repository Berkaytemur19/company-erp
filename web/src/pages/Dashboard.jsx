import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { useEmployeeStore } from '../store/employeeStore';
import { useInventoryStore } from '../store/inventoryStore';

const StatCard = ({ label, value, color, sub, onClick }) => (
  <div onClick={onClick} style={{
    background: '#1e293b', border: '1px solid #334155', borderRadius: '14px',
    padding: '24px', cursor: onClick ? 'pointer' : 'default',
    transition: 'border-color 0.2s, transform 0.2s',
    position: 'relative', overflow: 'hidden',
  }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: color, opacity: 0.06, borderRadius: '0 14px 0 80px' }} />
    <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {label}
    </p>
    <p style={{ margin: '0 0 4px', color: color, fontSize: '40px', fontWeight: '700', lineHeight: 1 }}>
      {value}
    </p>
    {sub && <p style={{ margin: 0, color: '#475569', fontSize: '12px' }}>{sub}</p>}
  </div>
);

export const Dashboard = () => {
  const { user } = useAuth();
  const { employees, fetchEmployees } = useEmployeeStore();
  const { items, fetchItems } = useInventoryStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
    fetchItems();
  }, []);

  const lowStock = items.filter(i => i.reorder_level && i.quantity <= i.reorder_level);
  const admins = employees.filter(e => e.role === 'admin').length;
  const managers = employees.filter(e => e.role === 'manager').length;

  return (
    <Layout>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#f1f5f9', fontSize: '26px', fontWeight: '700', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
          Dashboard
        </h1>
        <p style={{ color: '#475569', margin: 0, fontSize: '14px' }}>
          Hoş geldin, <span style={{ color: '#3b82f6' }}>{user?.first_name}</span>. İşte genel durum.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Toplam Çalışan" value={employees.length} color="#3b82f6"
          sub={`${admins} admin · ${managers} yönetici`} onClick={() => navigate('/employees')} />
        <StatCard label="Toplam Ürün" value={items.length} color="#10b981"
          sub="envanterdeki toplam" onClick={() => navigate('/inventory')} />
        <StatCard label="Düşük Stok" value={lowStock.length} color="#f59e0b"
          sub="yeniden sipariş gerekli" onClick={() => navigate('/inventory')} />
        <StatCard label="Rolün" value={user?.role} color="#6366f1" sub="mevcut yetki seviyesi" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Son çalışanlar */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: '600', margin: 0 }}>Son Eklenen Çalışanlar</h2>
            <button onClick={() => navigate('/employees')} style={{
              background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '13px', cursor: 'pointer', fontWeight: '500',
            }}>Tümü →</button>
          </div>
          {employees.slice(0, 5).map(emp => (
            <div key={emp.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 0', borderBottom: '1px solid #0f172a',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: '600', fontSize: '13px',
              }}>
                {emp.first_name?.[0]}{emp.last_name?.[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, color: '#e2e8f0', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {emp.first_name} {emp.last_name}
                </p>
                <p style={{ margin: 0, color: '#475569', fontSize: '12px' }}>{emp.email}</p>
              </div>
              <span style={{
                background: emp.role === 'admin' ? 'rgba(245,158,11,0.15)' : emp.role === 'manager' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)',
                color: emp.role === 'admin' ? '#f59e0b' : emp.role === 'manager' ? '#10b981' : '#60a5fa',
                padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize',
              }}>{emp.role}</span>
            </div>
          ))}
          {employees.length === 0 && <p style={{ color: '#475569', fontSize: '13px', textAlign: 'center', margin: '20px 0' }}>Henüz çalışan yok</p>}
        </div>

        {/* Düşük stok ürünler */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: '600', margin: 0 }}>Düşük Stok Uyarısı</h2>
            <button onClick={() => navigate('/inventory')} style={{
              background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '13px', cursor: 'pointer', fontWeight: '500',
            }}>Tümü →</button>
          </div>
          {lowStock.slice(0, 5).map(item => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid #0f172a',
            }}>
              <div>
                <p style={{ margin: 0, color: '#e2e8f0', fontSize: '13px', fontWeight: '500' }}>{item.name}</p>
                <p style={{ margin: 0, color: '#475569', fontSize: '12px' }}>{item.category || 'Kategorisiz'}</p>
              </div>
              <span style={{
                background: 'rgba(239,68,68,0.15)', color: '#f87171',
                padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
              }}>Stok: {item.quantity}</span>
            </div>
          ))}
          {lowStock.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: '#10b981', fontSize: '13px', margin: 0 }}>Tüm stoklar yeterli seviyede</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
