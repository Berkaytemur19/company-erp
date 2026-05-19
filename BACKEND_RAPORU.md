# Company ERP — Backend Teknik Raporu

**Proje:** Company ERP System  
**Backend Teknolojileri:** Node.js · Express.js · PostgreSQL · Sequelize · Socket.io · JWT  
**Tarih:** Mayıs 2026  
**Geliştirici:** Berkay Temur  

---

## 1. Genel Mimari

Backend, klasik **MVC (Model-View-Controller)** mimarisine dayalı bir REST API + WebSocket sunucusudur.

```
İstemci (Web / Mobile)
        │
        ▼
  HTTP REST API  ◄──► JWT Authentication
        │
  Express Router
        │
   Controllers / Route Handlers
        │
   Sequelize ORM
        │
   PostgreSQL Veritabanı

  WebSocket (Socket.io)
        │
  Gerçek Zamanlı Olaylar
```

---

## 2. Teknoloji Stack ve Seçim Gerekçeleri

| Paket | Versiyon | Görev | Neden Seçildi |
|-------|----------|-------|---------------|
| **express** | 4.18.2 | Web framework | En yaygın Node.js framework'ü, minimal ve esnek |
| **sequelize** | 6.35.0 | ORM | PostgreSQL ile çalışır, migration ve model yönetimi kolaylığı |
| **pg** | 8.11.0 | PostgreSQL sürücüsü | Sequelize'ın PostgreSQL için ihtiyaç duyduğu alt katman |
| **jsonwebtoken** | 9.0.0 | JWT token üretimi/doğrulaması | Stateless authentication, ölçeklenebilir |
| **bcryptjs** | 2.4.3 | Şifre hashleme | Güvenli bcrypt algoritması, brute-force'a dirençli |
| **cors** | 2.8.5 | Cross-Origin Resource Sharing | Browser güvenlik politikasını yönetir |
| **socket.io** | 4.6.0 | WebSocket sunucusu | Gerçek zamanlı mesajlaşma ve anlık bildirimler |
| **dotenv** | 16.0.3 | Ortam değişkenleri | Hassas bilgileri (şifre, token) koddan ayırır |
| **nodemon** | 3.0.0 | Geliştirme otomatik yeniden başlatma | Kod değişikliğinde sunucu otomatik restart atar |

---

## 3. Klasör Yapısı ve Dosya Açıklamaları

```
backend/
├── server.js                  ← Giriş noktası, HTTP + Socket.io sunucusu
├── .env                       ← Ortam değişkenleri (git'e eklenmez!)
├── package.json               ← Proje bağımlılıkları ve script'ler
└── src/
    ├── app.js                 ← Express uygulaması, middleware, route bağlantıları
    ├── config/
    │   └── database.js        ← Sequelize + PostgreSQL bağlantı konfigürasyonu
    ├── models/
    │   ├── User.js            ← Kullanıcı/çalışan veri modeli
    │   ├── Department.js      ← Departman veri modeli
    │   ├── Inventory.js       ← Envanter/ürün veri modeli
    │   └── Message.js         ← Mesaj veri modeli
    ├── routes/
    │   ├── auth.js            ← Kimlik doğrulama endpoint'leri
    │   ├── employees.js       ← Çalışan yönetimi endpoint'leri
    │   ├── departments.js     ← Departman yönetimi endpoint'leri
    │   ├── inventory.js       ← Envanter yönetimi endpoint'leri
    │   └── messages.js        ← Mesajlaşma endpoint'leri
    ├── middleware/
    │   └── auth.js            ← JWT doğrulama middleware'leri
    └── websocket/
        └── handlers.js        ← Socket.io olay işleyicileri
```

---

## 4. server.js — Giriş Noktası

**Dosya:** `server.js`

Uygulamanın başladığı yerdir. Şunları yapar:

1. `src/app.js`'den Express uygulamasını alır
2. Node.js'in yerleşik `http` modülüyle HTTP sunucusu oluşturur
3. Bu HTTP sunucusunun üzerine **Socket.io** bağlar
4. Sunucuyu `.env`'deki PORT'ta dinlemeye başlar (varsayılan: 5000)

**Neden `http.createServer(app)` kullanılır?**  
Express'i direkt `app.listen()` ile de başlatabilirsiniz, ancak Socket.io'nun aynı port üzerinden çalışması için altta yatan `http.Server` nesnesine ihtiyaç vardır.

---

## 5. src/app.js — Express Uygulaması

**Dosya:** `src/app.js`

Tüm Express konfigürasyonunun bulunduğu merkezi dosyadır.

### Middleware Sırası (önemli!)

```
İstek gelir
    │
    ▼
CORS Kontrolü      → Hangi domainlerden istek kabul edilecek?
    │
    ▼
JSON Parser        → Request body'yi JSON olarak parse eder
    │
    ▼
URL Encoded Parser → Form verilerini parse eder
    │
    ▼
Sequelize Sync     → Tablolar veritabanında yoksa oluşturur
    │
    ▼
Route'lar          → /api/auth, /api/employees vb.
    │
    ▼
404 Handler        → Bulunamayan route'lar için
    │
    ▼
Error Handler      → Tüm hatalar burada yakalanır
```

### sequelize.sync({ alter: true }) ne işe yarar?

Bu satır, Sequelize modellerini okuyup veritabanındaki tablolarla karşılaştırır:
- **Tablo yoksa** → Oluşturur
- **Sütun eksikse** → Ekler  
- **Sütun varsa ama farklıysa** → Günceller  
- **`force: true` değil**, bu yüzden **mevcut veriyi silmez**

---

## 6. src/config/database.js — Veritabanı Bağlantısı

**Dosya:** `src/config/database.js`

PostgreSQL veritabanına bağlantıyı yöneten Sequelize instance'ını dışa aktarır.

### Bağlantı Parametreleri (.env'den alınır)

| Parametre | Değer | Açıklama |
|-----------|-------|---------|
| `DB_HOST` | localhost | Veritabanı sunucu adresi |
| `DB_PORT` | 5432 | PostgreSQL varsayılan portu |
| `DB_NAME` | company_erp | Veritabanı adı |
| `DB_USER` | postgres | Kullanıcı adı |
| `DB_PASSWORD` | (gizli) | Şifre |

### Connection Pool nedir?

```javascript
pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
```

- **max: 5** → Aynı anda en fazla 5 veritabanı bağlantısı açık tutulur
- **min: 0** → Boşta bağlantı tutmaz, gerekince açar
- **acquire: 30000** → Bağlantı almak için 30 saniye bekler, sonra hata verir
- **idle: 10000** → 10 saniye kullanılmayan bağlantıyı kapatır

---

## 7. Veritabanı Modelleri

### 7.1 User.js — Kullanıcı/Çalışan Modeli

**Tablo adı:** `users`

| Sütun | Tip | Zorunlu | Açıklama |
|-------|-----|---------|---------|
| `id` | UUID | ✓ | Birincil anahtar, otomatik üretilir |
| `email` | STRING | ✓ | Eşsiz, email formatı doğrulanır |
| `password_hash` | STRING | ✓ | bcrypt ile hashlenmiş şifre (düz metin asla saklanmaz) |
| `first_name` | STRING | — | Ad |
| `last_name` | STRING | — | Soyad |
| `phone` | STRING | — | Telefon numarası |
| `avatar_url` | STRING | — | Profil fotoğrafı URL'i |
| `role` | STRING | — | Varsayılan: `'employee'` · Diğerleri: `'manager'`, `'admin'` |
| `is_active` | BOOLEAN | — | Varsayılan: `true` · Pasif çalışanlar için |
| `last_login` | DATE | — | Son giriş zamanı |
| `created_at` | DATE | ✓ | Sequelize otomatik ekler |
| `updated_at` | DATE | ✓ | Sequelize otomatik günceller |

**Neden UUID?**  
Sıralı ID (1, 2, 3...) yerine UUID kullanmak:
- Güvenlik açısından kullanıcı sayısını gizler
- Birden fazla veritabanını birleştirirken çakışma olmaz
- URL'de tahmin edilemez (`/employees/1` yerine `/employees/f2cf68a4-d3f2...`)

---

### 7.2 Department.js — Departman Modeli

**Tablo adı:** `departments`

| Sütun | Tip | Zorunlu | Açıklama |
|-------|-----|---------|---------|
| `id` | UUID | ✓ | Birincil anahtar |
| `name` | STRING | ✓ | Departman adı (ör: "Yazılım", "Satış") |
| `description` | TEXT | — | Açıklama |
| `manager_id` | UUID | — | Departman yöneticisinin user ID'si |
| `created_at` | DATE | ✓ | Oluşturma tarihi |

---

### 7.3 Inventory.js — Envanter/Ürün Modeli

**Tablo adı:** `inventory`

| Sütun | Tip | Zorunlu | Açıklama |
|-------|-----|---------|---------|
| `id` | UUID | ✓ | Birincil anahtar |
| `name` | STRING | ✓ | Ürün adı |
| `description` | TEXT | — | Ürün açıklaması |
| `sku` | STRING | — | Stok kodu (eşsiz) |
| `category` | STRING | — | Kategori (ör: "Elektronik", "Mobilya") |
| `quantity` | INTEGER | — | Mevcut stok adedi, varsayılan: 0 |
| `unit_price` | DECIMAL(10,2) | — | Birim fiyat (ör: 1499.99) |
| `reorder_level` | INTEGER | — | Bu miktarın altına düşünce uyarı |
| `warehouse_location` | STRING | — | Depo konumu (ör: "A-12-3") |
| `image_url` | STRING | — | Ürün fotoğrafı URL'i |
| `added_by` | UUID | — | Ekleyen kullanıcının ID'si |
| `created_at` | DATE | ✓ | Oluşturma tarihi |
| `updated_at` | DATE | ✓ | Güncelleme tarihi |

---

### 7.4 Message.js — Mesaj Modeli

**Tablo adı:** `messages`

| Sütun | Tip | Zorunlu | Açıklama |
|-------|-----|---------|---------|
| `id` | UUID | ✓ | Birincil anahtar |
| `sender_id` | UUID | ✓ | Mesajı gönderenin user ID'si |
| `receiver_id` | UUID | — | Mesajı alanın user ID'si (bire-bir) |
| `conversation_id` | UUID | — | Grup sohbeti ID'si (ileride) |
| `content` | TEXT | ✓ | Mesaj içeriği |
| `is_read` | BOOLEAN | — | Okundu mu? Varsayılan: false |
| `read_at` | DATE | — | Okunduğu zaman |
| `created_at` | DATE | ✓ | Gönderilme tarihi |

---

## 8. Middleware — src/middleware/auth.js

**Dosya:** `src/middleware/auth.js`

Route'lara erişim kontrolü sağlayan 3 middleware fonksiyonu içerir.

### authMiddleware — JWT Doğrulama

Her korumalı endpoint'e gelen isteği kontrol eder:

```
İstek gelir
    │
    ▼
Authorization header var mı?  → Yoksa 401 Unauthorized
    │
    ▼
"Bearer <token>" formatında mı?  → Değilse 401
    │
    ▼
Token geçerli mi? (imza + süre)  → Değilse 403 Forbidden
    │
    ▼
req.user = { id, email, role }  → Sonraki handler'a geçer
```

**JWT Token Yapısı:**
```
eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEyMyIsImVtYWlsIjoiLi4uIn0.HMAC_imzası
     Header                    Payload                        Signature
```

Token 3 parçadan oluşur:
- **Header:** Algoritma bilgisi (HS256)
- **Payload:** Kullanıcı bilgileri (id, email, role) — şifrelenmez, encode edilir
- **Signature:** Secret key ile imzalanır, değiştirilirse geçersiz olur

### adminOnly — Sadece Admin

`authMiddleware` sonrasında kullanılır. `req.user.role !== 'admin'` ise 403 döner.

### managerOrAdmin — Yönetici veya Admin

`['admin', 'manager']` içinde olmayan roller için 403 döner.

---

## 9. API Route'ları

### 9.1 Authentication — /api/auth

#### POST /api/auth/register

Yeni kullanıcı kaydı oluşturur.

**İstek Body:**
```json
{
  "email": "kullanici@sirket.com",
  "password": "guvenli123",
  "first_name": "Ahmet",
  "last_name": "Yılmaz",
  "role": "employee"
}
```

**İşlem Adımları:**
1. Email ve şifre var mı kontrol et
2. Bu email daha önce kayıtlı mı? → Varsa 400 hata
3. Şifreyi bcrypt ile hashle (10 rounds)
4. Kullanıcıyı veritabanına kaydet
5. ID, email, ad ile 201 yanıt döndür (şifre hash'i gönderilmez!)

**Başarılı Yanıt (201):**
```json
{
  "id": "f2cf68a4-d3f2-4746-be2f-2a4ef8659102",
  "email": "kullanici@sirket.com",
  "first_name": "Ahmet",
  "message": "Kayıt başarılı"
}
```

---

#### POST /api/auth/login

Kullanıcı girişi ve JWT token üretimi.

**İstek Body:**
```json
{
  "email": "kullanici@sirket.com",
  "password": "guvenli123"
}
```

**İşlem Adımları:**
1. Email ve şifre var mı?
2. Bu email ile kullanıcı var mı? → Yoksa 401
3. Girilen şifre, veritabanındaki hash ile eşleşiyor mu? → Eşleşmiyorsa 401
4. `last_login` alanını güncelle
5. JWT access token üret (24 saat geçerli)
6. Token ve kullanıcı bilgilerini döndür

**Başarılı Yanıt (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "f2cf68a4-...",
    "email": "kullanici@sirket.com",
    "role": "employee",
    "first_name": "Ahmet",
    "last_name": "Yılmaz"
  }
}
```

---

#### GET /api/auth/me

Giriş yapmış kullanıcının bilgilerini döndürür. `authMiddleware` gerekir.

**Header:** `Authorization: Bearer <token>`

**Yanıt:** Kullanıcı bilgileri (password_hash hariç tüm alanlar)

---

### 9.2 Employees — /api/employees

Tüm endpoint'ler `authMiddleware` gerektirir.

| Method | Endpoint | Yetki | Açıklama |
|--------|----------|-------|---------|
| GET | `/api/employees` | Herkese açık (auth) | Tüm çalışanları listele |
| GET | `/api/employees/:id` | Herkese açık (auth) | Tek çalışan getir |
| POST | `/api/employees` | Admin only | Yeni çalışan ekle |
| PUT | `/api/employees/:id` | Herkese açık (auth) | Çalışan bilgisi güncelle |
| DELETE | `/api/employees/:id` | Admin only | Çalışanı sil |

**GET /api/employees yanıtı:**
```json
[
  {
    "id": "12283324-1443-...",
    "email": "ahmet@sirket.com",
    "first_name": "Ahmet",
    "last_name": "Yılmaz",
    "phone": "0532 000 00 00",
    "role": "employee",
    "is_active": true,
    "last_login": "2026-05-19T16:59:13.643Z"
  }
]
```

`password_hash` hiçbir zaman döndürülmez (Sequelize `exclude` ile filtrelenir).

---

### 9.3 Departments — /api/departments

| Method | Endpoint | Yetki | Açıklama |
|--------|----------|-------|---------|
| GET | `/api/departments` | Auth | Tüm departmanları listele |
| POST | `/api/departments` | Admin only | Yeni departman oluştur |
| PUT | `/api/departments/:id` | Admin only | Departman güncelle |
| DELETE | `/api/departments/:id` | Admin only | Departman sil |

---

### 9.4 Inventory — /api/inventory

| Method | Endpoint | Yetki | Açıklama |
|--------|----------|-------|---------|
| GET | `/api/inventory` | Auth | Tüm ürünleri listele (tarih sıralı) |
| GET | `/api/inventory/low-stock` | Auth | Stok seviyesi düşük ürünler |
| GET | `/api/inventory/:id` | Auth | Tek ürün getir |
| POST | `/api/inventory` | Auth | Yeni ürün ekle |
| PUT | `/api/inventory/:id` | Auth | Ürün güncelle |
| DELETE | `/api/inventory/:id` | Auth | Ürün sil |

**POST /api/inventory istek body:**
```json
{
  "name": "MacBook Pro 14",
  "sku": "LAPTOP-MBP14",
  "category": "Elektronik",
  "quantity": 5,
  "unit_price": 89999.99,
  "reorder_level": 2,
  "warehouse_location": "A-03-2"
}
```

`added_by` alanı otomatik olarak giriş yapan kullanıcının ID'sinden alınır.

---

### 9.5 Messages — /api/messages

| Method | Endpoint | Yetki | Açıklama |
|--------|----------|-------|---------|
| GET | `/api/messages` | Auth | Gelen mesajları listele (son 50) |
| POST | `/api/messages` | Auth | Yeni mesaj gönder |
| PUT | `/api/messages/:id/read` | Auth | Mesajı okundu işaretle |

**POST /api/messages istek body:**
```json
{
  "receiver_id": "12283324-1443-...",
  "content": "Merhaba, toplantı saat kaçta?"
}
```

---

## 10. WebSocket — src/websocket/handlers.js

**Dosya:** `src/websocket/handlers.js`

Socket.io ile gerçek zamanlı iletişimi yönetir. Tüm bağlı istemciler arasında anlık olay yayını yapar.

### Bağlantı Yönetimi

```javascript
const onlineUsers = new Map()
// { userId → socketId } eşleşmesini tutar
```

`Map` kullanılır çünkü bir kullanıcının çevrimiçi olduğunda socket ID'sini hızla bulmak gerekir.

### Olaylar (Events)

| Olay (Dinlenen) | Tetikleyen | Olay (Yayımlanan) | Alıcı | Açıklama |
|-----------------|------------|-------------------|-------|---------|
| `user:online` | İstemci bağlandığında | `user:online` | Diğer herkese | Çevrimiçi olma bildirimi |
| `message:new` | Mesaj gönderildiğinde | `message:receive` | Diğer herkese | Yeni mesaj iletimi |
| `message:read` | Mesaj okunduğunda | `message:read` | Diğer herkese | Okundu bilgisi |
| `inventory:updated` | Stok güncellendiğinde | `inventory:updated` | Diğer herkese | Anlık stok bildirimi |
| `disconnect` | Bağlantı koptuğunda | `user:offline` | Diğer herkese | Çevrimdışı olma bildirimi |

### Veri Akışı Örneği — Mesajlaşma

```
Kullanıcı A mesaj yazar
        │
        ▼
POST /api/messages → Veritabanına kaydedilir
        │
        ▼
Frontend socket.emit('message:new', {...})
        │
        ▼
Socket.io sunucusu alır
        │
        ▼
socket.broadcast.emit('message:receive', {...})
        │
        ▼
Diğer tüm bağlı kullanıcılar anlık alır
```

---

## 11. Güvenlik Katmanları

### 1. Şifre Güvenliği (bcrypt)

```
Kullanıcı "guvenli123" girer
        │
        ▼
bcrypt.hash("guvenli123", 10)
        │
        ▼
"$2a$10$XpX3YZmKqL..." ← Veritabanına bu kaydedilir
```

- **10 rounds:** Her hash için 2^10 = 1024 iterasyon çalışır
- Aynı şifre her seferinde farklı hash üretir (salt)
- Veritabanı çalınsa bile şifreler çözülemez

### 2. JWT Token Güvenliği

- Secret key `.env` dosyasında, kodda asla yazılmaz
- Token 24 saat sonra geçersiz olur
- Her istek için middleware token'ı doğrular
- Token payload'ı şifrelenmez ama imzalanır — değiştirilemez

### 3. CORS Koruması

Sadece `.env`'de tanımlı domainler API'ye erişebilir:
```
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

Başka bir domain'den istek gelirse tarayıcı bloke eder.

### 4. Yetki Seviyeleri

```
employee  → Sadece okuma, kendi bilgilerini güncelleme
manager   → employee + departman yönetimi
admin     → Tam yetki, kullanıcı silme/ekleme
```

---

## 12. Ortam Değişkenleri (.env)

```env
PORT=5000                          # Sunucu portu
NODE_ENV=development               # Ortam (development/production)

DB_HOST=localhost                  # Veritabanı adresi
DB_PORT=5432                       # PostgreSQL portu
DB_NAME=company_erp                # Veritabanı adı
DB_USER=postgres                   # DB kullanıcısı
DB_PASSWORD=***                    # DB şifresi (gizli!)

JWT_SECRET=***                     # Token imzalama anahtarı (gizli!)
JWT_EXPIRY=24h                     # Access token geçerlilik süresi
REFRESH_TOKEN_SECRET=***           # Refresh token anahtarı (gizli!)
REFRESH_TOKEN_EXPIRY=7d            # Refresh token süresi

CORS_ORIGIN=http://localhost:3000  # İzin verilen origin'ler
```

**Önemli:** `.env` dosyası `.gitignore`'a eklenmiştir. GitHub'a asla yüklenmez.

---

## 13. API Endpoint Özet Tablosu

| Method | URL | Auth | Yetki | Açıklama |
|--------|-----|------|-------|---------|
| GET | /api/health | Hayır | — | Sunucu durumu |
| POST | /api/auth/register | Hayır | — | Kayıt ol |
| POST | /api/auth/login | Hayır | — | Giriş yap |
| GET | /api/auth/me | Evet | — | Profil bilgisi |
| GET | /api/employees | Evet | — | Çalışan listesi |
| GET | /api/employees/:id | Evet | — | Çalışan detayı |
| POST | /api/employees | Evet | Admin | Çalışan ekle |
| PUT | /api/employees/:id | Evet | — | Çalışan güncelle |
| DELETE | /api/employees/:id | Evet | Admin | Çalışan sil |
| GET | /api/departments | Evet | — | Departman listesi |
| POST | /api/departments | Evet | Admin | Departman ekle |
| PUT | /api/departments/:id | Evet | Admin | Departman güncelle |
| DELETE | /api/departments/:id | Evet | Admin | Departman sil |
| GET | /api/inventory | Evet | — | Ürün listesi |
| GET | /api/inventory/low-stock | Evet | — | Düşük stok ürünler |
| GET | /api/inventory/:id | Evet | — | Ürün detayı |
| POST | /api/inventory | Evet | — | Ürün ekle |
| PUT | /api/inventory/:id | Evet | — | Ürün güncelle |
| DELETE | /api/inventory/:id | Evet | — | Ürün sil |
| GET | /api/messages | Evet | — | Gelen mesajlar |
| POST | /api/messages | Evet | — | Mesaj gönder |
| PUT | /api/messages/:id/read | Evet | — | Okundu işaretle |

---

## 14. Çalıştırma

```bash
# Geliştirme (otomatik restart)
cd backend
npm run dev

# Prodüksiyon
npm start
```

Başarılı başlatma çıktısı:
```
Server çalışıyor: http://localhost:5000
Ortam: development
Veritabanı bağlandı
Tablolar hazır
```

---

*Bu rapor Company ERP projesinin backend katmanını kapsamlı şekilde belgelemektedir.*  
*Geliştirici: Berkay Temur — Mayıs 2026*
