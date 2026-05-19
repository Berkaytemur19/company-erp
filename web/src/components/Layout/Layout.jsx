import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0f172a' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <main style={{
          flex: 1,
          padding: '32px',
          background: '#0f172a',
          overflowY: 'auto',
          minHeight: 'calc(100vh - 60px)',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};
