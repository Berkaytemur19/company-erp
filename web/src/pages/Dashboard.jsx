import { useEffect } from 'react';
import { Layout } from '../components/Layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { useEmployeeStore } from '../store/employeeStore';
import { useInventoryStore } from '../store/inventoryStore';

export const Dashboard = () => {
  const { user } = useAuth();
  const { employees, fetchEmployees } = useEmployeeStore();
  const { items, fetchItems } = useInventoryStore();

  useEffect(() => {
    fetchEmployees();
    fetchItems();
  }, []);

  const cardStyle = { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' };

  return (
    <Layout>
      <h1 style={{ marginBottom: '8px', color: '#1e293b' }}>Dashboard</h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>Hoş geldin, {user?.first_name}!</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div style={cardStyle}>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px' }}>Toplam Çalışan</p>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#1d4ed8', margin: 0 }}>{employees.length}</p>
        </div>
        <div style={cardStyle}>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px' }}>Toplam Ürün</p>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>{items.length}</p>
        </div>
        <div style={cardStyle}>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px' }}>Rolün</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed', margin: 0, textTransform: 'capitalize' }}>{user?.role}</p>
        </div>
      </div>
    </Layout>
  );
};
