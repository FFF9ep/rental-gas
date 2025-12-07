// === 1. DATA & CONFIG ===

// Daftar Kota Jateng + DIY & Estimasi Jarak dari Semarang (Simulasi)
const centralJavaCities = {
    "semarang": 0, "solo": 100, "surakarta": 100, "jogja": 130, "yogyakarta": 130,
    "magelang": 75, "salatiga": 50, "pati": 75, "kudus": 55, "demak": 30, "kendal": 35,
    "pekalongan": 100, "tegal": 160, "brebes": 175, "pemalang": 135, "batang": 90,
    "purwodadi": 65, "grobogan": 65, "blora": 130, "rembang": 115, "jepara": 80,
    "boyolali": 80, "klaten": 110, "sragen": 125, "karanganyar": 115, "sukoharjo": 115,
    "wonogiri": 145, "temanggung": 85, "wonosobo": 120, "banjarnegara": 150,
    "purbalingga": 180, "purwokerto": 200, "banyumas": 200, "cilacap": 230,
    "kebumen": 170, "purworejo": 135, "ungaran": 25, "ambarawa": 40
};

// Data Mobil Awal (Updated dengan Brand Logo)
const initialCars = [
    { 
        id: 1, 
        name: "Pajero Sport", 
        brand: "Mitsubishi", 
        brandLogo: "logoMitsubishi.png", // File logo harus ada di folder
        price: 600000, 
        img: "pajero.png", 
        specs: ["Auto", "Diesel", "7 Seats"] 
    },
    { 
        id: 2, 
        name: "Toyota Agya", 
        brand: "Toyota", 
        brandLogo: "logoToyota.png", 
        price: 270000, 
        img: "agya.png", 
        specs: ["Auto", "Gas", "5 Seats"] 
    },
    { 
        id: 3, 
        name: "Honda Civic", 
        brand: "Honda", 
        brandLogo: "logoHonda.png", 
        price: 800000, 
        img: "civic.png", 
        specs: ["Auto", "Gas", "5 Seats"] 
    }
];

// Initialize Data
if(!localStorage.getItem('cars')) localStorage.setItem('cars', JSON.stringify(initialCars));
if(!localStorage.getItem('orders')) localStorage.setItem('orders', JSON.stringify([]));

// State Global
let currentUser = null; 
let selectedCarId = null;
let selectedPaymentMethod = null;
let isEditing = false; 
let currentBrandFilter = "All";

// === 2. SPLASH SCREEN & INIT (PERBAIKAN) ===
window.addEventListener('load', () => {
    const splash = document.getElementById('splash-screen');
    
    // Pastikan splash ada sebelum memanipulasinya
    if (splash) {
        setTimeout(() => {
            splash.style.opacity = '0';
            setTimeout(() => { 
                splash.style.display = 'none'; 
                // PENTING: Jalankan init setelah splash hilang
                initAppSession();
            }, 500); 
        }, 2000); // Durasi animasi
    } else {
        // Jika splash tidak ditemukan, langsung init
        initAppSession();
    }
});

function initAppSession() {
    try {
        console.log("Memulai sesi aplikasi..."); // Debugging log

        // 0. Pastikan container utama tampil
        const appView = document.getElementById('app-view');
        const authView = document.getElementById('auth-view');

        if (appView) appView.classList.remove('hidden');   // <-- PENTING
        if (authView) authView.classList.add('hidden');    // pastikan auth tidak muncul dulu

        // 1. Cek User Session
        const storedUser = localStorage.getItem('currentUserSession');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }

        // 2. Mode guest jika belum login
        if (!currentUser) {
            console.log("Mode Guest aktif");
        }

        // 3. Update UI berdasarkan status login
        updateUIState();

        // 4. Paksa ke Home agar tidak kosong
        const homeSection = document.getElementById('section-home');
        if (homeSection) {
            navTo('home');
        } else {
            console.error("Error: Element section-home tidak ditemukan!");
        }

    } catch (error) {
        console.error("Terjadi error saat Init:", error);
        // Fallback darurat
        document.getElementById('app-view').classList.remove('hidden');
        document.getElementById('section-home').classList.remove('hidden');
    }
}


function updateUIState() {
    const authOnly = document.querySelectorAll('.auth-only');
    const guestOnly = document.querySelectorAll('.guest-only');
    const displayUser = document.getElementById('display-name');

    if (currentUser) {
        // Logged In
        authOnly.forEach(el => el.classList.remove('hidden'));
        guestOnly.forEach(el => el.classList.add('hidden'));
        displayUser.innerText = currentUser.name.split(' ')[0];
        
        // Setup Profile
        document.getElementById('profile-name').innerText = currentUser.name;
        document.getElementById('profile-address').innerText = currentUser.address;
        document.getElementById('profile-username').innerText = currentUser.username;
        document.getElementById('profile-gender').innerText = currentUser.gender === 'L' ? 'Laki-laki' : 'Perempuan';
        
        const profilePic = document.getElementById('profile-pic-display');
        profilePic.src = (currentUser.ktpImg && currentUser.ktpImg.length > 50) ? currentUser.ktpImg : "https://via.placeholder.com/100";
        
        if(currentUser.role === 'admin') initAdmin();
    } else {
        // Guest
        authOnly.forEach(el => el.classList.add('hidden'));
        guestOnly.forEach(el => el.classList.remove('hidden'));
        displayUser.innerText = "Guest";
    }
}

// === 3. AUTH LOGIC ===
function openAuth() {
    document.getElementById('app-view').classList.add('hidden');
    document.getElementById('auth-view').classList.remove('hidden');
}

function skipToHome() {
    document.getElementById('auth-view').classList.add('hidden');
    document.getElementById('app-view').classList.remove('hidden');
    navTo('home');
}

function toggleAuth(type) {
    if(type === 'register') {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
    } else {
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    }
}

function handleLogin() {
    const userIn = document.getElementById('login-username').value;
    const passIn = document.getElementById('login-password').value;
    
    if (userIn === 'admin' && passIn === 'admin123') {
        currentUser = { name: 'Administrator', role: 'admin', username: 'admin' };
        finalizeLogin();
        return;
    } 
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const foundUser = users.find(u => u.username === userIn && u.password === passIn);

    if(foundUser) {
        currentUser = foundUser;
        finalizeLogin();
    } else {
        alert('Username atau Password salah!');
    }
}

function finalizeLogin() {
    localStorage.setItem('currentUserSession', JSON.stringify(currentUser));
    updateUIState();
    document.getElementById('auth-view').classList.add('hidden');
    document.getElementById('app-view').classList.remove('hidden');
    if(currentUser.role === 'admin') initAdmin(); else navTo('home');
}

function handleRegister() {
    const name = document.getElementById('reg-name').value;
    const address = document.getElementById('reg-address').value;
    const gender = document.getElementById('reg-gender').value;
    const user = document.getElementById('reg-user').value;
    const pass = document.getElementById('reg-pass').value;
    const ktpInput = document.getElementById('reg-ktp');

    if(!name || !user || !pass) { alert('Lengkapi data'); return; }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    if(users.some(u => u.username === user)) { alert('Username dipakai!'); return; }

    const saveUser = (ktpBase64) => {
        const newUser = { 
            name, address, gender, 
            ktpImg: ktpBase64 || "https://via.placeholder.com/100", 
            username: user, password: pass, role: 'customer', paymentMethods: [] 
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        alert('Registrasi Berhasil!');
        toggleAuth('login');
    };

    if (ktpInput.files && ktpInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) { saveUser(e.target.result); };
        reader.readAsDataURL(ktpInput.files[0]);
    } else { saveUser(null); }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUserSession');
    location.reload(); 
}

// === 4. NAVIGATION & FEATURES ===
function navTo(page) {
    // Hide all sections
    const sections = ['section-home', 'section-detail', 'section-payment', 'section-add-payment', 'section-history', 'section-profile'];
    sections.forEach(s => document.getElementById(s).classList.add('hidden'));
    
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    // Handle Nav Logic
    if(page === 'home') {
        document.getElementById('section-home').classList.remove('hidden');
        renderBrands(); // Render brands
        renderCars();
        document.querySelectorAll('.nav-item')[0].classList.add('active');
    } else if(page === 'history') {
        document.getElementById('section-history').classList.remove('hidden');
        renderHistory();
        document.querySelectorAll('.nav-item')[1].classList.add('active');
    } else if(page === 'profile') {
        document.getElementById('section-profile').classList.remove('hidden');
        document.querySelectorAll('.nav-item')[2].classList.add('active');
    } else if(page === 'detail') {
        document.getElementById('section-detail').classList.remove('hidden');
    } else if(page === 'payment') {
        document.getElementById('section-payment').classList.remove('hidden');
        renderPaymentMethods();
    } else if(page === 'add-payment') {
        document.getElementById('section-add-payment').classList.remove('hidden');
    }
}

// --- BRAND & CAR RENDERING ---
function renderBrands() {
    const cars = JSON.parse(localStorage.getItem('cars'));
    const uniqueBrands = ["All", ...new Set(cars.map(c => c.brand || "Others"))];
    const container = document.getElementById('brand-scroll-container');
    container.innerHTML = '';

    uniqueBrands.forEach(brand => {
        const pill = document.createElement('div');
        pill.className = `brand-pill ${currentBrandFilter === brand ? 'active' : ''}`;
        pill.innerText = brand;
        pill.onclick = () => {
            currentBrandFilter = brand;
            renderBrands(); // Re-render to update active state
            renderCars();
        };
        container.appendChild(pill);
    });
}

function renderCars(filterText = '') {
    const cars = JSON.parse(localStorage.getItem('cars'));
    const container = document.getElementById('car-list');
    container.innerHTML = '';

    let filtered = cars.filter(c => c.name.toLowerCase().includes(filterText.toLowerCase()));
    
    // Filter by Brand
    if(currentBrandFilter !== "All") {
        filtered = filtered.filter(c => (c.brand || "Others") === currentBrandFilter);
    }

    filtered.forEach(car => {
        // Cek logo brand
        const brandLogoHtml = car.brandLogo ? `<img src="${car.brandLogo}" class="brand-logo-small">` : '';
        
        const card = `
        <div class="car-card">
            <img src="${car.img}" class="car-img-home">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="font-weight: 700; font-size: 16px;">${car.name}</div>
                ${brandLogoHtml}
            </div>
            <div style="font-size:10px; color:#888;">${car.brand || 'No Brand'}</div>
            <div class="car-specs">
                ${car.specs.map(s => `<span class="spec-tag">${s}</span>`).join('')}
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                <div style="color: var(--primary-blue); font-weight:600;">Rp ${car.price.toLocaleString()}/hari</div>
                <button onclick="openDetail(${car.id})" style="background:var(--primary-blue); color:white; border:none; padding:8px 15px; border-radius:10px; cursor:pointer;">Sewa</button>
            </div>
        </div>`;
        container.innerHTML += card;
    });
}

function filterCars() {
    renderCars(document.getElementById('search-input').value);
}

// --- LOCATION LOGIC ---
function openDetail(id) {
    const cars = JSON.parse(localStorage.getItem('cars'));
    const car = cars.find(c => c.id === id);
    selectedCarId = id;

    const html = `
        <img src="${car.img}" style="width:100%; height:200px; object-fit:contain;">
        <h2 style="margin-top:10px;">${car.name}</h2>
        <div style="margin: 5px 0;">${car.brand || ''}</div>
        <p style="color:#666;">Rp ${car.price.toLocaleString()} / hari</p>
        
        <div class="location-check">
            <div style="margin-bottom:10px;">
                <label style="font-weight:600; font-size:12px;">Lokasi Asal (Wajib: Semarang)</label>
                <input type="text" id="pickup-origin" value="Semarang" readonly 
                       style="width:100%; padding:10px; margin-top:5px; border:1px solid #ccc; border-radius:5px; background:#e9ecef;">
            </div>
            <div>
                <label style="font-weight:600; font-size:12px;">Lokasi Tujuan (Jateng & DIY)</label>
                <input type="text" id="pickup-dest" placeholder="Contoh: Solo, Jogja, Kudus..." 
                       style="width:100%; padding:10px; margin-top:5px; border:1px solid #ccc; border-radius:5px;"
                       onkeyup="calculateDistance()">
            </div>
            <small id="loc-msg" class="text-danger hidden">Tujuan tidak terjangkau / Typo.</small>
        </div>
        
        <div id="map-view" class="map-container hidden">
            <img src="map.png" class="map-static-img" alt="Peta Lokasi">
            <div class="map-overlay-text" id="map-dist-text">Jarak: -- km</div>
        </div>

        <div style="margin-top:20px;">
            <button id="btn-next-payment" class="btn-block" onclick="goToPayment()" disabled style="background:#ccc;">
                Cek Lokasi Dulu
            </button>
        </div>
    `;
    
    document.getElementById('detail-content').innerHTML = html;
    navTo('detail');
    window.scrollTo(0,0);
}

function calculateDistance() {
    const origin = document.getElementById('pickup-origin').value.toLowerCase();
    const destInput = document.getElementById('pickup-dest');
    const dest = destInput.value.toLowerCase().trim();
    
    const btn = document.getElementById('btn-next-payment');
    const msg = document.getElementById('loc-msg');
    const mapView = document.getElementById('map-view');
    const distText = document.getElementById('map-dist-text');

    // Validasi Sederhana
    if (!origin.includes('semarang')) {
        alert("Asal harus Semarang!");
        return;
    }

    // Cek di database kota
    if (centralJavaCities.hasOwnProperty(dest)) {
        const km = centralJavaCities[dest];
        
        btn.disabled = false;
        btn.style.background = 'var(--primary-blue)';
        btn.innerText = 'Lanjut Pilih Pembayaran';
        msg.classList.add('hidden');
        
        mapView.classList.remove('hidden');
        distText.innerText = `Jarak Estimasi: ${km} km`;
    } else {
        btn.disabled = true;
        btn.style.background = '#ccc';
        btn.innerText = 'Lokasi Tidak Dikenali';
        mapView.classList.add('hidden'); 
        if(dest.length > 2) msg.classList.remove('hidden');
    }
}

// --- PAYMENT & FORCE LOGIN ---
function goToPayment() {
    if (!currentUser) {
        alert("Silakan Login terlebih dahulu untuk melanjutkan pembayaran.");
        openAuth(); // Force Login
        return;
    }
    navTo('payment');
}

function renderPaymentMethods() {
    const container = document.getElementById('payment-list');
    const btnPay = document.getElementById('btn-pay-final');
    const carPrice = JSON.parse(localStorage.getItem('cars')).find(c => c.id === selectedCarId).price;
    
    document.getElementById('payment-total').innerText = "Rp " + carPrice.toLocaleString();
    container.innerHTML = '';
    selectedPaymentMethod = null;
    btnPay.disabled = true; btnPay.style.background = '#ccc';

    const methods = currentUser.paymentMethods || [];
    if (methods.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:20px; color:#999; border:1px dashed #ccc; border-radius:10px;">Belum ada kartu.</div>';
        return;
    }

    methods.forEach((pm, index) => {
        const el = document.createElement('div');
        el.className = 'payment-card';
        el.onclick = () => {
            document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('selected'));
            el.classList.add('selected');
            selectedPaymentMethod = pm;
            btnPay.disabled = false; btnPay.style.background = 'var(--primary-blue)';
        };
        el.innerHTML = `
            <i class="fab fa-cc-${pm.type.toLowerCase()} card-icon"></i>
            <div><div style="font-weight:600;">${pm.type} •••• ${pm.number.slice(-4)}</div><small>${pm.name}</small></div>
        `;
        container.appendChild(el);
    });
}

function savePaymentMethod() {
    const name = document.getElementById('card-name').value;
    const number = document.getElementById('card-number').value;
    const type = document.getElementById('card-type').value;

    if(!name || !number) { alert('Data kurang'); return; }
    if(!currentUser.paymentMethods) currentUser.paymentMethods = [];
    
    currentUser.paymentMethods.push({ name, number, type });
    
    // Update LocalStorage User
    const users = JSON.parse(localStorage.getItem('users'));
    const idx = users.findIndex(u => u.username === currentUser.username);
    if(idx !== -1) { users[idx] = currentUser; localStorage.setItem('users', JSON.stringify(users)); }
    localStorage.setItem('currentUserSession', JSON.stringify(currentUser)); // Update session too

    alert('Kartu tersimpan');
    navTo('payment');
}

function processOrder() {
    if(!selectedPaymentMethod) return;
    const dest = document.getElementById('pickup-dest').value;
    const car = JSON.parse(localStorage.getItem('cars')).find(c => c.id === selectedCarId);

    const newOrder = {
        id: Date.now(), user: currentUser.username,
        carName: car.name, carImg: car.img, price: car.price,
        location: `Semarang ke ${dest}`,
        payment: `${selectedPaymentMethod.type} ${selectedPaymentMethod.number.slice(-4)}`,
        status: 'pending', date: new Date().toLocaleDateString()
    };

    const orders = JSON.parse(localStorage.getItem('orders'));
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));

    alert('Pesanan Berhasil! Menunggu Admin.');
    navTo('history');
}

// --- ADMIN FEATURES ---
function initAdmin() {
    document.getElementById('customer-panel').classList.add('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');
    renderAdminCarList();
    renderAdminOrders();
}

function adminSaveCar() {
    const name = document.getElementById('add-car-name').value;
    const brand = document.getElementById('add-car-brand').value; // New Brand
    const price = parseInt(document.getElementById('add-car-price').value);
    const specsStr = document.getElementById('add-car-specs').value;
    const imgInput = document.getElementById('add-car-img');
    const logoInput = document.getElementById('add-brand-logo'); // New Logo

    if(!name || !price || !brand) { alert('Data kurang lengkap'); return; }

    const cars = JSON.parse(localStorage.getItem('cars'));

    // Helper untuk baca file ganda (Mobil + Logo Brand)
    const readFile = (file) => {
        return new Promise((resolve) => {
            if(!file) resolve(null);
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    };

    // Jalankan promise untuk kedua gambar
    Promise.all([
        readFile(imgInput.files[0]), 
        readFile(logoInput.files[0])
    ]).then(([imgResult, logoResult]) => {
        
        if (isEditing) {
            const id = parseInt(document.getElementById('edit-car-id').value);
            const idx = cars.findIndex(c => c.id === id);
            if (idx !== -1) {
                cars[idx].name = name;
                cars[idx].brand = brand;
                cars[idx].price = price;
                if(specsStr) cars[idx].specs = specsStr.split(',');
                if(imgResult) cars[idx].img = imgResult;
                if(logoResult) cars[idx].brandLogo = logoResult;
            }
            cancelEdit();
        } else {
            cars.push({
                id: Date.now(), name, brand, price,
                specs: specsStr ? specsStr.split(',') : ["Manual"],
                img: imgResult || "pajero.png",
                brandLogo: logoResult || ""
            });
            resetForm();
        }
        localStorage.setItem('cars', JSON.stringify(cars));
        renderAdminCarList();
        alert('Berhasil!');
    });
}

function renderAdminCarList() {
    const cars = JSON.parse(localStorage.getItem('cars'));
    const container = document.getElementById('admin-car-list');
    container.innerHTML = '';
    
    cars.forEach(car => {
        const item = `
        <div class="admin-card" style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center;">
                <img src="${car.img}" style="width:50px; height:40px; object-fit:cover; border-radius:5px; margin-right:10px;">
                <div>
                    <div style="font-weight:bold; font-size:14px;">${car.name}</div>
                    <div style="font-size:11px; color:#666;">${car.brand}</div>
                </div>
            </div>
            <div>
                <button class="admin-action-btn" style="background:var(--warning);" onclick="editCar(${car.id})">Edit</button>
                <button class="admin-action-btn" style="background:var(--danger);" onclick="deleteCar(${car.id})">Hapus</button>
            </div>
        </div>`;
        container.innerHTML += item;
    });
}

// Logic Edit, Hapus, History & Modal (Sama seperti sebelumnya)
function editCar(id) {
    isEditing = true;
    const cars = JSON.parse(localStorage.getItem('cars'));
    const car = cars.find(c => c.id === id);
    document.getElementById('form-title').innerText = "Edit Mobil";
    document.getElementById('edit-car-id').value = car.id;
    document.getElementById('add-car-name').value = car.name;
    document.getElementById('add-car-brand').value = car.brand || "";
    document.getElementById('add-car-price').value = car.price;
    document.getElementById('add-car-specs').value = car.specs.join(',');
    document.getElementById('btn-save-car').innerText = "Update";
    document.getElementById('btn-cancel-edit').classList.remove('hidden');
    document.querySelector('.admin-dashboard').scrollTop = 0;
}
function cancelEdit() {
    isEditing = false; resetForm();
    document.getElementById('form-title').innerText = "Tambah Mobil Baru";
    document.getElementById('btn-save-car').innerText = "+ Simpan";
    document.getElementById('btn-cancel-edit').classList.add('hidden');
}
function resetForm() {
    document.getElementById('add-car-name').value = '';
    document.getElementById('add-car-brand').value = '';
    document.getElementById('add-car-price').value = '';
    document.getElementById('add-car-specs').value = '';
    document.getElementById('add-car-img').value = '';
    document.getElementById('add-brand-logo').value = '';
}
function deleteCar(id) {
    if(confirm('Hapus?')) {
        let cars = JSON.parse(localStorage.getItem('cars')).filter(c => c.id !== id);
        localStorage.setItem('cars', JSON.stringify(cars));
        renderAdminCarList();
    }
}

// Order Logic (Admin & User)
function renderHistory() {
    const orders = JSON.parse(localStorage.getItem('orders'));
    const myOrders = orders.filter(o => o.user === currentUser.username);
    const container = document.getElementById('history-list');
    container.innerHTML = myOrders.length ? '' : '<p style="text-align:center; margin-top:50px;">Kosong</p>';
    
    myOrders.reverse().forEach(o => {
        let color = o.status === 'approved' ? 'status-approved' : (o.status === 'rejected' ? 'status-rejected' : 'status-pending');
        container.innerHTML += `
        <div class="admin-card" onclick="openOrderModal(${o.id})" style="cursor:pointer;">
            <div style="display:flex; justify-content:space-between;"><span style="font-weight:bold;">${o.carName}</span><span class="status-badge ${color}">${o.status}</span></div>
            <div style="font-size:12px; color:#666; margin-top:5px;">${o.date}</div>
        </div>`;
    });
}
function renderAdminOrders() {
    const orders = JSON.parse(localStorage.getItem('orders'));
    const container = document.getElementById('admin-order-list');
    const pending = orders.filter(o => o.status === 'pending');
    container.innerHTML = pending.length ? '' : '<p style="color:#666;">Tidak ada pending.</p>';
    
    pending.forEach(o => {
        container.innerHTML += `
        <div class="admin-card">
            <strong>${o.user}</strong> sewa <strong>${o.carName}</strong><br>
            <small>${o.location}</small>
            <div style="display:flex; gap:10px; margin-top:10px;">
                <button onclick="updateStatus(${o.id}, 'approved')" style="flex:1; background:var(--success); color:white; border:none; padding:5px; border-radius:5px;">Terima</button>
                <button onclick="updateStatus(${o.id}, 'rejected')" style="flex:1; background:var(--danger); color:white; border:none; padding:5px; border-radius:5px;">Tolak</button>
            </div>
        </div>`;
    });
}
function updateStatus(id, st) {
    const orders = JSON.parse(localStorage.getItem('orders'));
    const idx = orders.findIndex(o => o.id === id);
    if(idx !== -1) { orders[idx].status = st; localStorage.setItem('orders', JSON.stringify(orders)); renderAdminOrders(); }
}
function openOrderModal(id) {
    const o = JSON.parse(localStorage.getItem('orders')).find(x => x.id === id);
    
    // LOGIC BARU: Cek status untuk tombol Map
    let actionButton = '';
    if(o.status === 'approved') {
        actionButton = `
            <div style="margin-top: 15px; border-top: 1px dashed #eee; padding-top: 15px;">
                <button class="btn-block" style="background: var(--success);" onclick="toggleModalMap()">
                    <i class="fas fa-map-marker-alt"></i> Lihat Lokasi Pengambilan
                </button>
                <div id="pickup-map-area" class="hidden" style="margin-top: 10px; text-align: center;">
                    <img src="map.png" style="width: 100%; height: 150px; object-fit: cover; border-radius: 10px; border: 2px solid #eee;">
                    <small style="display: block; margin-top: 5px; color: #666;">
                        <strong>Garasi Utama:</strong> Jl. Pemuda No. 123, Semarang
                    </small>
                </div>
            </div>
        `;
    }

    document.getElementById('modal-order-content').innerHTML = `
        <div style="text-align:center;">
            <img src="${o.carImg}" style="height:100px; object-fit: contain;">
            <h3 style="margin-top: 10px;">${o.carName}</h3>
        </div>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 10px; margin-top: 15px; font-size: 13px;">
            <p style="margin-bottom: 5px;"><strong>Status:</strong> <span style="color: ${o.status === 'approved' ? 'green' : 'orange'}">${o.status.toUpperCase()}</span></p>
            <p style="margin-bottom: 5px;"><strong>Lokasi:</strong> ${o.location}</p>
            <p style="margin-bottom: 5px;"><strong>Total:</strong> Rp ${o.price.toLocaleString()}</p>
        </div>
        ${actionButton} 
    `;
    document.getElementById('order-modal').classList.remove('hidden');
}

function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function toggleModalMap() {
    const mapArea = document.getElementById('pickup-map-area');
    if(mapArea) mapArea.classList.toggle('hidden');
}