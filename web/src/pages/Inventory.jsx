import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout/Layout';
import { useInventoryStore } from '../store/inventoryStore';
import api from '../services/api';

const inputStyle = {
  width: '100%', padding: '11px 14px', background: '#0f172a', border: '1px solid #334155',
  borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
};

export const Inventory = () => {
  const { items, fetchItems, deleteItem, isLoading } = useInventoryStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', category: '', quantity: '', unit_price: '', reorder_level: '', warehouse_location: '' });
  const [error, setError] = useState('');

  useEffect(() => { fetchItems(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/inventory', form);
      setForm({ name: '', sku: '', category: '', quantity: '', unit_price: '', reorder_level: '', warehouse_location: '' });
      setShowForm(false);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.error || 'Hata oluştu');
    }
  };

  const stockStatus = (item) => {
    if (item.reorder_level && item.quantity <= item.reorder_level) return { bg: 'rgba(239,68,68,0.15)', color: '#f87171', label: 'Düşük' };
    if (item.quantity < 10) return { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', label: 'Az' };
    return { bg: 'rgba(16,185,129,0.15)', color: '#34d399', label: 'Yeterli' };
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: '26px', fontWeight: '700', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            Envanter
          </h1>
          <p style={{ color: '#475569', margin: 0, fontSize: '14px' }}>{items.length} ürün kayıtlı</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px', border: 'none', borderRadius: '10px', fontSize: '14px',
            fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.15s',
            background: showForm ? '#334155' : 'linear-gradient(135deg, #10b981, #3b82f6)',
            color: showForm ? '#94a3b8' : 'white',
          }}
        >
          {showForm ? '✕ İptal' : '+ Ürün Ekle'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '28px', marginBottom: '28px' }}>
          <h3 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '600', margin: '0 0 20px' }}>Yeni Ürün Ekle</h3>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[
                { placeholder: 'Ürün Adı *', key: 'name', required: true },
                { placeholder: 'SKU Kodu', key: 'sku' },
                { placeholder: 'Kategori', key: 'category' },
                { placeholder: 'Miktar', key: 'quantity', type: 'number' },
                { placeholder: 'Birim Fiyat (₺)', key: 'unit_price', type: 'number', step: '0.01' },
                { placeholder: 'Yeniden Sipariş Seviyesi', key: 'reorder_level', type: 'number' },
                { placeholder: 'Depo Konumu', key: 'warehouse_location' },
              ].map(({ placeholder, key, type = 'text', required, step }) => (
                <input
                  key={key} type={type} placeholder={placeholder} required={required} step={step}
                  value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                  style={inputStyle}
                />
              ))}
            </div>
            <button type="submit" style={{
              padding: '11px 28px', background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            }}>
              Ekle
            </button>
          </form>
        </div>
      )}

      {isLoading ? (
        <p style={{ color: '#475569', textAlign: 'center', padding: '40px' }}>Yükleniyor...</p>
      ) : (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  {['Ürün Adı', 'SKU', 'Kategori', 'Miktar', 'Durum', 'Birim Fiyat', 'Konum', ''].map((h) => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const ss = stockStatus(item);
                  return (
                    <tr key={item.id} style={{ borderBottom: i < items.length - 1 ? '1px solid #1e293b' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px', color: '#f1f5f9', fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap' }}>{item.name}</td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>{item.sku || <span style={{ color: '#334155' }}>—</span>}</td>
                      <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '13px' }}>{item.category || <span style={{ color: '#334155' }}>—</span>}</td>
                      <td style={{ padding: '14px 16px', color: '#f1f5f9', fontSize: '14px', fontWeight: '600' }}>{item.quantity}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: ss.bg, color: ss.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                          {ss.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '13px' }}>{item.unit_price ? `₺${Number(item.unit_price).toFixed(2)}` : <span style={{ color: '#334155' }}>—</span>}</td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>{item.warehouse_location || <span style={{ color: '#334155' }}>—</span>}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => deleteItem(item.id)}
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '5px 12px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {items.length === 0 && (
              <p style={{ textAlign: 'center', color: '#475569', padding: '60px', margin: 0, fontSize: '14px' }}>
                Henüz ürün yok. Yeni bir ürün ekle.
              </p>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};
