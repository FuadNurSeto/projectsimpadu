// ==========================================================================
// CONFIGURATION API VPS SIMPADU
// ==========================================================================
const API_BASE_URL = "https://admin4e06.vps-poliban.my.id/api/akademik"; // URL VPS Poliban (Path Akademik)
const API_TOKEN = localStorage.getItem("token"); // Ambil token dari localStorage setelah login

// Header standar untuk request ke API backend Laravel
const requestHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${API_TOKEN}`, // Dikirim jika endpoint API diproteksi auth:sanctum
}; // Mengganti nama variabel menjadi 'headers' agar konsisten dengan prompt

// Fungsi utama yang dijalankan saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", () => {
  // Jalankan pengecekan token terlebih dahulu (Proteksi Halaman)
  if (!API_TOKEN) {
    alert("Sesi Anda habis atau belum login, silakan login kembali.");
    window.location.href = "../../loginbaru/baru.html";
    return;
  }

  // 2. Set Nama Pengguna Secara Dinamis dari Data Login
  setDynamicProfile();

  loadDashboardData();
});

// ==========================================================================
// FUNGSI MEMASUKKAN NAMA LOGIN KE DASHBOARD
// ==========================================================================
function setDynamicProfile() {
  const loggedInName = localStorage.getItem("name") || "Admin Akademik";

  // Ganti nama di Topbar Header
  const topbarNameEl = document.querySelector(".user-name");
  if (topbarNameEl) topbarNameEl.innerText = loggedInName;

  // Ganti nama di Banner Selamat Datang
  const welcomeBannerEl = document.querySelector(".welcome-banner h2");
  if (welcomeBannerEl)
    welcomeBannerEl.innerText = `Selamat Datang, ${loggedInName}!`;

  // Buat inisial avatar otomatis (misal: Aditya Pratama -> AP)
  const avatarEl = document.querySelector(".user-avatar-badge");
  if (avatarEl) {
    const initials = loggedInName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    avatarEl.innerText = initials;
  }
}

// ==========================================================================
// FUNGSI UTAMA UNTUK MENGAMBIL DAN MENAMPILKAN DATA DASHBOARD
// ==========================================================================
async function loadDashboardData() {
  console.log("Memulai pemuatan data dashboard secara modular...");

  // Menjalankan pemuatan data secara berurutan namun tetap terisolasi
  await updateMahasiswaStats();
  await updateMataKuliahStats();
  await updateKelasStatsAndTable();
  await updateTahunAkademikStats();

  // Amankan pemanggilan data dosen secara modular agar tidak menghambat data lain
  try {
    await updateDosenStats();
  } catch (error) {
    console.error("Error Dosen:", error);
    const totalDosenEl = document.getElementById("total-dosen");
    if (totalDosenEl) totalDosenEl.innerText = "0";
  }
}

// --- 1. FUNGSI DATA MAHASISWA ---
async function updateMahasiswaStats() {
  try {
    const resMhs = await fetch(`${API_BASE_URL}/mahasiswa`, {
      method: "GET",
      headers: requestHeaders,
    });
    if (!resMhs.ok) throw new Error("Gagal mengambil data mahasiswa");
    const mhs = await resMhs.json();
    const totalMahasiswaEl = document.getElementById("total-mahasiswa");
    if (totalMahasiswaEl)
      totalMahasiswaEl.innerText = mhs.length.toLocaleString("id-ID");
  } catch (error) {
    console.error("Error Mahasiswa:", error);
    if (document.getElementById("total-mahasiswa"))
      document.getElementById("total-mahasiswa").innerText = "0";
  }
}

// --- 2. FUNGSI DATA MATA KULIAH ---
async function updateMataKuliahStats() {
  try {
    const resMK = await fetch(`${API_BASE_URL}/mata-kuliah`, {
      method: "GET",
      headers: requestHeaders,
    });
    if (!resMK.ok) throw new Error("Gagal mengambil data mata kuliah");
    const mk = await resMK.json();
    const totalMatkulEl = document.getElementById("total-matkul");
    if (totalMatkulEl) totalMatkulEl.innerText = mk.length;
  } catch (error) {
    console.error("Error Mata Kuliah:", error);
    if (document.getElementById("total-matkul"))
      document.getElementById("total-matkul").innerText = "0";
  }
}

// --- 3. FUNGSI DATA KELAS & TABEL ---
async function updateKelasStatsAndTable() {
  try {
    const resKelas = await fetch(`${API_BASE_URL}/kelas`, {
      method: "GET",
      headers: requestHeaders,
    });
    if (!resKelas.ok) throw new Error("Gagal mengambil data kelas");
    const kelas = await resKelas.json();

    const totalKelasEl = document.getElementById("total-kelas");
    if (totalKelasEl)
      totalKelasEl.innerText = kelas.length.toLocaleString("id-ID");

    const kelasAktif = kelas.filter(
      (item) => item.status === "aktif" || item.status === "1",
    );
    renderTabelKelas(kelasAktif);
  } catch (error) {
    console.error("Error Kelas:", error);
    const tableBody = document.getElementById("table-kelas-body");
    if (tableBody)
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Gagal memuat data kelas</td></tr>`;
  }
}

// --- 4. FUNGSI STATUS TAHUN AKADEMIK ---
async function updateTahunAkademikStats() {
  try {
    const resTahun = await fetch(`${API_BASE_URL}/tahun-akademik`, {
      method: "GET",
      headers: requestHeaders,
    });
    if (!resTahun.ok) throw new Error("Gagal mengambil status tahun akademik");
    const tahun = await resTahun.json();
    renderTahunAkademik(tahun);
  } catch (error) {
    console.error("Error Tahun Akademik:", error);
    const statusContainer = document.getElementById("academic-status-list");
    if (statusContainer)
      statusContainer.innerHTML = `<p style="color:red; font-size:12px;">Gagal memuat status akademik</p>`;
  }
}

// --- 5. FUNGSI DATA DOSEN (Endpoint #47) ---
async function updateDosenStats() {
  const resDosen = await fetch(`${API_BASE_URL}/dosen`, {
    method: "GET",
    headers: requestHeaders,
  });

  // Jika status 403, kemungkinan role user tidak diizinkan mengakses data dosen
  if (resDosen.status === 403) {
    console.warn("Akses ditolak untuk data dosen (Role ID tidak sesuai)");
    const totalDosenEl = document.getElementById("total-dosen");
    if (totalDosenEl) totalDosenEl.innerText = "Akses Ditolak";
    return;
  }

  if (!resDosen.ok) {
    // Ambil detail error dari body response (JSON atau Text) untuk mempermudah debugging
    const errorText = await resDosen.text();
    console.error(`[API Dosen Error] Status: ${resDosen.status}`);
    console.error(`[API Dosen Response]:`, errorText);
    throw new Error(`Gagal mengambil data dosen (Status: ${resDosen.status})`);
  }

  const dosen = await resDosen.json();
  const totalDosenEl = document.getElementById("total-dosen");
  if (totalDosenEl)
    totalDosenEl.innerText = dosen.length.toLocaleString("id-ID");
}

// ==========================================================================
// FUNGSI PEMBANTU UNTUK RENDER TABEL KELAS AKTIF
// ==========================================================================
function renderTabelKelas(listKelas) {
  const tableBody = document.getElementById("table-kelas-body");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  listKelas.forEach((kelas) => {
    const row = document.createElement("tr");

    // Ambil data kapasitas dan jumlah terisi dari objek kelas
    const kapasitas = kelas.kapasitas_mahasiswa || 40;
    const terisi = kelas.terisi || 0;

    const kapasitasTerisi =
      terisi >= kapasitas
        ? `<span class="text-alert-danger">${terisi}</span>`
        : `<strong>${terisi}</strong>`;

    row.innerHTML = `
      <td><strong>${kelas.kode_kelas}</strong></td>
      <td>${kelas.nama_kelas}</td>
      <td>${kelas.prodi ? kelas.prodi.nama_prodi : `ID Prodi: ${kelas.prodi_id}`}</td>
      <td>${kapasitasTerisi} / ${kapasitas}</td>
      <td><span class="badge-status status-active">Aktif</span></td>
    `;

    tableBody.appendChild(row);
  });
}

// ==========================================================================
// FUNGSI RENDER STATUS TAHUN AKADEMIK - MATCHING DESAIN UI/UX (image_3fc85b.png)
// ==========================================================================
function renderTahunAkademik(daftarTahun) {
  const statusContainer = document.getElementById("academic-status-list");
  if (!statusContainer) return;

  // 1. SORTING: Mengurutkan agar ID tahun terbaru (angka paling besar) selalu di paling atas
  daftarTahun.sort((a, b) => parseInt(b.id) - parseInt(a.id));

  let htmlContent = "";

  daftarTahun.forEach((item) => {
    // Cek status aktif (bisa berupa string "aktif" atau angka "1")
    const isAktif = item.status === "aktif" || item.status === "1";

    if (isAktif) {
      // 2. TEMPLATE UNTUK TAHUN AKADEMIK AKTIF (KARTU BIRU + CENTANG)
      htmlContent += `
        <div class="academic-card active" style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background-color: #f0f7ff; border: 1.5px solid #bfdbfe; border-radius: 12px; margin-bottom: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background-color: #dbeafe; display: flex; align-items: center; justify-content: center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 16px; color: #1e40af;">${item.id}</div>
              <div style="font-size: 13px; color: #2563eb; text-transform: capitalize; font-weight: 500;">${item.tahun_akademik}</div>
            </div>
          </div>
          <span style="background-color: #2563eb; color: #ffffff; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">Aktif</span>
        </div>
      `;
    } else {
      // 3. TEMPLATE UNTUK TAHUN AKADEMIK NON-AKTIF (KARTU PUTIH STANDAR)
      htmlContent += `
        <div class="academic-card" style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background-color: #f3f4f6; display: flex; align-items: center; justify-content: center;"></div>
            <div>
              <div style="font-weight: 700; font-size: 16px; color: #374151;">${item.id}</div>
              <div style="font-size: 13px; color: #6b7280; text-transform: capitalize;">${item.tahun_akademik}</div>
            </div>
          </div>
          <span style="background-color: #f3f4f6; color: #6b7280; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">Non-Aktif</span>
        </div>
      `;
    }
  });

  statusContainer.innerHTML = htmlContent;
}

// VARIABEL STATE GLOBAL UNTUK KALENDER
let kalenderBulanAktif = new Date().getMonth();
let kalenderTahunAktif = new Date().getFullYear();

function renderCalendarDinamis(bulan, tahun) {
  try {
    const containerGrid = document.getElementById("calendar-dates-grid");
    const textBulanTahun = document.getElementById("calendar-month-year");

    if (!containerGrid || !textBulanTahun) return;

    const hariIni = new Date();
    const daftarBulan = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    textBulanTahun.innerText = `${daftarBulan[bulan]} ${tahun}`;
    containerGrid.innerHTML = "";

    const indeksHariPertama = new Date(tahun, bulan, 1).getDay();
    const totalHariBulanIni = new Date(tahun, bulan + 1, 0).getDate();
    const totalHariBulanLalu = new Date(tahun, bulan, 0).getDate();

    const seluruhKotakTanggal = [];

    for (let i = indeksHariPertama - 1; i >= 0; i--) {
      seluruhKotakTanggal.push({
        angka: totalHariBulanLalu - i,
        isCurrentMonth: false,
      });
    }
    for (let tgl = 1; tgl <= totalHariBulanIni; tgl++) {
      seluruhKotakTanggal.push({ angka: tgl, isCurrentMonth: true });
    }
    const sisaSlot =
      seluruhKotakTanggal.length % 7 === 0
        ? 0
        : 7 - (seluruhKotakTanggal.length % 7);
    for (let tglDepan = 1; tglDepan <= sisaSlot; tglDepan++) {
      seluruhKotakTanggal.push({ angka: tglDepan, isCurrentMonth: false });
    }

    seluruhKotakTanggal.forEach((item, indeks) => {
      const cell = document.createElement("div");
      cell.style.backgroundColor = "#ffffff";
      cell.style.height = "52px";
      cell.style.display = "flex";
      cell.style.alignItems = "center";
      cell.style.justifyContent = "center";
      cell.style.fontSize = "14px";
      cell.style.fontWeight = "500";
      cell.style.boxSizing = "border-box";

      const circleWrapper = document.createElement("div");
      circleWrapper.innerText = item.angka;
      circleWrapper.style.width = "34px";
      circleWrapper.style.height = "34px";
      circleWrapper.style.display = "flex";
      circleWrapper.style.alignItems = "center";
      circleWrapper.style.justifyContent = "center";

      const kolomHari = indeks % 7;
      const isWeekend = kolomHari === 0 || kolomHari === 6;

      if (!item.isCurrentMonth) {
        circleWrapper.style.color = "#bcbcbc";
      } else if (
        item.angka === hariIni.getDate() &&
        bulan === hariIni.getMonth() &&
        tahun === hariIni.getFullYear()
      ) {
        circleWrapper.style.backgroundColor = "#1a73e8";
        circleWrapper.style.color = "#ffffff";
        circleWrapper.style.borderRadius = "50%";
        circleWrapper.style.fontWeight = "600";
        circleWrapper.style.boxShadow = "0 3px 8px rgba(26, 115, 232, 0.4)";
      } else if (isWeekend) {
        circleWrapper.style.color = "#ff3b30";
      } else {
        circleWrapper.style.color = "#1a73e8";
      }

      cell.appendChild(circleWrapper);
      containerGrid.appendChild(cell);
    });
  } catch (error) {
    console.error("Gagal merender kalender: ", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const triggerBtn = document.getElementById("calendar-dropdown-trigger");
  const pickerPanel = document.getElementById("calendar-picker-panel");
  const selectBulan = document.getElementById("select-bulan-kalender");
  const selectTahun = document.getElementById("select-tahun-kalender");
  const btnTerapkan = document.getElementById("btn-terapkan-kalender");

  if (!triggerBtn || !pickerPanel) return;

  const tahunSekarang = new Date().getFullYear();
  selectTahun.innerHTML = "";
  for (let y = tahunSekarang - 5; y <= tahunSekarang + 5; y++) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.innerText = y;
    if (y === kalenderTahunAktif) opt.selected = true;
    selectTahun.appendChild(opt);
  }

  selectBulan.value = kalenderBulanAktif;

  triggerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isHidden = pickerPanel.style.display === "none";
    pickerPanel.style.display = isHidden ? "block" : "none";
  });

  btnTerapkan.addEventListener("click", () => {
    kalenderBulanAktif = parseInt(selectBulan.value);
    kalenderTahunAktif = parseInt(selectTahun.value);
    renderCalendarDinamis(kalenderBulanAktif, kalenderTahunAktif);
    pickerPanel.style.display = "none";
  });

  document.addEventListener("click", (e) => {
    if (!pickerPanel.contains(e.target) && e.target !== triggerBtn) {
      pickerPanel.style.display = "none";
    }
  });

  renderCalendarDinamis(kalenderBulanAktif, kalenderTahunAktif);
});

// --- LOGIKA MODAL LOGOUT ---
document.addEventListener("DOMContentLoaded", function () {
  const logoutTrigger = document.getElementById("logout-trigger");
  const logoutModal = document.getElementById("logout-modal");
  const btnBatalLogout = document.getElementById("btn-batal-logout");
  const btnKonfirmasiLogout = document.querySelector(".logout-btn-konfirmasi");

  // 1. Tampilkan modal saat tombol Keluar Akun di klik
  if (logoutTrigger && logoutModal) {
    logoutTrigger.addEventListener("click", function (e) {
      e.preventDefault();
      logoutModal.classList.add("show");
    });
  }

  // 2. Sembunyikan modal saat tombol Batal di klik
  if (btnBatalLogout && logoutModal) {
    btnBatalLogout.addEventListener("click", function () {
      logoutModal.classList.remove("show");
    });
  }

  // 3. Sembunyikan modal jika pengguna mengklik area luar kotak modal
  if (logoutModal) {
    logoutModal.addEventListener("click", function (e) {
      if (e.target === logoutModal) {
        logoutModal.classList.remove("show");
      }
    });
  }

  // 4. Aksi hapus sesi saat tombol konfirmasi diklik
  if (btnKonfirmasiLogout) {
    btnKonfirmasiLogout.addEventListener("click", function () {
      localStorage.clear();
    });
  }
});
