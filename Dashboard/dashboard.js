// ==========================================
// VARIABLE GLOBAL (Untuk Filter Tahun Tanpa Reload API)
// ==========================================
let globalUsersList = []; 

document.addEventListener("DOMContentLoaded", function () {
  // 1. Sidebar Toggle Responsif
  const toggleBtn = document.querySelector(".toggle-sidebar");
  const sidebar = document.querySelector(".sidebar");

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", function () {
      sidebar.classList.toggle("collapsed");
    });
  }

  // ==========================================
  // 2. Logika Klik Dropdown Profil User
  // ==========================================
  const userProfile = document.querySelector(".user-profile");
  const profileDropdown = document.getElementById("profileDropdown");
  const logoutBtn = document.getElementById("logoutBtn");

  if (userProfile && profileDropdown) {
    userProfile.addEventListener("click", function (e) {
      e.stopPropagation(); 
      profileDropdown.classList.toggle("show");
      this.classList.toggle("active"); 
    });

    document.addEventListener("click", function (e) {
      if (!userProfile.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.remove("show");
        userProfile.classList.remove("active");
      }
    });
  }

  // Logika ketika tombol keluar akun diklik
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("token");
      localStorage.removeItem("user_data");
      alert("Anda telah berhasil keluar.");
      window.location.href = "login.html"; 
    });
  }

  // 3. Navigasi Sidebar Menu Aktif
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      navItems.forEach((nav) => nav.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // 4. Deteksi Filter Tahun di Chart
  const yearSelect = document.querySelector(".year-select");
  if (yearSelect) {
    yearSelect.addEventListener("change", function (e) {
      console.log("Memuat data grafik untuk tahun: " + e.target.value);
      // Jalankan fungsi filter grafik secara real-time berdasarkan tahun terpilih
      filterDanUpdateGrafik(e.target.value);
    });
  }

  // 5. Interaksi Tombol Tambah Pegawai
  const btnTambahPegawai = document.querySelector(".btn-primary");
  if (btnTambahPegawai) {
    btnTambahPegawai.addEventListener("click", function () {
      alert("Form tambah pegawai akan muncul!");
    });
  }

  // 6. Logika Fitur Ketik Kolom Pencarian
  const searchInput = document.querySelector(".search-input");
  if (searchInput) {
    searchInput.addEventListener("keyup", function (e) {
      if (e.key === "Enter") {
        alert("Mencari data untuk pegawai: " + this.value);
      }
    });
  }
});

// ==========================================
// KODE KALENDER (TETAP DIPERTAHANKAN)
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
    const monthYearLabel = document.querySelector(".cal-month-year");
    const calendarGrid = document.querySelector(".calendar-grid");
    const prevBtn = document.querySelectorAll(".cal-btn")[0]; 
    const nextBtn = document.querySelectorAll(".cal-btn")[1]; 

    let currentDate = new Date();
    const monthsID = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    function renderCalendar() {
        const viewYear = currentDate.getFullYear();
        const viewMonth = currentDate.getMonth();

        if (monthYearLabel) {
            monthYearLabel.innerText = `${monthsID[viewMonth]} ${viewYear}`;
        }

        if (!calendarGrid) return;
        calendarGrid.innerHTML = ""; 

        const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
        const lastDate = new Date(viewYear, viewMonth + 1, 0).getDate();
        const prevLastDate = new Date(viewYear, viewMonth, 0).getDate();

        for (let i = firstDayIndex; i > 0; i--) {
            const span = document.createElement("span");
            span.classList.add("empty-day");
            span.innerText = prevLastDate - i + 1;
            calendarGrid.appendChild(span);
        }

        for (let date = 1; date <= lastDate; date++) {
            const span = document.createElement("span");
            span.innerText = date;

            const currentGridCount = calendarGrid.children.length;
            if (currentGridCount % 7 === 0) {
                span.classList.add("holiday"); 
            }

            const realToday = new Date();
            if (
                date === realToday.getDate() &&
                viewMonth === realToday.getMonth() &&
                viewYear === realToday.getFullYear()
            ) {
                span.classList.add("today"); 
            }

            calendarGrid.appendChild(span);
        }
    }

    renderCalendar();

    if (prevBtn) {
        prevBtn.addEventListener("click", function () {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", function () {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }
});

// ==========================================
// INTEGRASI API UTAMA (CARD, GRAFIK & TABEL PEGAWAI)
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const yearSelect = document.querySelector(".year-select");

    if (!token) {
        alert("Sesi Anda berakhir, silakan login kembali.");
        window.location.href = "login.html"; 
        return;
    }

    // Fetch data dari API seluruh User
    fetch("http://localhost:8000/api/akademik/users", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(users => {
        // Simpan ke variabel global agar bisa dipakai berulang kali oleh filter tahun
        globalUsersList = users;

        // 1. Hitung Akumulasi untuk 4 Card Utama
        let totalAkademik = 0;
        let totalPegawai = 0;
        let totalMahasiswa = 0;
        let totalKeuangan = 0;

        users.forEach(user => {
            if (user.role_id === 2) totalAkademik++;   // Admin Akademik
            if (user.role_id === 3) totalPegawai++;     // Admin Pegawai
            if (user.role_id === 4) totalMahasiswa++;   // Admin Mahasiswa
            if (user.role_id === 5) totalKeuangan++;    // Admin Keuangan
        });

        // Tampilkan hasil hitungan ke HTML Card atas
        if (document.getElementById("count-akademik")) document.getElementById("count-akademik").innerText = totalAkademik;
        if (document.getElementById("count-pegawai")) document.getElementById("count-pegawai").innerText = totalPegawai;
        if (document.getElementById("count-mahasiswa")) document.getElementById("count-mahasiswa").innerText = totalMahasiswa;
        if (document.getElementById("count-keuangan")) document.getElementById("count-keuangan").innerText = totalKeuangan;

        // 2. Render Grafik pertama kali sesuai tahun aktif di select dropdown
        if (yearSelect) {
            filterDanUpdateGrafik(yearSelect.value);
        } else {
            filterDanUpdateGrafik("2026");
        }

        // 3. Render Data ke Tabel Pegawai
        renderTablePegawai(users);

        // 4. Render halaman Akun dan Role jika sedang dibuka
        renderAkunRolePage(users);
    })
    .catch(error => console.error("Terjadi kesalahan API Dashboard:", error));
});

// ==========================================
// FUNGSI UNTUK ME-FILTER & UPDATE GRAFIK
// ==========================================
function filterDanUpdateGrafik(tahunYangDipilih) {
    let grafikAktifBulan = new Array(12).fill(0);
    let grafikNonAktifBulan = new Array(12).fill(0);

    globalUsersList.forEach(user => {
        // Hanya memproses golongan admin/pegawai (role_id 2 hingga 5)
        if ([2, 3, 4, 5].includes(user.role_id)) {
            const tanggalDaftar = user.created_at || user.tanggal_terdaftar;
            let cocokTahun = false;
            let bulanIndex = new Date().getMonth(); // Default ke bulan saat ini

            if (tanggalDaftar) {
                const tanggalObjek = new Date(tanggalDaftar);
                const tahunUser = tanggalObjek.getFullYear().toString();
                bulanIndex = tanggalObjek.getMonth();
                if (tahunUser === tahunYangDipilih) cocokTahun = true;
            } else {
                // Jika data tidak ada tanggal dari API, default pasangkan dengan tahun berjalan sistem saat ini
                const tahunSekarang = new Date().getFullYear().toString();
                if (tahunSekarang === tahunYangDipilih) cocokTahun = true;
            }

            if (cocokTahun) {
                if (user.status === "aktif") {
                    grafikAktifBulan[bulanIndex]++;
                } else if (user.status === "nonaktif" || user.status === "non-aktif") {
                    grafikNonAktifBulan[bulanIndex]++;
                }
            }
        }
    });

    // Panggil fungsi pembawa grafik asli template
    updateDashboardChart(grafikAktifBulan, grafikNonAktifBulan);
}

// ==========================================
// FUNGSI SUNTIK DATA KE TABEL PEGAWAI (SESUAI CSS ASLI KAMU)
// ==========================================
function renderTablePegawai(users) {
    const tableBody = document.getElementById("table-pegawai-body");
    const totalBadge = document.getElementById("total-pegawai-badge");
    
    if (!tableBody) return;

    tableBody.innerHTML = ""; // Bersihkan data dummy bawaan HTML lama

    // Filter data khusus pegawai (role_id 2 sampai 5)
    const pegawaiList = users.filter(user => [2, 3, 4, 5].includes(user.role_id));

    // Update jumlah total pegawai pada badge header tabel
    if (totalBadge) {
        totalBadge.innerText = pegawaiList.length;
    }

    if (pegawaiList.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: gray; padding: 20px;">Tidak ada data pegawai ditemukan.</td></tr>`;
        return;
    }

    pegawaiList.forEach((user) => {
        // 1. Tentukan Nama Jabatan & Warna Class Badge CSS Kamu
        let namaJabatan = "Pegawai";
        let tagClass = "tag-blue"; // Default warna biru

        if (user.role_id === 2) { namaJabatan = "Admin Akademik"; tagClass = "tag-blue"; }
        if (user.role_id === 3) { namaJabatan = "Admin Pegawai"; tagClass = "tag-purple"; }
        if (user.role_id === 4) { namaJabatan = "Admin Mahasiswa"; tagClass = "tag-red"; }
        if (user.role_id === 5) { namaJabatan = "Admin Keuangan"; tagClass = "tag-green"; }

        // 2. Format Tanggal Terdaftar ke Bahasa Indonesia
        let tanggalTeks = "14 Januari 2020"; // Fallback default jika null
        const tanggalDaftar = user.created_at || user.tanggal_terdaftar;
        if (tanggalDaftar) {
            const opsiTanggal = { day: 'numeric', month: 'long', year: 'numeric' };
            tanggalTeks = new Date(tanggalDaftar).toLocaleDateString('id-ID', opsiTanggal);
        }

        // 3. Tentukan Class Status Aktif / Non-Aktif sesuai CSS kamu
        // Jika dari API bertuliskan "aktif", kelasnya "aktif". Jika "nonaktif", kelasnya "non-aktif"
        let statusClass = "aktif";
        let statusTeks = "Aktif";
        if (user.status === "nonaktif" || user.status === "non-aktif") {
            statusClass = "non-aktif";
            statusTeks = "Non-Aktif";
        }

        // 4. Nomor Identitas (Gunakan username atau ID jika field nomor identitas belum ada di database)
        let nomorIdentitas = user.username ? user.username.toUpperCase() : `PGW00${user.id}`;

        // Buat baris tabel baru menyontek struktur HTML asli kamu
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <div class="emp-name">${user.name}</div>
                <div class="emp-email">${user.email}</div>
            </td>
            <td><span class="role-badge ${tagClass}">${namaJabatan}</span></td>
            <td>${tanggalTeks}</td>
            <td>${nomorIdentitas}</td>
            <td><span class="status-txt ${statusClass}">${statusTeks}</span></td>
        `;
        tableBody.appendChild(tr);
    });
}
// ==========================================
// FUNGSI UPDATE ENGINE GRAFIK (CHART)
// ==========================================
function updateDashboardChart(dataAktif, dataNonAktif) {
    // Pastikan 'window.pegawaiChart' sudah di-assign pada file inisialisasi grafik chart kamu
    if (window.pegawaiChart) {
        // Deteksi Otomatis Jika Menggunakan ApexCharts
        if (typeof window.pegawaiChart.updateSeries === "function") {
            window.pegawaiChart.updateSeries([
                { name: 'Aktif', data: dataAktif },
                { name: 'Non-Aktif', data: dataNonAktif }
            ]);
            console.log("Grafik ApexCharts berhasil diperbarui!");
        } 
        // Deteksi Otomatis Jika Menggunakan Chart.js asli
        else if (window.pegawaiChart.data && window.pegawaiChart.data.datasets) {
            window.pegawaiChart.data.datasets[0].data = dataAktif;
            window.pegawaiChart.data.datasets[1].data = dataNonAktif;
            window.pegawaiChart.update();
            console.log("Grafik Chart.js berhasil diperbarui!");
        }
    } else {
        console.warn("Koneksi variabel 'window.pegawaiChart' belum terbaca oleh sistem API.");
    }
}

// ==========================================
// FUNGSI KHUSUS UNTUK HALAMAN AKUN DAN ROLE (akunrole.html)
// ==========================================
function renderAkunRolePage(users) {
    const tableBody = document.getElementById("table-akunrole-body");
    const emptyStateElement = document.getElementById("empty-state");

    // Penanda Card Statistik
    const statAkademik = document.getElementById("stat-akademik");
    const statPegawai = document.getElementById("stat-pegawai");
    const statMahasiswa = document.getElementById("stat-mahasiswa");
    const statKeuangan = document.getElementById("stat-keuangan");

    // Jika elemen tabel tidak ditemukan di halaman ini, hentikan fungsi
    if (!tableBody) return;

    // 1. Hitung total data berdasarkan role_id untuk Card Atas
    const akademikList = users.filter(user => user.role_id === 2);
    const pegawaiList = users.filter(user => user.role_id === 3);
    const mahasiswaList = users.filter(user => user.role_id === 4);
    const keuanganList = users.filter(user => user.role_id === 5);

    if (statAkademik) statAkademik.innerText = akademikList.length;
    if (statPegawai) statPegawai.innerText = pegawaiList.length;
    if (statMahasiswa) statMahasiswa.innerText = mahasiswaList.length;
    if (statKeuangan) statKeuangan.innerText = keuanganList.length;

    // Filter gabungan semua akun pegawai yang akan masuk tabel
    const allPegawai = users.filter(user => [2, 3, 4, 5].includes(user.role_id));

    // 2. Logika Sembunyikan/Tampilkan Ilustrasi Data Kosong
    if (allPegawai.length === 0) {
        tableBody.innerHTML = "";
        if (emptyStateElement) emptyStateElement.style.display = "flex";
        return;
    } else {
        if (emptyStateElement) emptyStateElement.style.display = "none";
    }

    tableBody.innerHTML = "";

    // 3. Suntik baris data ke tabel akun dan role
    allPegawai.forEach((user) => {
        let namaJabatan = "Pegawai";
        let tagClass = "tag-blue";

        if (user.role_id === 2) { namaJabatan = "Admin Akademik"; tagClass = "tag-blue"; }
        if (user.role_id === 3) { namaJabatan = "Admin Pegawai"; tagClass = "tag-purple"; }
        if (user.role_id === 4) { namaJabatan = "Admin Mahasiswa"; tagClass = "tag-red"; }
        if (user.role_id === 5) { namaJabatan = "Admin Keuangan"; tagClass = "tag-green"; }

        // Format Tanggal Terdaftar
        let tanggalTeks = "-";
        const tanggalDaftar = user.created_at || user.tanggal_terdaftar;
        if (tanggalDaftar) {
            const opsiTanggal = { day: 'numeric', month: 'long', year: 'numeric' };
            tanggalTeks = new Date(tanggalDaftar).toLocaleDateString('id-ID', opsiTanggal);
        }

        // Ambil data NIP
        let nipTeks = user.nip || user.username || "-";

        // Nomor Identitas
        let nomorIdentitas = user.username ? user.username.toUpperCase() : `PGW00${user.id}`;

        // Status
        let statusClass = "aktif";
        let statusTeks = "Aktif";
        if (user.status === "nonaktif" || user.status === "non-aktif") {
            statusClass = "non-aktif";
            statusTeks = "Non-Aktif";
        }

        // Buat baris tabel
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <div class="emp-name">${user.name}</div>
                <div class="emp-email">${user.email}</div>
            </td>
            <td>${nipTeks}</td>
            <td><span class="role-badge ${tagClass}">${namaJabatan}</span></td>
            <td>${nomorIdentitas}</td>
            <td>${tanggalTeks}</td>
            <td><span class="status-txt ${statusClass}">${statusTeks}</span></td>
            <td>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-edit" data-id="${user.id}" style="background: none; border: none; cursor: pointer; color: #4CC9F0;"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" data-id="${user.id}" style="background: none; border: none; cursor: pointer; color: #FF4D4D;"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}