import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout/Layout';
import { useInventoryStore } from '../store/inventoryStore';
import api from '../services/api';

export const Inventory = () => {
  const { items, fetchItems, deleteItem, isLoading } = useInventoryStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', category: '', quantity: '', unit_price: '', warehouse_location: '' });
  const [error, setError] = useState('');

  useEffect(() => { fetchItems(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/inventory', form);
      setForm({ name: '', sku: '', category: '', quantity: '', unit_price: '', warehouse_location: '' });
      setShowForm(false);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.error || 'Hata oluştu');
    }
  };

  const inputStyle = { padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, color: '#1e293b' }}>Envanter</h1>
        <button onClick={() => setShowForm(!showForm)}
          style={{ padding: '10px 20px', background: showForm ? '#64748b' : '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          {showForm ? 'İptal' : '+ Ürün Ekle'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 16px' }}>Yeni Ürün</h3>
          {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <input placeholder="Ürün Adı" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              <input placeholder="SKU Kodu" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} style={inputStyle} />
              <input placeholder="Kategori" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle} />
              <input type="number" placeholder="Miktar" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} style={inputStyle} />
              <input type="number" step="0.01" placeholder="Birim Fiyat (₺)" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} style={inputStyle} />
              <input placeholder="Depo Konumu" value={form.warehouse_location} onChange={(e) => setForm({ ...form, warehouse_location: e.target.value })} style={inputStyle} />
            </div>
            <button type="submit" style={{ padding: '10px 24px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              Ekle
            </button>
          </form>
        </div>
      )}

      {isLoading ? <p>Yükleniyor...</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Ürün Adı', 'SKU', 'Kategori', 'Miktar', 'Birim Fiyat', 'Konum', 'İşlem'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} style={{ borderBottom: i < items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '500' }}>{item.name}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{item.sku || '-'}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{item.category || '-'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: item.quantity < 5 ? '#fee2e2' : '#dcfce7', color: item.quantity < 5 ? '#dc2626' : '#16a34a', padding: '2px 10px', borderRadius: '20px', fontSize: '13px' }}>
                      {item.quantity}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{item.unit_price ? `₺${item.unit_price}` : '-'}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{item.warehouse_location || '-'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => deleteItem(item.id)}
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p style={{ textAlign: 'center', color: '#64748b', marginTop: '24px' }}>Henüz ürün yok.</p>}
        </div>
      )}
    </Layout>
  );
};
