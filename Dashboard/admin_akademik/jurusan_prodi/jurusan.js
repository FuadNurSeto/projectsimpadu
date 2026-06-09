// ==========================================================================
// --- KONFIGURASI UTAMA & BASE URL API ---
// ==========================================================================
const BASE_URL = "https://admin4e06.vps-poliban.my.id";

let currentTab = "jurusan";
let searchQuery = "";
let dataJurusan = [];
let dataProdi = [];

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

  initUserData();
  fetchMasterData(token);
  initTabAndSearchEvents();
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

// 2. Tarik Data Master dari API VPS Poliban
async function fetchMasterData(token) {
  const tbody = document.getElementById("table-body");
  if (!tbody) return;

  try {
    const [resJurusan, resProdi] = await Promise.all([
      fetch(`${BASE_URL}/api/akademik/jurusan`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }),
      fetch(`${BASE_URL}/api/akademik/prodi`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }),
    ]);

    if (!resJurusan.ok || !resProdi.ok) {
      throw new Error("Respon server VPS gagal.");
    }

    dataJurusan = await resJurusan.json();
    dataProdi = await resProdi.json();

    renderTable();
  } catch (error) {
    console.error("Error Fetch:", error);

    // Perbaikan: Lakukan fallback array kosong agar tabel tidak hancur layouts-nya
    dataJurusan = [];
    dataProdi = [];
    renderTable();

    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: #ef4444; padding: 40px; font-weight: 500;">
          ❌ Terjadi kesalahan saat memuat data master dari VPS Poliban. Sesi token Anda mungkin kedaluwarsa.
        </td>
      </tr>`;
  }
}

// 3. Proses Render Data ke Elemen Tabel secara Dinamis
function renderTable() {
  const tableBody = document.getElementById("table-body");
  const headerRow = document.getElementById("table-header-row");
  const searchInput = document.getElementById("search-input");
  const paginationInfo = document.getElementById("pagination-info");

  if (!tableBody || !headerRow) return;

  // Jika data bawaan kosong (karena error fetch), bersihkan area tabel saja
  if (dataJurusan.length === 0 && dataProdi.length === 0) {
    headerRow.innerHTML = `<th>ID</th><th>NAMA DATA MASTER</th><th>STATUS</th><th style="text-align:center">AKSI</th>`;
    if (paginationInfo) paginationInfo.textContent = "Menampilkan 0 data";
    return;
  }

  tableBody.innerHTML = "";

  if (currentTab === "jurusan") {
    if (searchInput) searchInput.placeholder = "Cari nama jurusan...";

    headerRow.innerHTML = `
      <th style="width: 15%;">ID</th>
      <th style="width: 50%;">NAMA JURUSAN INDUK</th>
      <th style="width: 25%;">TOTAL PROGRAM STUDI</th>
      <th style="width: 10%; text-align: center;">AKSI</th>
    `;

    const filtered = dataJurusan.filter((item) =>
      (item.nama_jurusan || item.nama || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 24px;">Tidak ada data jurusan.</td></tr>`;
      paginationInfo.textContent = `Menampilkan 0 dari total ${dataJurusan.length} Jurusan`;
      return;
    }

    filtered.forEach((item, index) => {
      const count = dataProdi.filter((p) => p.id_jurusan === item.id).length;
      const totalDisplay =
        item.totalProdi !== undefined ? item.totalProdi : count;
      const badgeClass = totalDisplay > 0 ? "has-prodi" : "no-prodi";
      const badgeText =
        totalDisplay > 0 ? `${totalDisplay} Program Studi` : "Belum ada Prodi";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.id || index + 1}</td>
        <td style="font-weight: 600; color: #0f172a;">${item.nama_jurusan || item.nama}</td>
        <td><span class="badge-prodi-count ${badgeClass}">${badgeText}</span></td>
        <td style="text-align: center;">
          <button class="action-mini-btn" onclick="openEditJurusan('${item.id}')" title="Edit Jurusan">
            <i class="fa-solid fa-pencil"></i>
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    paginationInfo.textContent = `Menampilkan ${filtered.length} dari total ${dataJurusan.length} Jurusan`;
  } else {
    if (searchInput) searchInput.placeholder = "Cari nama program studi...";

    headerRow.innerHTML = `
      <th style="width: 15%;">ID</th>
      <th style="width: 45%;">NAMA PROGRAM STUDI</th>
      <th style="width: 30%;">JURUSAN INDUK</th>
      <th style="width: 10%; text-align: center;">AKSI</th>
    `;

    const filtered = dataProdi.filter((item) =>
      (item.nama_prodi || item.nama || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 24px;">Tidak ada data program studi.</td></tr>`;
      paginationInfo.textContent = `Menampilkan 0 dari total ${dataProdi.length} Program Studi`;
      return;
    }

    filtered.forEach((item, index) => {
      const induk = dataJurusan.find((j) => j.id === item.id_jurusan);
      const namaInduk =
        item.nama_jurusan_induk ||
        (induk ? induk.nama_jurusan || induk.nama : "Umum / Tidak Terikat");

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.id || index + 1}</td>
        <td style="font-weight: 600; color: #0f172a;">${item.nama_prodi || item.nama}</td>
        <td style="color: #475569;">${namaInduk}</td>
        <td style="text-align: center;">
          <button class="action-mini-btn" onclick="openEditProdi('${item.id}')" title="Edit Prodi">
            <i class="fa-solid fa-pencil"></i>
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    paginationInfo.textContent = `Menampilkan ${filtered.length} dari total ${dataProdi.length} Program Studi`;
  }
}

// 4. Manajemen Event Listener Utama
function initTabAndSearchEvents() {
  const tabs = document.querySelectorAll(".tab-btn");
  const searchInput = document.getElementById("search-input");
  const btnTambah = document.getElementById("btn-tambah");

  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      tabs.forEach((t) => t.classList.remove("active"));
      e.target.classList.add("active");

      currentTab = e.target.getAttribute("data-tab");
      searchQuery = "";
      if (searchInput) searchInput.value = "";

      if (btnTambah) {
        btnTambah.innerHTML =
          currentTab === "jurusan"
            ? `<i class="fas fa-plus"></i> Tambah Jurusan`
            : `<i class="fas fa-plus"></i> Tambah Prodi`;
      }
      renderTable();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderTable();
    });
  }

  if (btnTambah) {
    btnTambah.addEventListener("click", () => {
      alert(
        `Membuka modal tambah data master untuk: ${currentTab.toUpperCase()}`,
      );
    });
  }
}

function openEditJurusan(id) {
  alert(`Aksi Manajemen: Edit data Jurusan dengan ID: ${id}`);
}
function openEditProdi(id) {
  alert(`Aksi Manajemen: Edit data Program Studi dengan ID: ${id}`);
}
