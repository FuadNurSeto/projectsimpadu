// ==========================================================================
// --- KONFIGURASI UTAMA & BASE URL API ---
// ==========================================================================
const BASE_URL = "https://admin4e06.vps-poliban.my.id";

let currentTab = "jurusan";
let searchQuery = "";
let currentSort = "nama_asc";
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

// 2. Tarik Data Master dari API
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
      fetch(`${BASE_URL}/api/akademik/prodis`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }),
    ]);

    // Penanganan otomatis jika sesi habis (Token Expired)
    if (resJurusan.status === 401 || resProdi.status === 401) {
      alert("Sesi Anda telah berakhir. Silakan login kembali.");
      localStorage.clear();
      window.location.href = "../../../loginbaru/baru.html";
      return;
    }

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
async function renderTable() { // Make renderTable async to await API calls if needed
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

    // Proses Pengurutan (Sorting)
    filtered.sort((a, b) => {
      if (currentSort === "nama_asc" || currentSort === "nama_desc") {
        const nameA = (a.nama_jurusan || a.nama || "").toLowerCase();
        const nameB = (b.nama_jurusan || b.nama || "").toLowerCase();
        return currentSort === "nama_asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
      if (
        currentSort === "prodi_count_asc" ||
        currentSort === "prodi_count_desc"
      ) {
        const getCount = (item) => {
          if (item.totalProdi !== undefined) return item.totalProdi;
          return dataProdi.filter((p) => p.id_jurusan === item.id).length;
        };
        return currentSort === "prodi_count_asc"
          ? getCount(a) - getCount(b)
          : getCount(b) - getCount(a);
      }
      return 0;
    });

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

    // Ambil semua checkbox jenjang dan jurusan yang dicentang saat ini
    const checkedJenjang = Array.from(document.querySelectorAll("#filterDropdownProdi input[name='jenjang']:checked")).map(cb => cb.value.toUpperCase());
    const checkedJurusan = Array.from(document.querySelectorAll("#filterDropdownProdi input[name='jurusan_induk']:checked")).map(cb => cb.value.toLowerCase());

    let filtered = dataProdi.filter((item) => {
      const namaProdi = (item.nama_prodi || item.nama || "").toLowerCase();
      const matchSearch = namaProdi.includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      // 1. Logika Filter Jenjang (D3 / D4)
      if (checkedJenjang.length > 0) {
        const jenjangData = (item.jenjang || item.nama_prodi || "").toUpperCase();
        const matchJenjang = checkedJenjang.some(j => jenjangData.includes(j));
        if (!matchJenjang) return false;
      }

      // 2. Logika Filter Jurusan Induk
      if (checkedJurusan.length > 0) {
        const induk = dataJurusan.find((j) => j.id === item.id_jurusan);
        const namaInduk = (item.nama_jurusan_induk || (induk ? induk.nama_jurusan || induk.nama : "")).toLowerCase();
        
        // Memeriksa apakah nama jurusan mengandung kata kunci value checkbox
        const matchJurusan = checkedJurusan.some(j => namaInduk.includes(j));
        if (!matchJurusan) return false;
      }

      return true;
    });

    // Sorting untuk Prodi
    filtered.sort((a, b) => {
      if (currentSort === "nama_asc" || currentSort === "nama_desc") {
        const nameA = (a.nama_prodi || a.nama || "").toLowerCase();
        const nameB = (b.nama_prodi || b.nama || "").toLowerCase();
        return currentSort === "nama_asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
      if (currentSort === "jurusan_asc") {
        const getInduk = (item) => {
          const j = dataJurusan.find((induk) => induk.id === item.id_jurusan);
          return (
            item.nama_jurusan_induk || (j ? j.nama_jurusan || j.nama : "")
          ).toLowerCase();
        };
        return getInduk(a).localeCompare(getInduk(b));
      }
      if (currentSort === "jenjang_asc") {
        return (a.jenjang || "").localeCompare(b.jenjang || "");
      }
      return 0;
    });

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
      currentSort = "nama_asc"; // Reset sort saat ganti tab

      // Reset label tombol urutkan ke default
      const sortLabels = document.querySelectorAll(
        ".action-mini-btn-filter[id^='sort-btn']",
      );
      sortLabels.forEach((btn) => {
        btn.innerHTML = `<i class="fa-solid fa-arrow-down-wide-short"></i> Urutkan: Nama (A-Z) <i class="fa-solid fa-chevron-down arrow-icon"></i>`;
      });

      if (searchInput) searchInput.value = "";

      if (btnTambah) {
        btnTambah.innerHTML =
          currentTab === "jurusan"
            ? `<i class="fas fa-plus"></i> Tambah Jurusan`
            : `<i class="fas fa-plus"></i> Tambah Prodi`;

        if (currentTab === "prodi") {
          btnTambah.classList.add("btn-add-prodi");
        } else {
          btnTambah.classList.remove("btn-add-prodi");
        }
      }

      const fwJurusan = document.getElementById("filter-wrapper-jurusan");
      const fwProdi = document.getElementById("filter-wrapper-prodi");
      const swJurusan = document.getElementById("sort-wrapper-jurusan");
      const swProdi = document.getElementById("sort-wrapper-prodi");

      if (fwJurusan && fwProdi && swJurusan && swProdi) {
        fwJurusan.style.display =
          currentTab === "jurusan" ? "inline-block" : "none";
        fwProdi.style.display =
          currentTab === "prodi" ? "inline-block" : "none";
        swJurusan.style.display =
          currentTab === "jurusan" ? "inline-block" : "none";
        swProdi.style.display =
          currentTab === "prodi" ? "inline-block" : "none";
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
      if (currentTab === "jurusan") {
        bukaModalJurusan();
      } else {
        alert("Fitur Tambah Program Studi dipilih!");
      }
    });
  }
}

function openEditJurusan(id) {
  alert(`Aksi Manajemen: Edit data Jurusan dengan ID: ${id}`);
}
// --- LOGIKA MODAL POPUP & KIRIM DATA JURUSAN KE API ---
function bukaModalJurusan() {
  const modal = document.getElementById("modal-tambah-jurusan");
  const form = document.getElementById("form-tambah-jurusan");
  const inputNama = document.getElementById("input-nama-jurusan");

  if (!modal || !form) return;

  form.reset();
  modal.classList.remove("hidden"); // Tampilkan modal

  document.getElementById("btn-batal-jurusan").onclick = () => {
    modal.classList.add("hidden"); // Sembunyikan modal
  };

  form.onsubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
    const namaJurusanBaru = inputNama.value.trim();

    const btnSimpan = document.getElementById("btn-simpan-jurusan");
    btnSimpan.textContent = "Menyimpan...";
    btnSimpan.disabled = true;

    try {
      const response = await fetch(`${BASE_URL}/api/akademik/jurusan`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ nama_jurusan: namaJurusanBaru })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menyimpan data ke server.");
      }

      alert("Data Jurusan berhasil ditambahkan!");
      modal.classList.add("hidden"); // Sembunyikan modal
      // Setelah berhasil, ambil ulang data dan render tabel
      const tokenForFetch = localStorage.getItem("token") || localStorage.getItem("auth_token");
      await fetchMasterData(tokenForFetch); // Panggil ulang fetchMasterData

    } catch (error) {
      alert("❌ Gagal: " + error.message);
    } finally {
      btnSimpan.textContent = "Simpan Data";
      btnSimpan.disabled = false;
    }
  };
}
// ==========================================================================
// 5. Interaktivitas Dropdown Sort & Filter (Click & Outside Click Handler)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const sortContainers = document.querySelectorAll(".dropdown-sort-container");

  sortContainers.forEach((container) => {
    const sortBtn = container.querySelector(".action-mini-btn-filter");
    const sortMenu = container.querySelector(".dropdown-sort-menu");
    const sortItems = container.querySelectorAll(".dropdown-item");

    if (sortBtn && sortMenu) {
      sortBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        // Tutup menu sort lain jika ada
        document.querySelectorAll(".dropdown-sort-menu").forEach((m) => {
          if (m !== sortMenu) m.style.display = "none";
        });

        const isOpen = sortMenu.style.display === "flex";
        sortMenu.style.display = isOpen ? "none" : "flex";
        sortBtn.classList.toggle("active-btn", !isOpen);
      });

      sortItems.forEach((item) => {
        item.addEventListener("click", () => {
          sortItems.forEach((i) => {
            i.classList.remove("active");
            const check = i.querySelector(".check-icon");
            if (check) check.remove();
          });

          item.classList.add("active");
          item.insertAdjacentHTML(
            "beforeend",
            '<i class="fa-solid fa-check check-icon"></i>',
          );

          currentSort = item.getAttribute("data-sort");
          const label = item.getAttribute("data-label");
          sortBtn.innerHTML = `<i class="fa-solid fa-arrow-down-wide-short"></i> Urutkan: ${label} <i class="fa-solid fa-chevron-down arrow-icon"></i>`;

          renderTable();
          sortMenu.style.display = "none";
          sortBtn.classList.remove("active-btn");
        });
      });
    }
  });

  // --- Logika Dropdown Filter ---
  const setupFilter = (btnId, dropdownId, wrapperId) => {
    const btn = document.getElementById(btnId);
    const dropdown = document.getElementById(dropdownId);
    const wrapper = document.getElementById(wrapperId);

    if (btn && dropdown) {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        // Tutup menu sort
        document.querySelectorAll(".dropdown-sort-menu").forEach(m => m.style.display = "none");
        document.querySelectorAll(".action-mini-btn-filter").forEach(b => b.classList.remove("active-btn"));
        // Tutup dropdown filter lainnya
        document.querySelectorAll(".filter-dropdown").forEach(d => {
          if (d !== dropdown) d.classList.remove("show");
        });

        dropdown.classList.toggle("show");
      });

      // Handler Tombol Terapkan
      const btnApply = dropdown.querySelector(".btn-apply");
      if (btnApply) {
        btnApply.addEventListener("click", () => {
          renderTable();
          dropdown.classList.remove("show");
        });
      }

      // Handler Tombol Reset
      const btnReset = dropdown.querySelector(".btn-reset");
      if (btnReset) {
        btnReset.addEventListener("click", () => {
          dropdown.querySelectorAll("input").forEach(input => {
            if (input.type === "checkbox") input.checked = false;
            if (input.type === "radio" && input.value === "semua") input.checked = true;
          });
          renderTable();
          dropdown.classList.remove("show");
        });
      }
    }
  };

  setupFilter("filterBtnJurusan", "filterDropdownJurusan", "filter-wrapper-jurusan");
  setupFilter("filterBtnProdi", "filterDropdownProdi", "filter-wrapper-prodi");

  // --- Global Click Outside (Satu fungsi untuk menutup semua dropdown) ---
  document.addEventListener("click", (e) => {
    // Tutup semua filter dropdown jika klik di luar wrapper
    document.querySelectorAll(".filter-wrapper").forEach(wrapper => {
      if (!wrapper.contains(e.target)) {
        wrapper.querySelector(".filter-dropdown")?.classList.remove("show");
      }
    });

    // Tutup semua sort dropdown jika klik di luar container
    document.querySelectorAll(".dropdown-sort-container").forEach(container => {
      if (!container.contains(e.target)) {
        container.querySelector(".dropdown-sort-menu").style.display = "none";
        container.querySelector(".action-mini-btn-filter").classList.remove("active-btn");
      }
    });
  });
});

function openEditJurusan(id) {
  alert(`Aksi Manajemen: Edit data Jurusan dengan ID: ${id}`);
}
function openEditProdi(id) {
  alert(`Aksi Manajemen: Edit data Program Studi dengan ID: ${id}`);
}
