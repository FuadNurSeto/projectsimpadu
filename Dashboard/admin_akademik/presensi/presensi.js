// ==========================================================================
// --- KONFIGURASI UTAMA & BASE URL API (PRESENSI) ---
// ==========================================================================
const BASE_URL = "https://admin4e06.vps-poliban.my.id";

let currentTab = "mahasiswa"; // Tab default: presensi mahasiswa / dosen
let searchQuery = "";
let currentSort = "waktu_desc"; // Default sorting berdasarkan waktu terbaru
let dataPresensiMahasiswa = [];
let dataPresensiDosen = [];
let activeClassesData = [];
let dataSiswaKelasAktif = [];
let infoKelasAktif = {};
let searchQueryKelas = "";
let currentFilterTahun = "20262";
let currentFilterProdi = "";
let currentFilterSemester = "";

document.addEventListener("DOMContentLoaded", () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("auth_token");

  // Proteksi Keamanan Halaman Sesi
  if (!token) {
    alert(
      "Sesi Anda habis atau Anda belum login. Silakan masuk terlebih dahulu.",
    );
    window.location.href = "../../../loginbaru/baru.html";
    return;
  }

  // Inisialisasi Fitur Utama
  initUserData();
  fetchActiveClasses(token);
  initFilterAndSearchEvents();
  // Sidebar/Topbar initialization is handled by initUserData
});

// 1. Sinkronisasi Data Profil di Topbar Header
function initUserData() {
  const localName = localStorage.getItem("name") || "Nabila Aulia";
  const topbarName = document.getElementById("topbar-user-name");
  const topbarAvatar = document.getElementById("topbar-avatar");

  if (topbarName) topbarName.textContent = localName;
  if (topbarAvatar && localName) {
    const initials = localName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
    topbarAvatar.textContent = initials;
  }
}

// 2. Tarik Data Kelas Aktif dari API
async function fetchActiveClasses(token) {
  const tbody = document.getElementById("table-body");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 40px;">Memuat data kelas aktif...</td></tr>`;

  try {
    const response = await fetch(`${BASE_URL}/api/kelas-aktif`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (response.status === 401) {
      alert("Sesi Anda telah berakhir. Silakan login kembali.");
      localStorage.clear();
      window.location.href = "../../../loginbaru/baru.html";
      return;
    }

    if (!response.ok) {
      throw new Error("Respon server VPS gagal memuat data kelas aktif.");
    }

    activeClassesData = await response.json();
    renderActiveClassesTable();
  } catch (error) {
    console.error("Error Fetch Active Classes:", error);
    activeClassesData = [];
    tbody.innerHTML = ` 
      <tr>
        <td colspan="5" style="text-align: center; color: #ef4444; padding: 40px; font-weight: 500;">
          ❌ Terjadi kesalahan saat memuat data kelas aktif dari VPS Poliban. Silakan periksa koneksi atau sesi token Anda.
        </td>
      </tr>`;
  }
}

function renderActiveClassesTable() {
  const tableBody = document.getElementById("table-body");
  const paginationInfo = document.getElementById("pagination-info");

  if (!tableBody) return;

  tableBody.innerHTML = "";

  let filteredClasses = activeClassesData.filter((item) => {
    const matchesSearch =
      (item.nama_matkul || "")
        .toLowerCase()
        .includes(searchQueryKelas.toLowerCase()) ||
      (item.nama_kelas || "")
        .toLowerCase()
        .includes(searchQueryKelas.toLowerCase()) ||
      (item.nama_dosen || "")
        .toLowerCase()
        .includes(searchQueryKelas.toLowerCase());
    const matchesProdi =
      currentFilterProdi === "" || item.kode_prodi === currentFilterProdi;
    const matchesSemester =
      currentFilterSemester === "" ||
      String(item.semester) === currentFilterSemester;
    const matchesTahun =
      currentFilterTahun === "" ||
      String(item.tahun_akademik) === currentFilterTahun;

    return matchesSearch && matchesProdi && matchesSemester && matchesTahun;
  });

  filteredClasses.sort((a, b) => {
    return (a.nama_matkul || "").localeCompare(b.nama_matkul || "");
  });

  if (filteredClasses.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 24px;">Tidak ada kelas aktif yang ditemukan.</td></tr>`;
    if (paginationInfo)
      paginationInfo.textContent = `Menampilkan 0 dari ${activeClassesData.length} kelas aktif`;
    return;
  }

  filteredClasses.forEach((item) => {
    const inisialDosen = (item.nama_dosen || "D")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
    const progressPercentage =
      (item.pertemuan_saat_ini / item.total_pertemuan) * 100 || 0;
    const progressBarClass =
      progressPercentage < 25
        ? "bar-red"
        : progressPercentage < 50
          ? "bar-orange"
          : "bar-green";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="matkul-cell">
          <div class="icon-wrapper blue-bg"> 
            <i class="fa-solid fa-book-bookmark text-blue"></i>
          </div>
          <div class="matkul-info">
            <span class="matkul-name">${item.nama_matkul || "-"}</span>
            <span class="matkul-sub">${item.sks || 0} SKS</span>
          </div>
        </div>
      </td>
      <td>
        <div class="text-main">${item.nama_kelas || "-"}</div>
        <div class="text-sub">${item.nama_prodi || "-"}</div>
      </td>
      <td>
        <div class="dosen-cell">
          <div class="avatar-mini blue-avatar">${inisialDosen}</div>
          <div class="dosen-info">
            <span class="dosen-name">${item.nama_dosen || "-"}</span>
            <span class="dosen-sub">NIP. ${item.nip_dosen || "-"}</span>
          </div>
        </div>
      </td>
      <td>
        <div class="progress-cell">
          <div class="progress-text">
            <span class="current-p">${item.pertemuan_saat_ini || 0}</span> / ${item.total_pertemuan || 16} Pertemuan
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar ${progressBarClass}" style="width: ${progressPercentage}%;"></div>
          </div>
        </div>
      </td>
      <td>
        <div class="action-cell">
          <button class="btn-isi-absen" onclick="isiAbsenKelas('${item.id}')">Isi Absen</button>
          <button class="btn-detail" onclick="bukaRekapMatrixKelas('${item.nama_kelas}', '${item.nama_matkul}', '${item.nama_dosen}')">
            <i class="fa-solid fa-table-cells-large"></i> Detail
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  if (paginationInfo)
    paginationInfo.textContent = `Menampilkan ${filteredClasses.length} dari ${activeClassesData.length} kelas aktif di semester ini`;
}

function initFilterAndSearchEvents() {
  const searchInput = document.getElementById("search-input");
  const selectSemester = document.getElementById("select-semester");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQueryKelas = e.target.value;
      renderActiveClassesTable();
    });
  }
  if (selectSemester) {
    selectSemester.addEventListener("change", (e) => {
      currentFilterSemester = e.target.value;
      renderActiveClassesTable();
    });
  }
}

// ==========================================================================
// --- FITUR BARU: MANAJEMEN PENGISIAN PRESENSI PER KELAS ---
// ==========================================================================

/**
 * 1. Fungsi memicu perpindahan tampilan dari Daftar Kelas ke Form Isi Absen
 * Dipanggil dari tombol onclick="isiAbsenKelas(id)" di tabel utama
 */
async function isiAbsenKelas(kelasId) {
  const token =
    localStorage.getItem("token") || localStorage.getItem("auth_token");

  try {
    const [resInfo, resSiswa] = await Promise.all([
      fetch(`${BASE_URL}/api/kelas-matkul/${kelasId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${BASE_URL}/api/kelas-matkul/${kelasId}/mahasiswa`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (!resInfo.ok || !resSiswa.ok)
      throw new Error("Gagal mengambil detail data kelas dari server.");

    infoKelasAktif = await resInfo.json();
    dataSiswaKelasAktif = await resSiswa.json();

    dataSiswaKelasAktif = dataSiswaKelasAktif.map((siswa) => ({
      ...siswa,
      status_kehadiran: siswa.status_kehadiran || "Hadir",
      keterangan: siswa.keterangan || "",
    }));

    renderHeaderStatistikPresensi();
    renderTabelInputPresensi();

    document.getElementById("main-list-presensi-card").style.display = "none";
    document.getElementById("detail-input-presensi-card").style.display =
      "block";

    const pageTitle = document.getElementById("dynamic-page-title");
    if (pageTitle) pageTitle.textContent = "Isi Presensi Kelas";
  } catch (error) {
    alert("❌ Error: " + error.message);
  }
}

/**
 * 2. Merender Banner Info Kelas & Blok Statistik Atas (Warna Gelap)
 */
function renderHeaderStatistikPresensi() {
  const bannerContainer = document.getElementById("presensi-banner-info");
  if (!bannerContainer) return;

  const totalSiswa = dataSiswaKelasAktif.length;
  const jmlHadir = dataSiswaKelasAktif.filter(
    (s) => s.status_kehadiran === "Hadir",
  ).length;
  const jmlSakit = dataSiswaKelasAktif.filter(
    (s) => s.status_kehadiran === "Sakit",
  ).length;
  const jmlIzin = dataSiswaKelasAktif.filter(
    (s) => s.status_kehadiran === "Izin",
  ).length;
  const jmlAlpa = dataSiswaKelasAktif.filter(
    (s) => s.status_kehadiran === "Alpa",
  ).length;

  bannerContainer.innerHTML = `
    <div class="banner-left">
      <div class="pertemuan-badge">${infoKelasAktif.pertemuan_ke || "02"} <span class="sub-pb">PERTEMUAN</span></div>
      <div class="banner-text-details">
        <h3>${infoKelasAktif.nama_matkul || "Administrasi Database"} - Kelas ${infoKelasAktif.nama_kelas || "TI-4E"}</h3>
        <p>• ${infoKelasAktif.hari_tanggal || "Selasa, 2 April 2026"} &nbsp;&nbsp; • ${infoKelasAktif.jam_kuliah || "08:00 - 10:30 WITA"} &nbsp;&nbsp; • Dosen: ${infoKelasAktif.nama_dosen || "Budi Setiawan, M.Kom"}</p>
      </div>
    </div>
    <div class="banner-right-stats">
      <div class="stat-box"><strong>${totalSiswa}</strong><span>TOTAL</span></div>
      <div class="stat-box text-green"><strong>${jmlHadir}</strong><span>HADIR</span></div>
      <div class="stat-box"><strong>${totalSiswa - (jmlHadir + jmlSakit + jmlIzin + jmlAlpa)}</strong><span>BELUM ABSEN</span></div>
      <div class="stat-box text-orange"><strong>${jmlSakit}</strong><span>SAKIT</span></div>
      <div class="stat-box text-blue"><strong>${jmlIzin}</strong><span>IZIN</span></div>
      <div class="stat-box text-red"><strong>${jmlAlpa}</strong><span>ALPA</span></div>
    </div>
  `;
}

/**
 * 3. Merender Tabel Daftar Mahasiswa beserta Button Group Opsi Kehadiran
 */
function renderTabelInputPresensi() {
  const tbody = document.getElementById("table-body-input-presensi");
  if (!tbody) return;

  tbody.innerHTML = "";
  dataSiswaKelasAktif.forEach((siswa, index) => {
    const tr = document.createElement("tr");

    const isHadir =
      siswa.status_kehadiran === "Hadir"
        ? "btn-opt hadir active"
        : "btn-opt default";
    const isSakit =
      siswa.status_kehadiran === "Sakit"
        ? "btn-opt sakit active"
        : "btn-opt default";
    const isIzin =
      siswa.status_kehadiran === "Izin"
        ? "btn-opt izin active"
        : "btn-opt default";
    const isAlpa =
      siswa.status_kehadiran === "Alpa"
        ? "btn-opt alpa active"
        : "btn-opt default";

    const inisial = (siswa.nama_mahasiswa || "M")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    tr.innerHTML = `
      <td style="text-align: center; color: #94a3b8;">${index + 1}</td>
      <td style="font-weight: 500; color: #64748b;">${siswa.nim}</td>
      <td>
        <div class="student-profile-cell">
          <div class="avatar-student">${inisial}</div>
          <span class="student-name-text">${siswa.nama_mahasiswa}</span>
        </div>
      </td>
      <td>
        <div class="presence-options-group">
          <button type="button" class="${isHadir}" onclick="ubahStatusSiswaSatuKehadiran(${index}, 'Hadir')">H</button>
          <button type="button" class="${isSakit}" onclick="ubahStatusSiswaSatuKehadiran(${index}, 'Sakit')">S</button>
          <button type="button" class="${isIzin}" onclick="ubahStatusSiswaSatuKehadiran(${index}, 'Izin')">I</button>
          <button type="button" class="${isAlpa}" onclick="ubahStatusSiswaSatuKehadiran(${index}, 'Alpa')">A</button>
        </div>
      </td>
      <td>
        <input type="text" class="input-keterangan-presensi" 
          value="${siswa.keterangan}" 
          placeholder="Tambahkan catatan..." 
          onchange="updateKeteranganSiswaLokal(${index}, this.value)">
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * 4. Mengubah Status Kehadiran Individu Secara Real-Time di Array Lokal
 */
function ubahStatusSiswaSatuKehadiran(index, statusBaru) {
  dataSiswaKelasAktif[index].status_kehadiran = statusBaru;
  renderHeaderStatistikPresensi();
  renderTabelInputPresensi();
}

/**
 * 5. Update Input Teks Keterangan Sakit/Izin ke Array Lokal
 */
function updateKeteranganSiswaLokal(index, teks) {
  dataSiswaKelasAktif[index].keterangan = teks;
}

/**
 * 6. Fitur Cepat Tombol: "Hadirkan Semua"
 */
function hadirkanSemuaMahasiswa() {
  dataSiswaKelasAktif.forEach((siswa) => {
    siswa.status_kehadiran = "Hadir";
  });
  renderHeaderStatistikPresensi();
  renderTabelInputPresensi();
}

/**
 * 7. Kirim Bundle Koleksi Data Presensi Kelas ke Server (Simpan Data)
 */
async function simpanBundlePresensiKeServer() {
  const token =
    localStorage.getItem("token") || localStorage.getItem("auth_token");
  const btnSimpan = document.getElementById("btn-submit-bundle-presensi");

  btnSimpan.textContent = "Menyimpan...";
  btnSimpan.disabled = true;

  const payload = {
    kelas_id: infoKelasAktif.id,
    pertemuan: infoKelasAktif.pertemuan_ke || 2,
    data_presensi: dataSiswaKelasAktif.map((s) => ({
      nim: s.nim,
      status: s.status_kehadiran,
      catatan: s.keterangan,
    })),
  };

  try {
    const response = await fetch(`${BASE_URL}/api/presensi/simpan-bundle`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Gagal mengirim rekap presensi ke VPS.");

    alert("Presensi Berhasil Disimpan ke Sistem SIMPADU POLIBAN!");
    kembaliKeDaftarKelas();
  } catch (error) {
    alert("❌ Gagal Menyimpan: " + error.message);
  } finally {
    btnSimpan.textContent = "Simpan Data";
    btnSimpan.disabled = false;
  }
}

/**
 * 8. Fungsi untuk kembali ke tampilan daftar kelas
 */
function kembaliKeDaftarKelas() {
  document.getElementById("detail-input-presensi-card").style.display = "none";
  document.getElementById("main-list-presensi-card").style.display = "block";
  const pageTitle = document.getElementById("dynamic-page-title");
  if (pageTitle) pageTitle.textContent = "Presensi Mahasiswa";
}

// Data Dummy Struktur Rekap Matriks P1-P16 sesuai Gambar 4
const dataMatrixMahasiswa = [
  { nim: "C030322001", nama: "Ahmad Reza Pratama", p: ["H", "H", "H", "H", "H", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], h: 5, s: 0, i: 0, a: 0 },
  { nim: "C030322002", nama: "Budi Santoso",         p: ["H", "H", "S", "H", "S", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], h: 3, s: 2, i: 0, a: 0 },
  { nim: "C030322003", nama: "Citra Kirana",         p: ["H", "H", "H", "A", "A", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], h: 3, s: 0, i: 0, a: 2 },
  { nim: "C030322004", nama: "Dimas Anggara",        p: ["H", "I", "H", "H", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], h: 3, s: 0, i: 1, a: 0 },
  { nim: "C030322005", nama: "Eka Putri",            p: ["H", "H", "H", "H", "I", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], h: 4, s: 0, i: 1, a: 0 }
];

/**
 * Membuka Halaman Matriks Rekap Absen
 */
function bukaRekapMatrixKelas(namaKelas, namaMatkul, namaDosen) {
  // Update teks informasi komponen header rekap
  document.getElementById("rekap-subtitle-kelas").textContent = `${namaMatkul} - Dosen : ${namaDosen}`;
  document.getElementById("badge-kelas-nama").textContent = `Kelas ${namaKelas}`;

  // Sembunyikan halaman utama, tampilkan halaman rekap matriks
  document.getElementById("main-list-presensi-card").style.display = "none";
  document.getElementById("detail-rekap-presensi-card").style.display = "block";
  document.getElementById("dynamic-page-title").innerText = "Detail Kehadiran Mahasiswa";

  renderMatrixTable();
}

/**
 * Memproses rendering baris ke dalam tabel matriks secara presisi
 */
function renderMatrixTable() {
  const tbody = document.getElementById("table-body-rekap-matrix");
  tbody.innerHTML = "";

  dataMatrixMahasiswa.forEach(mhs => {
    const tr = document.createElement("tr");

    // 1. Buat kolom nama & nim
    let rowHTML = `
      <td>
        <div class="matrix-mhs-info">
          <span class="matrix-mhs-name">${mhs.nama}</span>
          <span class="matrix-mhs-nim">${mhs.nim}</span>
        </div>
      </td>
    `;

    // 2. Loop status P1 s.d P16 untuk membuat lingkaran icon kecil
    mhs.p.forEach(status => {
      let badgeHTML = "";
      if (status === "H") {
        badgeHTML = `<span class="badge-status-dot bg-hadir"><i class="fa-solid fa-check"></i></span>`;
      } else if (status === "S") {
        badgeHTML = `<span class="badge-status-dot bg-sakit">S</span>`;
      } else if (status === "I") {
        badgeHTML = `<span class="badge-status-dot bg-izin">I</span>`;
      } else if (status === "A") {
        badgeHTML = `<span class="badge-status-dot bg-alpa"><i class="fa-solid fa-xmark"></i></span>`;
      } else {
        badgeHTML = `<span class="badge-status-dot bg-belum">-</span>`;
      }

      rowHTML += `<td class="cell-p-status">${badgeHTML}</td>`;
    });

    // 3. Tambahkan kolom total rekap angka di sisi paling kanan
    rowHTML += `
      <td class="cell-total total-h">${mhs.h}</td>
      <td class="cell-total total-s">${mhs.s}</td>
      <td class="cell-total total-i">${mhs.i}</td>
      <td class="cell-total total-a">${mhs.a}</td>
    `;

    tr.innerHTML = rowHTML;
    tbody.appendChild(tr);
  });

  // Update info jumlah mahasiswa di bawah tabel
  document.getElementById("total-mahasiswa-rekap-text").textContent = `Menampilkan ${dataMatrixMahasiswa.length} dari total 28 Mahasiswa`;
}

/**
 * Fungsi tombol untuk kembali ke daftar kelas utama
 */
function kembaliKeDaftarUtama() {
  document.getElementById("detail-rekap-presensi-card").style.display = "none";
  document.getElementById("main-list-presensi-card").style.display = "block";
  document.getElementById("dynamic-page-title").innerText = "Presensi Mahasiswa";
}

/**
 * Membuka atau menutup menu list dropdown tahun akademik
 */
function toggleDropdownTahun() {
  const dropdown = document.getElementById("dropdown-tahun-akademik");
  dropdown.classList.toggle("open");
}

/**
 * Memilih opsi tahun akademik, merubah label text, dan memfilter data
 */
function pilihTahun(valueTahun, element) {
  // 1. Perbarui teks pada trigger utama tampilan
  document.getElementById("selected-text-tahun").innerText = "Tahun : " + valueTahun;
  
  // 2. Bersihkan status active dari item dropdown sebelumnya
  const menuList = document.getElementById("dropdown-menu-list-tahun");
  const allItems = menuList.getElementsByClassName("dropdown-item");
  for (let item of allItems) {
    item.classList.remove("active");
  }
  
  // 3. Tambahkan status active ke opsi yang baru saja dipilih
  element.classList.add("active");
  document.getElementById("dropdown-tahun-akademik").classList.remove("open");
  
  // 4. Update filter global dan render ulang tabel (ambil kode angka depannya saja)
  currentFilterTahun = valueTahun.split(' ')[0]; 
  renderActiveClassesTable();
}

/**
 * Event Listener global untuk menutup dropdown otomatis saat klik di luar area
 */
document.addEventListener("click", function (event) {
  const dropdownProdi = document.getElementById("dropdown-prodi");
  const dropdownTahun = document.getElementById("dropdown-tahun-akademik");

  // Jika klik berada di luar area komponen dropdown prodi dan tahun, tutup paksa menu list
  if (
    dropdownProdi &&
    !dropdownProdi.contains(event.target) &&
    dropdownTahun &&
    !dropdownTahun.contains(event.target)
  ) {
    tutupSemuaDropdown();
  }
});

/**
 * Membuka / menutup dropdown Program Studi
 */
function toggleDropdownProdi() {
  const dropdown = document.getElementById("dropdown-prodi");
  const isOpening = !dropdown.classList.contains("open");

  // Tutup semua dropdown lain terlebih dahulu agar tidak bertabrakan
  tutupSemuaDropdown();

  if (isOpening) {
    dropdown.classList.add("open");
    // Fokuskan kursor otomatis ke kotak input pencarian saat terbuka
    setTimeout(() => {
      document.getElementById("input-search-prodi").focus();
    }, 50);
  }
}

/**
 * Memfilter daftar program studi berdasarkan input teks user
 */
function filterOpsiProdi() {
  const input = document.getElementById("input-search-prodi");
  const filter = input.value.toLowerCase();
  const container = document.getElementById("options-list-prodi");
  const items = container.getElementsByClassName("dropdown-item");
  const noResult = document.getElementById("prodi-no-result");
  let matchCount = 0;

  // Loop semua item prodi, sembunyikan jika teks tidak cocok
  for (let i = 0; i < items.length; i++) {
    const txtValue = items[i].textContent || items[i].innerText;
    if (txtValue.toLowerCase().indexOf(filter) > -1) {
      items[i].style.display = "";
      matchCount++;
    } else {
      items[i].style.display = "none";
    }
  }

  // Tampilkan pesan "Prodi tidak ditemukan" jika tidak ada yang cocok
  noResult.style.display = matchCount === 0 ? "block" : "none";
}

/**
 * Memilih program studi terpilih
 */
function pilihProdi(valueProdi, element) {
  document.getElementById("selected-text-prodi").innerText = valueProdi;

  // Reset status active dari opsi prodi lama
  const items = document
    .getElementById("options-list-prodi")
    .getElementsByClassName("dropdown-item");
  for (let item of items) {
    item.classList.remove("active");
  }

  element.classList.add("active");
  document.getElementById("dropdown-prodi").classList.remove("open");

  // Reset input pencarian saat dropdown ditutup
  document.getElementById("input-search-prodi").value = "";
  filterOpsiProdi();

  currentFilterProdi = valueProdi === "Semua Program Studi" ? "" : valueProdi;
  renderActiveClassesTable();
}

/**
 * Fungsi helper untuk menutup semua dropdown kustom yang sedang terbuka
 */
function tutupSemuaDropdown() {
  const dropdownProdi = document.getElementById("dropdown-prodi");
  if (dropdownProdi) dropdownProdi.classList.remove("open");

  const dropdownTahun = document.getElementById("dropdown-tahun-akademik");
  if (dropdownTahun) dropdownTahun.classList.remove("open");
}
