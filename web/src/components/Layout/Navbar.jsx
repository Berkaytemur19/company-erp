import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotificationStore } from '../../store/notificationStore';

const typeIcon = {
  leave_request: '📋',
  leave_approved: '✅',
  leave_rejected: '❌',
  low_stock: '⚠️',
  message: '💬',
};

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, fetchNotifications, markRead, markAllRead } = useNotificationStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) fetchNotifications();
    const interval = setInterval(() => { if (user) fetchNotifications(); }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleColor = { admin: '#f59e0b', manager: '#10b981', employee: '#60a5fa' };

  const handleNotifClick = async (notif) => {
    if (!notif.is_read) await markRead(notif.id);
    if (notif.type === 'leave_request' || notif.type === 'leave_approved' || notif.type === 'leave_rejected') {
      navigate('/leaves');
    } else if (notif.type === 'message') {
      navigate('/messages');
    }
    setShowNotifs(false);
  };

  return (
    <nav style={{
      background: '#0f172a', borderBottom: '1px solid #1e293b',
      padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

          {/* Bildirim çanı */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button onClick={() => setShowNotifs(v => !v)} style={{
              background: 'transparent', border: '1px solid #1e293b', color: '#94a3b8',
              width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', position: 'relative', transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#334155'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e293b'}
            >
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-4px',
                  background: '#ef4444', color: 'white', borderRadius: '50%',
                  width: '18px', height: '18px', fontSize: '10px', fontWeight: '700',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #0f172a',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div style={{
                position: 'absolute', top: '44px', right: 0, width: '320px',
                background: '#1e293b', border: '1px solid #334155', borderRadius: '12px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)', overflow: 'hidden', zIndex: 200,
              }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '14px' }}>Bildirimler</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>
                      Tümünü okundu işaretle
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <p style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '24px' }}>Bildirim yok</p>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} onClick={() => handleNotifClick(notif)} style={{
                        padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #0f172a',
                        background: notif.is_read ? 'transparent' : 'rgba(59,130,246,0.05)',
                        display: 'flex', gap: '10px', alignItems: 'flex-start',
                        transition: 'background 0.15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = notif.is_read ? 'transparent' : 'rgba(59,130,246,0.05)'}
                      >
                        <span style={{ fontSize: '16px', flexShrink: 0 }}>{typeIcon[notif.type] || '🔔'}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: '0 0 2px', color: notif.is_read ? '#94a3b8' : '#f1f5f9', fontSize: '13px', fontWeight: notif.is_read ? '400' : '600' }}>
                            {notif.title}
                          </p>
                          <p style={{ margin: 0, color: '#475569', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {notif.body}
                          </p>
                          <p style={{ margin: '2px 0 0', color: '#334155', fontSize: '11px' }}>
                            {new Date(notif.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', flexShrink: 0, marginTop: '4px' }} />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Kullanıcı bilgisi */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            onClick={() => navigate('/profile')}>
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
            padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            Çıkış
          </button>
        </div>
      )}
    </nav>
  );
};
