import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColor = {
    admin: '#f59e0b',
    manager: '#10b981',
    employee: '#60a5fa',
  };

  return (
    <nav style={{
      background: '#0f172a',
      borderBottom: '1px solid #1e293b',
      padding: '0 24px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px', height: '32px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', fontWeight: 'bold', color: 'white',
        }}>E</div>
        <span style={{ color: 'white', fontWeight: '700', fontSize: '17px', letterSpacing: '-0.3px' }}>
          Company <span style={{ color: '#3b82f6' }}>ERP</span>
        </span>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '600', fontSize: '14px',
            }}>
              {user.first_name?.[0]?.toUpperCase()}{user.last_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, color: '#f1f5f9', fontSize: '13px', fontWeight: '600' }}>
                {user.first_name} {user.last_name}
              </p>
              <p style={{ margin: 0, fontSize: '11px', color: roleColor[user.role] || '#60a5fa', fontWeight: '500', textTransform: 'capitalize' }}>
                {user.role}
              </p>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            background: 'transparent', color: '#94a3b8', border: '1px solid #334155',
            padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.target.style.borderColor = '#ef4444'; e.target.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.target.style.borderColor = '#334155'; e.target.style.color = '#94a3b8'; }}
          >
            Çıkış
          </button>
        </div>
      )}
    </nav>
  );
};
