# 🚗 Rent Car App (Gas Rental)

Aplikasi web sederhana untuk penyewaan mobil (Car Rental) dengan antarmuka *Mobile-First*. Aplikasi ini dibangun menggunakan **HTML, CSS, dan JavaScript murni (Vanilla JS)** dan menggunakan **LocalStorage** browser sebagai database, sehingga tidak memerlukan setup backend atau database server yang rumit.

## ✨ Fitur Utama

### 📱 Umum
* **Responsive Design:** Tampilan optimal di Mobile dan Desktop.
* **Splash Screen:** Animasi pembuka yang interaktif saat website dimuat.
* **Authentication:** Sistem Login dan Register untuk Pelanggan.
* **Guest Mode:** Bisa melihat-lihat mobil tanpa login (dipaksa login saat checkout).

### 👤 Pelanggan (User)
* **Pencarian & Filter:** Cari mobil berdasarkan nama dan filter berdasarkan **Brand**.
* **Cek Lokasi & Jarak:** Simulasi penghitungan jarak antar kota (Cakupan Jawa Tengah & DIY).
* **Simulasi Pembayaran:** Menambah metode pembayaran (Kartu Kredit/Debit) dan memilihnya saat checkout.
* **Riwayat Pesanan:** Melihat status pesanan (Pending, Approved, Rejected).
* **Lokasi Pengambilan:** Melihat peta lokasi pengambilan mobil jika pesanan sudah di-**Approve**.

### 🛠 Admin
* **CRUD Mobil:** Menambah, Mengedit, dan Menghapus data mobil.
* **Manajemen Brand:** Menambahkan Logo Brand saat input mobil baru.
* **Approval Pesanan:** Menerima atau Menolak pesanan masuk dari pelanggan.

---

## 🚀 Cara Menjalankan

1.  **Download/Clone** repository ini atau letakkan semua file dalam satu folder.
2.  **Siapkan Aset Gambar:**
    Agar aplikasi tampil sempurna, pastikan Anda memiliki file gambar berikut di dalam folder yang sama dengan `index.html`:
    * `logo.png` (Logo Aplikasi)
    * `map.png` (Gambar Peta Statis)
    * **Gambar Mobil Default:** `pajero.png`, `agya.png`, `civic.png`
    * **Logo Brand:** `logoMitsubishi.png`, `logoToyota.png`, `logoHonda.png`
3.  **Buka Aplikasi:**
    Klik dua kali file `index.html` untuk membukanya di browser (Chrome/Edge/Firefox).

---

## 🔑 Akun Default

Anda bisa mendaftar akun baru, atau menggunakan akun yang sudah tersedia (Hardcoded/Default):

### 👨‍💼 Administrator
* **Username:** `admin`
* **Password:** `admin123`
* *Akses: Panel Admin untuk kelola mobil dan order.*

### 👤 User Demo
* **Username:** `user`
* **Password:** `user123`
* *Akses: Panel Pelanggan.*

---

## 📂 Struktur File

```text
/RentCarApp
│
├── index.html          # Struktur utama halaman web
├── style.css           # Styling dan animasi (CSS)
├── script.js           # Logika aplikasi, CRUD, Auth (JavaScript)
├── README.md           # Dokumentasi proyek
│
├── [Aset Gambar]       # Letakkan gambar di root folder:
│   ├── logo.png
│   ├── map.png
│   ├── pajero.png
│   ├── logoToyota.png
│   └── ... (lainnya)


# 📝 Catatan Teknis
## Database: Aplikasi ini menggunakan localStorage. Jika Anda membersihkan cache browser, data pesanan dan mobil baru yang ditambahkan akan hilang (kembali ke default).
### Peta & Jarak: Fitur peta menggunakan gambar statis (map.png) dan perhitungan jarak menggunakan data simulasi hardcoded untuk kota-kota di Jawa Tengah, bukan GPS realtime.

## Tips Tambahan:
Jika Anda ingin membuat tampilan folder lebih rapi, Anda bisa memindahkan semua gambar ke folder bernama `images/`.

Namun, jika Anda melakukan itu, Anda harus mengubah kodingan di `script.js` dan `index.html` sedikit. (Misal: mengubah `src="pajero.png"` menjadi `src="images/pajero.png"`). **Untuk saat ini, biarkan saja di satu folder agar sesuai dengan kode terakhir yang saya berikan.**