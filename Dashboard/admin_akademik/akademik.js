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
  try {
    // 1. AMBIL DATA MAHASISWA (Endpoint #34)
    const resMhs = await fetch(`${API_BASE_URL}/mahasiswa`, {
      method: "GET",
      headers: requestHeaders,
    });
    if (!resMhs.ok) throw new Error("Gagal mengambil data mahasiswa");
    const mhs = await resMhs.json();
    const totalMahasiswaEl = document.getElementById("total-mahasiswa");
    if (totalMahasiswaEl) {
      totalMahasiswaEl.innerText = mhs.length.toLocaleString("id-ID");
    }

    // 2. AMBIL DATA MATA KULIAH (Endpoint #21)
    const resMK = await fetch(`${API_BASE_URL}/mata-kuliah`, {
      method: "GET",
      headers: requestHeaders,
    });
    if (!resMK.ok) throw new Error("Gagal mengambil data mata kuliah");
    const mk = await resMK.json();
    const totalMatkulEl = document.getElementById("total-matkul"); // Sesuaikan ID ke 'total-matkul'
    if (totalMatkulEl) {
      totalMatkulEl.innerText = mk.length;
    }

    // 3. AMBIL DATA KELAS (Endpoint #7) & ISI TABEL KELAS AKTIF
    const resKelas = await fetch(`${API_BASE_URL}/kelas`, {
      method: "GET",
      headers: requestHeaders,
    });
    if (!resKelas.ok) throw new Error("Gagal mengambil data kelas");
    const kelas = await resKelas.json();

    // Isi angka Total Kelas
    const totalKelasEl = document.getElementById("total-kelas");
    if (totalKelasEl) {
      totalKelasEl.innerText = kelas.length.toLocaleString("id-ID");
    }

    // Isi tabel Kelas Aktif (Filter yang statusnya aktif saja)
    const kelasAktif = kelas.filter(
      (item) => item.status === "aktif" || item.status === "1",
    );
    renderTabelKelas(kelasAktif);

    // 4. AMBIL DATA TAHUN AKADEMIK (Endpoint #5)
    const resTahun = await fetch(`${API_BASE_URL}/tahun-akademik`, {
      method: "GET",
      headers: requestHeaders,
    });
    if (!resTahun.ok) throw new Error("Gagal mengambil status tahun akademik");
    const tahun = await resTahun.json();
    renderTahunAkademik(tahun);

    // 5. DATA DOSEN (Placeholder sementara karena belum ada endpoint khusus role 2)
    const totalDosenEl = document.getElementById("total-dosen");
    if (totalDosenEl) {
      totalDosenEl.innerText = "128"; // Hardcode atau konsultasi ke backend
    }
  } catch (error) {
    console.error("Error koneksi ke VPS:", error);
    // Menampilkan pesan error di tempat yang relevan jika elemen tersedia
    const tableBody = document.getElementById("table-kelas-body");
    if (tableBody)
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Gagal memuat data kelas: ${error.message}</td></tr>`;
    const statusContainer = document.getElementById("academic-status-list");
    if (statusContainer)
      statusContainer.innerHTML = `<p style="color:red; font-size:12px;">Gagal memuat status akademik: ${error.message}</p>`;
  }
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
      <td>ID Prodi: ${kelas.prodi_id}</td>
      <td>${kapasitasTerisi} / ${kapasitas}</td>
      <td><span class="badge-status status-active">Aktif</span></td>
    `;

    tableBody.appendChild(row);
  });
}

// ==========================================================================
// FUNGSI PEMBANTU UNTUK RENDER STATUS TAHUN AKADEMIK (PANEL KANAN)
// ==========================================================================
function renderTahunAkademik(listPeriode) {
  const statusContainer = document.getElementById("academic-status-list");
  if (!statusContainer) return;

  statusContainer.innerHTML = "";

  listPeriode.forEach((periode) => {
    const isActive = periode.status === "aktif" || periode.status === "1";

    const itemHTML = `
      <div class="status-row-item ${isActive ? "active-row" : ""}">
          <div class="status-left">
              <div class="circle-check-icon ${isActive ? "blue-fill" : "grey-fill"}">
                  ${isActive ? '<i class="fas fa-check"></i>' : ""}
              </div>
              <div class="period-text">
                  <h5>${periode.id}</h5>
                  <p>${periode.tahun_akademik}</p>
              </div>
          </div>
          <span class="badge-status ${isActive ? "status-active" : "status-inactive"}">
              ${isActive ? "Aktif" : "Non-Aktif"}
          </span>
      </div>
    `;
    statusContainer.insertAdjacentHTML("beforeend", itemHTML);
  });
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
