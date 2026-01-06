# Tendee (Integrated Attendance System)

> **Mata Kuliah:** II3160 Teknologi Sistem Terintegrasi - Domain-Driven Design  
> **Institusi:** Institut Teknologi Bandung

## 📖 Deskripsi Sistem
Sistem Monitoring Kehadiran adalah sistem terintegrasi yang dirancang untuk mencatat, mengelola, dan melaporkan kehadiran karyawan secara efisien. Sistem ini dibangun menggunakan pendekatan **Microservices** dengan prinsip *loose coupling*, di mana layanan dibagi menjadi dua konteks utama agar pencatatan absensi tetap dapat berjalan meskipun komponen lain mengalami gangguan.

Sistem ini dirancang agar kompatibel dengan perangkat dengan resource terbatas seperti **Set-Top Box (STB)**, di mana proses *logging* dilakukan seringan mungkin.

## 🏗️ Arsitektur & Bounded Context
Sistem ini memisahkan logika bisnis menjadi dua **Core Domain** utama sesuai prinsip DDD:

### 1. Identity Context (Employee/User Service)
Layanan ini bertindak sebagai *source of truth* untuk data karyawan.
* **Tanggung Jawab:** Mengelola siklus hidup data karyawan (Pendaftaran, Update Profil, Status Keaktifan).
* **Fungsi Utama:** Menyimpan identitas stabil seperti ID, Nama, NIP, dan Jabatan.
* **Sifat:** Data bersifat administratif dan tidak mencampur aturan operasional absensi harian.

### 2. Attendance Logging Context (Check-in/Log Service)
Layanan ini fokus pada pencatatan *event* kehadiran secara deterministik dan cepat.
* **Tanggung Jawab:** Mencatat waktu masuk (*Check-In*) dan keluar (*Check-Out*).
* **Optimasi STB:** Hanya membutuhkan `User_ID` dan `Timestamp` saat transaksi. Tidak perlu query nama karyawan saat proses pencatatan berlangsung agar hemat *storage* dan *latency* rendah.
* **Ketahanan:** Layanan ini dapat tetap berjalan mencatat log meskipun layanan Identity sedang *down*.

### 3. Integration/Reporting (Layanan Tambahan)
Karena data nama ada di *User Service* dan data waktu ada di *Log Service*, pelaporan dilakukan melalui layanan integrasi yang menggabungkan kedua data tersebut saat dibutuhkan (Read-time integration).

---

## 🚀 Fitur Utama

| Subdomain | Kategori | Deskripsi |
| :--- | :--- | :--- |
| **User Identity** | Core Domain | Penyimpanan data unik karyawan. |
| **Attendance Logging** | Core Domain | Pencatatan waktu & aktivitas di STB. |
| **Registration** | Subdomain | Pendaftaran karyawan baru. |
| **Check-In/Out** | Subdomain | Pencatatan waktu masuk/keluar via User ID. |
| **Authentication** | Generic | Layanan login & keamanan sistem. |
| **Notification** | Supporting | Notifikasi status absensi (opsional). |

---

## 🛠️ Tech Stack & Konfigurasi

* **Frontend:** React / Web Interface (Port `3060`)
* **Backend:** Node.js / Express (Port `3040`)
* **Database:** Supabase (PostgreSQL)
* **Deployment Target:** STB (Set-Top Box) via aaPanel & Cloudflare Tunneling.

## ⚙️ Cara Menjalankan (Local Development)

### 1. Persiapan Environment
Pastikan file `.env` sudah terisi dengan kredensial Supabase dan konfigurasi port yang sesuai.

### 2. Menjalankan Backend (Service API)
Backend berjalan di port `3040` dan menangani request dari kedua konteks (Identity & Logging).

```bash
cd backend
npm install
npm run start
# Server berjalan di http://localhost:3040 (atau IP Lokal 192.168.x.x:3040)