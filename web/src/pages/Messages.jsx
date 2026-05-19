import { useEffect, useState, useRef } from 'react';
import { Layout } from '../components/Layout/Layout';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { io } from 'socket.io-client';

const roleColor = (role) => {
  if (role === 'admin') return '#f59e0b';
  if (role === 'manager') return '#10b981';
  return '#60a5fa';
};

export const Messages = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('/employees').then((res) => setEmployees(res.data.filter((e) => e.id !== user?.id)));

    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('user:online', user?.id);
    socketRef.current.on('message:receive', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socketRef.current?.disconnect();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async (emp) => {
    setSelectedUser(emp);
    try {
      const res = await api.get('/messages');
      const conv = res.data.filter(
        (m) => (m.sender_id === user.id && m.receiver_id === emp.id) ||
               (m.sender_id === emp.id && m.receiver_id === user.id)
      );
      setMessages(conv);
    } catch {
      setMessages([]);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedUser) return;
    try {
      const res = await api.post('/messages', { receiver_id: selectedUser.id, content: text });
      setMessages((prev) => [...prev, res.data]);
      socketRef.current?.emit('message:new', { ...res.data, sender: user });
      setText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#f1f5f9', fontSize: '26px', fontWeight: '700', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
          Mesajlar
        </h1>
        <p style={{ color: '#475569', margin: 0, fontSize: '14px' }}>Gerçek zamanlı iletişim</p>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 220px)', minHeight: '480px', background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', overflow: 'hidden' }}>

        {/* Sol — kişi listesi */}
        <div style={{ width: '260px', minWidth: '260px', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155' }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Çalışanlar
            </p>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {employees.map((emp) => {
              const isSelected = selectedUser?.id === emp.id;
              return (
                <div
                  key={emp.id}
                  onClick={() => loadMessages(emp)}
                  style={{
                    padding: '14px 20px', cursor: 'pointer', borderBottom: '1px solid #0f172a',
                    background: isSelected ? 'rgba(59,130,246,0.1)' : 'transparent',
                    borderLeft: isSelected ? '3px solid #3b82f6' : '3px solid transparent',
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: '10px',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: '700', fontSize: '12px',
                  }}>
                    {emp.first_name?.[0]}{emp.last_name?.[0]}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: '500', color: isSelected ? '#f1f5f9' : '#cbd5e1', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {emp.first_name} {emp.last_name}
                    </p>
                    <p style={{ margin: 0, fontSize: '11px', color: roleColor(emp.role), fontWeight: '600', textTransform: 'capitalize' }}>
                      {emp.role}
                    </p>
                  </div>
                </div>
              );
            })}
            {employees.length === 0 && (
              <p style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '24px' }}>Çalışan bulunamadı</p>
            )}
          </div>
        </div>

        {/* Sağ — mesaj alanı */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedUser ? (
            <>
              {/* Header */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: '700', fontSize: '13px',
                }}>
                  {selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}
                </div>
                <div>
                  <p style={{ margin: 0, color: '#f1f5f9', fontWeight: '600', fontSize: '15px' }}>
                    {selectedUser.first_name} {selectedUser.last_name}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: roleColor(selectedUser.role), fontWeight: '500', textTransform: 'capitalize' }}>
                    {selectedUser.role}
                  </p>
                </div>
              </div>

              {/* Mesajlar */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.length === 0 && (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: '#334155', fontSize: '14px' }}>Henüz mesaj yok. İlk mesajı gönder!</p>
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isOwn = msg.sender_id === user.id;
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '65%', padding: '10px 16px', borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isOwn ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : '#0f172a',
                        color: isOwn ? 'white' : '#e2e8f0',
                        fontSize: '14px', lineHeight: '1.5',
                        border: isOwn ? 'none' : '1px solid #1e293b',
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} style={{ padding: '16px 24px', borderTop: '1px solid #334155', display: 'flex', gap: '10px' }}>
                <input
                  value={text} onChange={(e) => setText(e.target.value)}
                  placeholder="Mesaj yaz..."
                  style={{
                    flex: 1, padding: '11px 16px', background: '#0f172a', border: '1px solid #334155',
                    borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none',
                  }}
                />
                <button type="submit" style={{
                  padding: '11px 20px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap',
                }}>
                  Gönder
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <div style={{ fontSize: '40px', opacity: 0.2 }}>◈</div>
              <p style={{ color: '#334155', fontSize: '15px', margin: 0, fontWeight: '500' }}>
                Mesajlaşmak için bir kişi seç
              </p>
              <p style={{ color: '#1e293b', fontSize: '13px', margin: 0 }}>
                Soldaki listeden bir çalışan seçerek sohbet başlat
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
