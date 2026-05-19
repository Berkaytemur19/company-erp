import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = () => {
  const { user } = useAuth();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', roles: ['admin', 'manager', 'employee'] },
    { label: 'Çalışanlar', path: '/employees', roles: ['admin', 'manager'] },
    { label: 'Envanter', path: '/inventory', roles: ['admin', 'manager', 'employee'] },
    { label: 'Mesajlar', path: '/messages', roles: ['admin', 'manager', 'employee'] },
  ];

  const filtered = menuItems.filter((item) => item.roles.includes(user?.role));

  return (
    <aside style={{ width: '220px', background: '#1e293b', color: 'white', minHeight: '100%', padding: '24px 0' }}>
      <nav>
        {filtered.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'block',
              padding: '12px 24px',
              color: 'white',
              textDecoration: 'none',
              background: isActive ? '#2563eb' : 'transparent',
              borderLeft: isActive ? '4px solid #60a5fa' : '4px solid transparent',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
