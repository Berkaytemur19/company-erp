import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '▦', roles: ['admin', 'manager', 'employee'] },
  { label: 'Çalışanlar', path: '/employees', icon: '◉', roles: ['admin', 'manager'] },
  { label: 'Envanter', path: '/inventory', icon: '▤', roles: ['admin', 'manager', 'employee'] },
  { label: 'Mesajlar', path: '/messages', icon: '◈', roles: ['admin', 'manager', 'employee'] },
];

export const Sidebar = () => {
  const { user } = useAuth();
  const filtered = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside style={{
      width: '220px',
      minWidth: '220px',
      background: '#0f172a',
      borderRight: '1px solid #1e293b',
      padding: '20px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}>
      <p style={{ color: '#475569', fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 12px', margin: '0 0 8px' }}>
        Menü
      </p>
      {filtered.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '8px',
            color: isActive ? '#f1f5f9' : '#64748b',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: isActive ? '600' : '500',
            background: isActive ? '#1e293b' : 'transparent',
            borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
            transition: 'all 0.15s',
          })}
        >
          <span style={{ fontSize: '16px' }}>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}

      <div style={{ marginTop: 'auto', padding: '12px', borderTop: '1px solid #1e293b', marginLeft: '-12px', marginRight: '-12px' }}>
        <p style={{ margin: 0, color: '#334155', fontSize: '11px', textAlign: 'center' }}>
          Company ERP v1.0
        </p>
      </div>
    </aside>
  );
};
