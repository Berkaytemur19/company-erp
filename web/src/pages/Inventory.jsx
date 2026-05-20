import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout/Layout';
import { useInventoryStore } from '../store/inventoryStore';
import api from '../services/api';

const inputStyle = {
  width: '100%', padding: '11px 14px', background: '#0f172a', border: '1px solid #334155',
  borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
};

const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
  }} onClick={onClose}>
    <div style={{
      background: '#1e293b', border: '1px solid #334155', borderRadius: '16px',
      padding: '28px', width: '100%', maxWidth: '520px',
    }} onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '600', margin: 0 }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const stockStatus = (item) => {
  if (item.reorder_level && item.quantity <= item.reorder_level) return { bg: 'rgba(239,68,68,0.15)', color: '#f87171', label: 'Düşük' };
  if (item.quantity < 10) return { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', label: 'Az' };
  return { bg: 'rgba(16,185,129,0.15)', color: '#34d399', label: 'Yeterli' };
};

const emptyForm = { name: '', sku: '', category: '', quantity: '', unit_price: '', reorder_level: '', warehouse_location: '' };

export const Inventory = () => {
  const { items, fetchItems, updateItem, deleteItem, isLoading } = useInventoryStore();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState('');
  const [editError, setEditError] = useState('');

  useEffect(() => { fetchItems(); }, []);

  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];

  const filtered = items.filter(item => {
    const matchSearch = search === '' || item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
    const ss = stockStatus(item);
    const matchStock = stockFilter === 'all' ||
      (stockFilter === 'low' && ss.label === 'Düşük') ||
      (stockFilter === 'warning' && ss.label === 'Az') ||
      (stockFilter === 'ok' && ss.label === 'Yeterli');
    return matchSearch && matchCat && matchStock;
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/inventory', form);
      setForm(emptyForm);
      setShowForm(false);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.error || 'Hata oluştu');
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setEditForm({
      name: item.name || '', sku: item.sku || '', category: item.category || '',
      quantity: item.quantity ?? '', unit_price: item.unit_price ?? '',
      reorder_level: item.reorder_level ?? '', warehouse_location: item.warehouse_location || '',
    });
    setEditError('');
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    try {
      await updateItem(editItem.id, editForm);
      setEditItem(null);
    } catch (err) {
      setEditError(err.response?.data?.error || 'Güncelleme başarısız');
    }
  };

  return (
    <Layout>
      {editItem && (
        <Modal title="Ürünü Düzenle" onClose={() => setEditItem(null)}>
          {editError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>
              {editError}
            </div>
          )}
          <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Ürün Adı *', key: 'name', required: true },
                { label: 'SKU', key: 'sku' },
                { label: 'Kategori', key: 'category' },
                { label: 'Miktar', key: 'quantity', type: 'number' },
                { label: 'Birim Fiyat (₺)', key: 'unit_price', type: 'number', step: '0.01' },
                { label: 'Sipariş Seviyesi', key: 'reorder_level', type: 'number' },
                { label: 'Depo Konumu', key: 'warehouse_location' },
              ].map(({ label, key, type = 'text', required, step }) => (
                <div key={key}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '500', marginBottom: '5px' }}>{label}</label>
                  <input type={type} step={step} required={required} value={editForm[key]}
                    onChange={e => setEditForm({ ...editForm, [key]: e.target.value })} style={inputStyle} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button type="submit" style={{
                flex: 1, padding: '11px', background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              }}>Kaydet</button>
              <button type="button" onClick={() => setEditItem(null)} style={{
                padding: '11px 20px', background: '#334155', color: '#94a3b8',
                border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer',
              }}>İptal</button>
            </div>
          </form>
        </Modal>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: '26px', fontWeight: '700', margin: '0 0 4px', letterSpacing: '-0.3px' }}>Envanter</h1>
          <p style={{ color: '#475569', margin: 0, fontSize: '14px' }}>{items.length} ürün kayıtlı</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '10px 20px', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
          background: showForm ? '#334155' : 'linear-gradient(135deg, #10b981, #3b82f6)',
          color: showForm ? '#94a3b8' : 'white',
        }}>
          {showForm ? '✕ İptal' : '+ Ürün Ekle'}
        </button>
      </div>

      {/* Arama & filtre */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input placeholder="Ürün adı veya SKU ara..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: '200px', maxWidth: '300px' }} />
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          style={{ ...inputStyle, width: 'auto', minWidth: '150px', flex: 'none' }}>
          <option value="all">Tüm Kategoriler</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={stockFilter} onChange={e => setStockFilter(e.target.value)}
          style={{ ...inputStyle, width: 'auto', minWidth: '150px', flex: 'none' }}>
          <option value="all">Tüm Stok Durumu</option>
          <option value="low">Düşük</option>
          <option value="warning">Az</option>
          <option value="ok">Yeterli</option>
        </select>
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
                <input key={key} type={type} placeholder={placeholder} required={required} step={step}
                  value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
              ))}
            </div>
            <button type="submit" style={{
              padding: '11px 28px', background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            }}>Ekle</button>
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
                  {['Ürün Adı', 'SKU', 'Kategori', 'Miktar', 'Durum', 'Birim Fiyat', 'Konum', ''].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const ss = stockStatus(item);
                  return (
                    <tr key={item.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #0f172a' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '13px 16px', color: '#f1f5f9', fontSize: '14px', fontWeight: '500' }}>{item.name}</td>
                      <td style={{ padding: '13px 16px', color: '#64748b', fontSize: '13px' }}>{item.sku || <span style={{ color: '#334155' }}>—</span>}</td>
                      <td style={{ padding: '13px 16px', color: '#94a3b8', fontSize: '13px' }}>{item.category || <span style={{ color: '#334155' }}>—</span>}</td>
                      <td style={{ padding: '13px 16px', color: '#f1f5f9', fontWeight: '600' }}>{item.quantity}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ background: ss.bg, color: ss.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>{ss.label}</span>
                      </td>
                      <td style={{ padding: '13px 16px', color: '#94a3b8', fontSize: '13px' }}>{item.unit_price ? `₺${Number(item.unit_price).toFixed(2)}` : <span style={{ color: '#334155' }}>—</span>}</td>
                      <td style={{ padding: '13px 16px', color: '#64748b', fontSize: '13px' }}>{item.warehouse_location || <span style={{ color: '#334155' }}>—</span>}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => openEdit(item)}
                            style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', padding: '5px 10px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}>
                            Düzenle
                          </button>
                          <button onClick={() => deleteItem(item.id)}
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '5px 10px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p style={{ textAlign: 'center', color: '#475569', padding: '60px', margin: 0, fontSize: '14px' }}>
                {search || categoryFilter !== 'all' || stockFilter !== 'all' ? 'Filtre kriterine uygun ürün bulunamadı.' : 'Henüz ürün yok.'}
              </p>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};
