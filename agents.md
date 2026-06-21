# Prompt Development — VPS Reseller MVP

Kamu adalah senior full-stack engineer. Tugas kamu adalah membangun MVP website VPS reseller menggunakan:

* Frontend: **Next.js**
* Backend: **NestJS**
* Database: **MySQL**
* Tanpa Docker
* Tanpa microservice
* Tanpa Redis / queue / Kafka / RabbitMQ
* Tanpa payment gateway dulu
* Jangan over-engineering
* Fokus hanya fitur inti agar project bisa jalan dan mudah dikembangkan nanti

## Konteks Project

Website ini dipakai untuk menjual VPS bulanan. Setiap produk VPS bisa terhubung ke provider berbeda dan akun API berbeda.

Contoh:

* Product A memakai Tencent account 1
* Product B memakai Tencent account 2
* Product C memakai Alibaba account 1
* Product D memakai Cloudeka account 1

Untuk sekarang, jangan langsung bikin integrasi API provider lengkap. Yang penting struktur backend sudah siap untuk multi-provider dan multi-account.

## Aturan Frontend Template

Di frontend sudah ada 2 folder template:

* `starter`
* `demo`

Gunakan **folder `starter` sebagai base utama project**.

Folder `demo` hanya digunakan sebagai referensi komponen dan layout.

Aturan penting:

1. Jangan bikin komponen UI sendiri kalau komponen yang dibutuhkan sudah ada di folder `demo`.
2. Ambil atau tiru struktur komponen dari `demo` agar style tetap konsisten.
3. Semua halaman baru harus mengikuti style, spacing, button, card, table, input, dan layout dari komponen yang sudah ada.
4. Jangan membuat design system baru.
5. Jangan menambahkan library UI baru kecuali memang sudah dipakai di template.
6. Jangan mengubah besar-besaran struktur starter kecuali diperlukan.
7. Prioritaskan konsistensi tampilan dengan template yang sudah ada.

## Scope MVP

Buat fitur secukupnya saja:

### User

User bisa:

1. Register
2. Login
3. Melihat daftar produk VPS
4. Membuat order VPS
5. Melihat daftar VPS miliknya
6. Melihat detail VPS:

   * nama VPS
   * provider
   * region
   * operating system
   * CPU
   * RAM
   * storage
   * bandwidth / transfer
   * IP address
   * username
   * password
   * status
   * tanggal expired

### Admin

Admin bisa:

1. Login sebagai admin
2. Melihat semua order
3. Approve order manual
4. Membuat / edit / hapus produk VPS
5. Membuat / edit / hapus provider account
6. Melihat semua VPS instance
7. Input manual data VPS setelah order dibuat:

   * IP address
   * username
   * password
   * expired date
8. Mengubah status VPS:

   * active
   * suspended
   * expired
   * terminated

## Jangan Buat Fitur Ini Dulu

Jangan membuat fitur berikut di MVP:

* Payment gateway otomatis
* Wallet / saldo user
* Invoice PDF
* Ticket support
* Affiliate / referral
* Coupon / promo code
* Monitoring CPU/RAM realtime
* Firewall manager
* Snapshot manager
* Backup manager
* Auto scaling
* Email notification
* WhatsApp notification
* Multi-role permission yang ribet
* Kubernetes / Docker
* Cron job kompleks
* API provider production penuh

Kalau ada kebutuhan fitur tambahan, cukup siapkan struktur sederhana agar nanti bisa ditambah, tapi jangan implementasi dulu.

## Arsitektur Sederhana

Gunakan 2 project terpisah:

```txt
frontend/   -> Next.js dari folder starter
backend/    -> NestJS API
```

Jangan pakai monorepo manager seperti Nx atau Turborepo kecuali memang project sudah menggunakannya.

## Backend Requirements

Backend menggunakan NestJS REST API.

Gunakan MySQL sebagai database.

Boleh gunakan Prisma atau TypeORM. Pilih salah satu saja dan konsisten. Prioritaskan yang paling cepat dan rapi untuk project ini.

Backend minimal punya module:

```txt
auth
users
products
provider-accounts
orders
vps-instances
```

Jangan membuat module terlalu banyak.

## Database Model Minimal

Buat schema database minimal seperti ini.

### User

```txt
users
- id
- name
- email
- password
- role: USER | ADMIN
- created_at
- updated_at
```

### Provider Account

Digunakan untuk menyimpan akun API provider.

```txt
provider_accounts
- id
- name
- provider: tencent | alibaba | cloudeka | manual
- api_key
- api_secret
- region_default
- is_active
- created_at
- updated_at
```

Catatan:

* API key dan secret jangan pernah dikirim ke frontend.
* Untuk MVP development, field boleh disimpan sederhana dulu.
* Jangan over-engineer encryption dulu kecuali mudah dilakukan tanpa mengganggu scope.

### Product

Produk adalah paket VPS yang dijual di frontend.

```txt
products
- id
- name
- provider_account_id
- provider
- region
- cpu
- ram
- storage
- bandwidth
- transfer
- price_monthly
- cost_monthly
- os_options
- provisioning_type: manual | api | stock
- is_active
- created_at
- updated_at
```

Catatan penting:

* Setiap product harus bisa diarahkan ke provider account tertentu.
* Ini agar produk berbeda bisa memakai API account berbeda.
* Jangan hardcode product di frontend.

### Order

```txt
orders
- id
- user_id
- product_id
- vps_name
- selected_os
- status: pending | approved | provisioning | active | cancelled
- total_price
- billing_cycle: monthly
- created_at
- updated_at
```

Untuk MVP, pembayaran dianggap manual. Admin approve order dari dashboard.

### VPS Instance

```txt
vps_instances
- id
- user_id
- order_id
- product_id
- provider_account_id
- vps_name
- provider
- region
- operating_system
- cpu
- ram
- storage
- bandwidth
- transfer
- ip_address
- username
- password
- status: provisioning | active | suspended | expired | terminated
- expired_at
- created_at
- updated_at
```

## Backend API Minimal

### Auth

```txt
POST /auth/register
POST /auth/login
GET /auth/me
```

### Products

Public/user:

```txt
GET /products
GET /products/:id
```

Admin:

```txt
POST /admin/products
PATCH /admin/products/:id
DELETE /admin/products/:id
```

### Provider Accounts

Admin only:

```txt
GET /admin/provider-accounts
POST /admin/provider-accounts
PATCH /admin/provider-accounts/:id
DELETE /admin/provider-accounts/:id
```

### Orders

User:

```txt
POST /orders
GET /orders/my
GET /orders/:id
```

Admin:

```txt
GET /admin/orders
PATCH /admin/orders/:id/approve
PATCH /admin/orders/:id/cancel
```

### VPS Instances

User:

```txt
GET /vps/my
GET /vps/:id
```

Admin:

```txt
GET /admin/vps
POST /admin/vps/from-order/:orderId
PATCH /admin/vps/:id
PATCH /admin/vps/:id/status
```

## Provider Adapter Structure

Buat struktur adapter sederhana agar nanti mudah tambah API provider.

Contoh:

```txt
src/providers/
  provider-adapter.interface.ts
  manual.adapter.ts
  tencent.adapter.ts
  alibaba.adapter.ts
  cloudeka.adapter.ts
```

Untuk MVP:

* `manual.adapter.ts` wajib jalan
* adapter lain cukup skeleton / placeholder
* jangan implementasi API production penuh dulu

Interface minimal:

```ts
export interface ProviderAdapter {
  createVps(payload: CreateVpsPayload): Promise<CreateVpsResult>;
  rebuildVps?(payload: RebuildVpsPayload): Promise<any>;
  suspendVps?(payload: SuspendVpsPayload): Promise<any>;
  deleteVps?(payload: DeleteVpsPayload): Promise<any>;
}
```

Flow provisioning:

```txt
User create order
Admin approve order
Admin create VPS from order
If product provisioning_type = manual:
  Admin input IP, username, password, expired date
If product provisioning_type = api:
  Call matching provider adapter based on product.provider and product.provider_account_id
```

Untuk sekarang, fokus agar flow manual berjalan lancar. API provider cukup disiapkan strukturnya.

## Frontend Pages Minimal

Gunakan komponen dari `starter` dan referensi `demo`.

### Public/Auth

```txt
/login
/register
```

### User Dashboard

```txt
/dashboard
/dashboard/create-vps
/dashboard/vps
/dashboard/vps/[id]
```

Isi halaman:

#### `/dashboard/create-vps`

Buat UI seperti halaman create VPS:

* Input VPS Name
* Select Provider
* Select Region
* Select Operating System
* Select Server Plan
* Configuration Summary
* Button Create VPS

Produk harus diambil dari API `/products`.

Saat user memilih provider/region/OS/plan, summary di kanan ikut berubah.

Saat klik Create VPS:

* panggil `POST /orders`
* status order menjadi pending
* tampilkan pesan bahwa order menunggu approval admin

#### `/dashboard/vps`

Tampilkan list VPS milik user:

* VPS name
* IP
* provider
* region
* status
* expired date
* action detail

#### `/dashboard/vps/[id]`

Tampilkan detail VPS:

* IP address
* username
* password
* OS
* CPU
* RAM
* storage
* bandwidth
* transfer
* status
* expired date

### Admin Dashboard

Buat admin sederhana saja.

```txt
/admin
/admin/products
/admin/provider-accounts
/admin/orders
/admin/vps
```

Tidak perlu terlalu cantik. Yang penting rapi, konsisten dengan template, dan bisa dipakai.

## Frontend Rules

1. Jangan hardcode products di frontend.
2. Ambil products dari backend.
3. Jangan menaruh API key provider di frontend.
4. Simpan token login dengan cara sederhana yang sudah umum di template.
5. Buat route protection:

   * user route hanya untuk login user/admin
   * admin route hanya untuk role ADMIN
6. Gunakan komponen table, card, input, button, badge, select dari template/demo.
7. Jangan bikin styling sendiri berlebihan.
8. Jangan membuat component baru kalau komponen mirip sudah ada di demo.

## Status Flow

Order status:

```txt
pending -> approved -> provisioning -> active
pending -> cancelled
```

VPS status:

```txt
provisioning -> active
active -> suspended
active -> expired
suspended -> active
expired -> terminated
```

Untuk MVP, perubahan status dilakukan manual oleh admin.

## Seed Data

Buat seed data minimal:

### Admin User

```txt
email: admin@example.com
password: password123
role: ADMIN
```

### Normal User

```txt
email: user@example.com
password: password123
role: USER
```

### Provider Account

```txt
name: Tencent Account 1
provider: tencent
region_default: Jakarta
is_active: true
```

### Products

Buat beberapa product contoh:

```txt
Tencent Basic
2 vCPU
2 GB RAM
40 GB Storage
512 GB Transfer / 20 Mbps
Rp 60.000 / month
provider_account: Tencent Account 1
provisioning_type: manual
```

```txt
Tencent Standard
2 vCPU
2 GB RAM
50 GB Storage
1.02 TB Transfer / 30 Mbps
Rp 75.000 / month
provider_account: Tencent Account 1
provisioning_type: manual
```

```txt
Tencent General
2 vCPU
4 GB RAM
60 GB Storage
1.54 TB Transfer / 30 Mbps
Rp 90.000 / month
provider_account: Tencent Account 1
provisioning_type: manual
```

## Development Priority

Kerjakan berurutan:

1. Setup backend NestJS + MySQL
2. Buat database schema dan seed
3. Buat auth JWT role USER/ADMIN
4. Buat product API
5. Buat order API
6. Buat VPS instance API
7. Setup frontend dari folder `starter`
8. Ambil referensi komponen dari `demo`
9. Buat halaman login/register
10. Buat halaman create VPS
11. Buat user dashboard VPS
12. Buat admin dashboard minimal
13. Test flow end-to-end

## Flow Yang Harus Berhasil

Pastikan flow ini jalan:

```txt
1. User register/login
2. User buka Create VPS
3. User pilih VPS name, provider, region, OS, plan
4. User klik Create VPS
5. Order masuk status pending
6. Admin login
7. Admin lihat order
8. Admin approve order
9. Admin create VPS from order
10. Admin input IP, username, password, expired date
11. User melihat VPS aktif di dashboard
```

## Acceptance Criteria

Project dianggap selesai jika:

1. Backend bisa jalan tanpa Docker.
2. Frontend bisa jalan tanpa Docker.
3. Database MySQL bisa migrate dan seed.
4. User bisa register/login.
5. Admin bisa login.
6. Produk VPS muncul dari database.
7. User bisa membuat order VPS.
8. Admin bisa approve order.
9. Admin bisa input data VPS dari order.
10. User bisa melihat VPS aktif miliknya.
11. Produk bisa mapping ke provider account berbeda.
12. API key provider tidak pernah tampil di frontend.
13. UI frontend memakai style dan komponen dari starter/demo, bukan bikin design baru.
14. Tidak ada fitur di luar scope MVP.

## Catatan Penting

Jangan membuat project terlalu besar.

Jangan menambahkan fitur yang tidak diminta.

Jangan membuat sistem terlalu kompleks.

Fokus ke fondasi:

```txt
Product -> Provider Account -> Order -> VPS Instance
```

Kalau struktur ini sudah benar, fitur seperti auto payment, API provider production, auto suspend, auto rebuild, dan notification bisa ditambahkan nanti.
