import { useEffect, useState, useRef } from 'react';
import { Layout } from '../components/Layout/Layout';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { io } from 'socket.io-client';

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
      <h1 style={{ marginBottom: '24px', color: '#1e293b' }}>Mesajlar</h1>
      <div style={{ display: 'flex', height: '60vh', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ width: '240px', borderRight: '1px solid #e2e8f0', overflowY: 'auto' }}>
          <p style={{ padding: '16px', margin: 0, fontWeight: '600', color: '#64748b', fontSize: '13px', borderBottom: '1px solid #e2e8f0' }}>ÇALIŞANLAR</p>
          {employees.map((emp) => (
            <div key={emp.id} onClick={() => loadMessages(emp)}
              style={{ padding: '14px 16px', cursor: 'pointer', background: selectedUser?.id === emp.id ? '#eff6ff' : 'transparent', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ margin: 0, fontWeight: '500', color: '#1e293b' }}>{emp.first_name} {emp.last_name}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', textTransform: 'capitalize' }}>{emp.role}</p>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedUser ? (
            <>
              <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>
                {selectedUser.first_name} {selectedUser.last_name}
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.sender_id === user.id ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '60%', padding: '10px 14px', borderRadius: '12px', background: msg.sender_id === user.id ? '#1d4ed8' : '#f1f5f9', color: msg.sender_id === user.id ? 'white' : '#1e293b', fontSize: '14px' }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={sendMessage} style={{ padding: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Mesaj yaz..."
                  style={{ flex: 1, padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }} />
                <button type="submit" style={{ padding: '10px 20px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Gönder
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              Mesajlaşmak için bir çalışan seç
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
