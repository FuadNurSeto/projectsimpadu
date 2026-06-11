const API_BASE_URL = "https://admin4e06.vps-poliban.my.id/api/akademik";
const token = localStorage.getItem("token");

let allKelasData = []; // Menyimpan data asli dari API
let filteredKelasData = []; // Menyimpan data setelah pencarian/filter
let currentPage = 1;
const itemsPerPage = 10;

// Menyimpan daftar prodi & tahun dari API untuk dropdown filter dinamis
let prodiList = [];
let tahunList = [];

// State global untuk menyimpan filter yang sedang aktif
let filterProdi = "";
let filterTahun = "";
let filterStatus = "";

document.addEventListener("DOMContentLoaded", () => {
  if (!token) {
    window.location.href = "../../../loginbaru/baru.html";
    return;
  }

  // Inject CSS khusus Tooltip Info Kelas agar tampilan pop-up presisi sesuai gambar
  injectTooltipStyles();

  fetchKelas();
  loadFilterOptions(); // Mengambil data opsi filter dari API di awal
  setupEventListeners();
});

// ==========================================
// 0. INJECT CSS POP-UP KETERANGAN KELAS
// ==========================================
function injectTooltipStyles() {
  const styleId = "custom-tooltip-styles";
  if (document.getElementById(styleId)) return;

  const styleEl = document.createElement("style");
  styleEl.id = styleId;
  styleEl.innerHTML = `
    .tooltip-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    /* Style untuk SVG Ikon Info agar responsif saat di-hover */
    .info-icon-svg {
      width: 18px;
      height: 18px;
      cursor: pointer;
      transition: transform 0.2s ease;
      vertical-align: middle;
    }
    .info-icon-svg:hover {
      transform: scale(1.15);
    }
    /* Kontainer Utama Pop-up Keterangan */
    .tooltip-popup-card {
      visibility: hidden;
      opacity: 0;
      width: max-content;
      max-width: 280px;
      background-color: #1e2530; /* Warna gelap sesuai gambar */
      color: #ffffff;
      border-radius: 8px;
      padding: 14px 18px;
      position: absolute;
      bottom: 150%; /* Default muncul di atas */
      left: 50%;
      transform: translateX(-50%) translateY(8px);
      z-index: 10000;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
      pointer-events: none;
    }
    /* Sub-header Kapital Muted */
    .tooltip-popup-card .title {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      margin-bottom: 4px;
      letter-spacing: 0.05em;
    }
    /* Isi Deskripsi Keterangan */
    .tooltip-popup-card .description {
      font-size: 14px;
      color: #f8fafc;
      font-weight: 400;
      line-height: 1.4;
      white-space: normal;
    }
    /* Segitiga Panah di bawah pop-up */
    .tooltip-popup-card::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-width: 6px;
      border-style: solid;
      border-color: #1e2530 transparent transparent transparent;
    }
    /* Trigger Hover effect */
    .tooltip-wrapper:hover .tooltip-popup-card {
      visibility: visible;
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    /* ==========================================================
       ✨ STACKING CONTEXT FIX
       Memastikan tooltip melayang di atas Search Bar tanpa terpotong
       ========================================================== */

    /* 1. Atur kontainer tabel agar tidak memotong konten yang keluar ke atas */
    /* Target div kedua di dalam card (wadah tabel) */
    .form-section-card > div:nth-child(2) {
      position: relative;
      z-index: 10;
      overflow: visible !important; /* Mencegah clipping agar tooltip bisa keluar batas */
    }

    /* 2. Berikan z-index rendah pada area search bar (div pertama) agar berada di bawah tooltip */
    .form-section-card > div:nth-child(1) {
      position: relative;
      z-index: 1;
    }

    /* 3. Angkat baris yang di-hover ke layer tertinggi */
    #list-kelas tr:hover {
      position: relative;
      z-index: 1000 !important;
    }
  `;
  document.head.appendChild(styleEl);
}

// ==========================================
// 1. AMBIL DATA DARI API
// ==========================================
async function fetchKelas() {
  try {
    const response = await fetch(`${API_BASE_URL}/kelas`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) throw new Error("Gagal mengambil data kelas");

    const data = await response.json();
    allKelasData = data;
    filteredKelasData = [...allKelasData];
    renderTable(filteredKelasData);
  } catch (error) {
    console.error("Gagal mengambil data kelas:", error);
    const tbody = document.getElementById("list-kelas");
    if (tbody)
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Gagal memuat data</td></tr>`;
  }
}

// ==========================================
// 2. RENDER TABEL (DENGAN INLINE SVG BIRU MUDA)
// ==========================================
function renderTable(dataToRender) {
  const tbody = document.getElementById("list-kelas");
  if (!tbody) return;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = dataToRender.slice(startIndex, endIndex);

  tbody.innerHTML = "";

  if (paginatedData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">Data tidak ditemukan</td></tr>`;
    return;
  }

  paginatedData.forEach((item) => {
    const tr = document.createElement("tr");
    const isAktif = item.status === "aktif";
    const statusClass = isAktif ? "status-active" : "status-inactive";
    const statusLabel = isAktif ? "Aktif" : "Non-Aktif";

    let displayTahun = "-";
    if (item.tahun_akademik) {
      const semester = item.tahun_akademik.tahun_akademik
        .toLowerCase()
        .includes("ganjil")
        ? "Ganjil"
        : "Genap";
      displayTahun = `${item.tahun_akademik.id} (${semester})`;
    }

    // Ambil teks keterangan, jika kosong beri teks default fallback
    const isiKeterangan =
      item.keterangan && item.keterangan.trim() !== ""
        ? item.keterangan
        : "Tidak ada catatan atau keterangan untuk kelas ini.";

    // Ambil jumlah mahasiswa terdaftar dari API
    // Prioritas 1: jumlah_mahasiswa (alias dari Controller)
    // Prioritas 2: mahasiswa_kelas_mks_count (default Laravel)
    const terisi = item.jumlah_mahasiswa !== undefined 
                   ? item.jumlah_mahasiswa 
                   : (item.mahasiswa_kelas_mks_count || 0);

    // STRUKTUR DATA: Menggunakan Inline SVG dengan warna biru & isi bg sesuai gambar
    tr.innerHTML = `
            <td style="padding: 10px 20px"><strong>${item.kode_kelas}</strong></td>
            <td style="padding: 10px 20px">
                <div class="tooltip-wrapper">
                    <strong>${item.nama_kelas}</strong>
                    
                    <div style="position: relative; display: inline-flex; align-items: center;">
                        <svg class="info-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
                          <line x1="12" y1="16" x2="12" y2="11" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>
                          <circle cx="12" cy="7.5" r="1.25" fill="#2563eb"/>
                        </svg>

                        <div class="tooltip-popup-card">
                            <div class="title">KETERANGAN KELAS</div>
                            <div class="description">${isiKeterangan}</div>
                        </div>
                    </div>
                </div>
            </td>
            <td style="padding: 10px 20px">${item.prodi ? item.prodi.nama_prodi : "-"}</td>
            <td style="padding: 10px 20px">${displayTahun}</td>
            <td style="padding: 10px 20px">${terisi} / ${item.kapasitas_mahasiswa}</td>
            <td style="padding: 10px 20px"><span class="badge-status ${statusClass}">${statusLabel}</span></td>
            <td style="padding: 10px 20px; text-align: center;">
                <div style="display: flex; justify-content: center; gap: 8px; align-items: center;">
                    <button class="action-btn-container detail-btn" onclick="viewDetail(${item.id})" title="Lihat Detail">
                        <i class="fas fa-user"></i>
                    </button>
                    <button class="action-btn-container edit-btn" onclick="editKelas(${item.id})" title="Edit Kelas">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                </div>
            </td>
        `;
    tbody.appendChild(tr);
  });

  renderPaginationKelas(
    dataToRender.length,
    itemsPerPage,
    currentPage,
    goToPage,
  );
}

function renderPaginationKelas(totalData, limit, currentPage, onPageChange) {
  const totalPages = Math.ceil(totalData / limit);
  const paginationContainer = document.getElementById("pagination-kelas");

  const countSekarang = document.getElementById("count-sekarang");
  const countTotal = document.getElementById("count-total");
  if (countTotal) countTotal.textContent = totalData;
  if (countSekarang) {
    const start = totalData === 0 ? 0 : (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, totalData);
    countSekarang.textContent = `${start}-${end}`;
  }

  if (!paginationContainer) return;
  paginationContainer.innerHTML = "";

  if (totalPages <= 1) return;

  const prevBtn = document.createElement("button");
  prevBtn.className = "pagination-item";
  prevBtn.innerHTML =
    '<i class="fas fa-chevron-left" style="font-size: 12px;"></i>';
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  });
  paginationContainer.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.className = `pagination-item ${i === currentPage ? "active" : ""}`;
    pageBtn.textContent = i;

    if (i !== currentPage) {
      pageBtn.addEventListener("click", () => onPageChange(i));
    }
    paginationContainer.appendChild(pageBtn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.className = "pagination-item";
  nextBtn.innerHTML =
    '<i class="fas fa-chevron-right" style="font-size: 12px;"></i>';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  });
  paginationContainer.appendChild(nextBtn);
}

// ==========================================
// 3. LOGIKA PENCARIAN & FILTER (GABUNGAN)
// ==========================================
function jalankanFilterDanCari() {
  const searchInput = document.getElementById("search-kelas");
  const keyword = searchInput ? searchInput.value.toLowerCase().trim() : "";

  filteredKelasData = allKelasData.filter((item) => {
    const matchKeyword =
      keyword === "" ||
      item.nama_kelas.toLowerCase().includes(keyword) ||
      item.kode_kelas.toLowerCase().includes(keyword);

    const matchProdi = filterProdi === "" || item.prodi_id == filterProdi;
    const matchTahun =
      filterTahun === "" || item.tahun_akademik_id == filterTahun;
    const matchStatus = filterStatus === "" || item.status == filterStatus;

    return matchKeyword && matchProdi && matchTahun && matchStatus;
  });

  currentPage = 1;
  renderTable(filteredKelasData);
}

// ==========================================
// 4. FLOATING POP-UP FILTER
// ==========================================
function setupEventListeners() {
  const searchInput = document.getElementById("search-kelas");
  const btnFilter = document.getElementById("btn-filter-kelas");

  const btnBukaModal = document.getElementById("btn-buka-modal-tambah");
  const btnBatalTambah = document.getElementById("btn-batal-tambah");
  const modal = document.getElementById("modal-tambah-kelas");
  const formTambah = document.getElementById("form-tambah-kelas");
  const btnBatalEdit = document.getElementById("btn-batal-edit");
  const formEdit = document.getElementById("form-edit-kelas");

  if (searchInput) {
    searchInput.addEventListener("input", jalankanFilterDanCari);
  }

  if (btnFilter) {
    btnFilter.addEventListener("click", (e) => {
      e.stopPropagation();

      const panelLama = document.getElementById("floating-filter-panel");
      if (panelLama) {
        panelLama.remove();
        return;
      }

      const panelFilter = document.createElement("div");
      panelFilter.id = "floating-filter-panel";

      panelFilter.style.cssText = `
        position: absolute;
        z-index: 999;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        padding: 16px;
        width: 280px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 8px;
      `;

      const rect = btnFilter.getBoundingClientRect();
      panelFilter.style.top = `${window.scrollY + rect.bottom}px`;
      panelFilter.style.left = `${window.scrollX + rect.left}px`;

      panelFilter.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 11px; font-weight: 600; color: #475569; text-align: left;">Program Studi</label>
          <select id="filter-prodi" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; color: #334155;">
            <option value="">Semua Program Studi</option>
            ${prodiList.map((p) => `<option value="${p.id}" ${p.id == filterProdi ? "selected" : ""}>${p.nama_prodi}</option>`).join("")}
          </select>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 11px; font-weight: 600; color: #475569; text-align: left;">Tahun Akademik</label>
          <select id="filter-tahun" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; color: #334155;">
            <option value="">Semua Tahun</option>
            ${tahunList.map((t) => `<option value="${t.id}" ${t.id == filterTahun ? "selected" : ""}>${t.tahun_akademik}</option>`).join("")}
          </select>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 11px; font-weight: 600; color: #475569; text-align: left;">Status</label>
          <select id="filter-status" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; color: #334155;">
            <option value="">Semua Status</option>
            <option value="aktif" ${filterStatus === "aktif" ? "selected" : ""}>Aktif</option>
            <option value="non-aktif" ${filterStatus === "non-aktif" ? "selected" : ""}>Non-Aktif</option>
          </select>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 4px;">
          <button id="btn-reset-filter" style="flex: 1; padding: 8px; background: #f1f5f9; border: none; border-radius: 6px; font-size: 12px; font-weight: 500; color: #475569; cursor: pointer;">Reset</button>
          <button id="btn-terapkan-filter" style="flex: 1; padding: 8px; background: #2563eb; border: none; border-radius: 6px; font-size: 12px; font-weight: 500; color: #ffffff; cursor: pointer;">Terapkan</button>
        </div>
      `;

      document.body.appendChild(panelFilter);

      document
        .getElementById("btn-terapkan-filter")
        .addEventListener("click", () => {
          filterProdi = document.getElementById("filter-prodi").value;
          filterTahun = document.getElementById("filter-tahun").value;
          filterStatus = document.getElementById("filter-status").value;

          if (filterProdi !== "" || filterTahun !== "" || filterStatus !== "") {
            btnFilter.style.backgroundColor = "#e0e7ff";
            btnFilter.style.borderColor = "#6366f1";
          } else {
            btnFilter.style.backgroundColor = "";
            btnFilter.style.borderColor = "";
          }

          jalankanFilterDanCari();
          panelFilter.remove();
        });

      document
        .getElementById("btn-reset-filter")
        .addEventListener("click", () => {
          filterProdi = "";
          filterTahun = "";
          filterStatus = "";
          btnFilter.style.backgroundColor = "";
          btnFilter.style.borderColor = "";

          jalankanFilterDanCari();
          panelFilter.remove();
        });
    });
  }

  window.addEventListener("click", (e) => {
    const panelFilter = document.getElementById("floating-filter-panel");
    if (
      panelFilter &&
      !panelFilter.contains(e.target) &&
      e.target !== btnFilter &&
      !btnFilter.contains(e.target)
    ) {
      panelFilter.remove();
    }
  });

  if (btnBukaModal && modal) {
    btnBukaModal.addEventListener("click", () => {
      modal.classList.add("show");
      fillDropdowns();
    });
  }
  if (btnBatalTambah && modal) {
    btnBatalTambah.addEventListener("click", () =>
      modal.classList.remove("show"),
    );
  }
  if (btnBatalEdit) {
    btnBatalEdit.addEventListener("click", () => {
      const modalEdit = document.getElementById("modal-edit-kelas");
      if (modalEdit) modalEdit.classList.remove("show");
    });
  }
  if (formTambah) {
    formTambah.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleTambahKelas();
    });
  }
  if (formEdit) {
    formEdit.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleUpdateKelas();
    });
  }
}

// ==========================================
// 5. MEMUAT OPTIONS DROPDOWN
// ==========================================
async function loadFilterOptions() {
  try {
    const [prodiRes, tahunRes] = await Promise.all([
      fetch(`${API_BASE_URL}/prodis`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE_URL}/tahun-akademik`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    prodiList = await prodiRes.json();
    tahunList = await tahunRes.json();
  } catch (error) {
    console.error("Gagal memuat pilihan dropdown filter:", error);
  }
}

async function fillDropdowns() {
  try {
    const [prodiRes, tahunRes] = await Promise.all([
      fetch(`${API_BASE_URL}/prodis`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE_URL}/tahun-akademik`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    const prodis = await prodiRes.json();
    const tahuns = await tahunRes.json();

    const addProdi = document.getElementById("add-prodi");
    const addTahun = document.getElementById("add-tahun");

    if (addProdi)
      addProdi.innerHTML = prodis
        .map((p) => `<option value="${p.id}">${p.nama_prodi}</option>`)
        .join("");
    if (addTahun)
      addTahun.innerHTML = tahuns
        .map((t) => `<option value="${t.id}">${t.tahun_akademik}</option>`)
        .join("");
  } catch (error) {
    console.error("Gagal memuat pilihan dropdown tambah:", error);
  }
}

function goToPage(pageNumber) {
  if (
    pageNumber < 1 ||
    pageNumber > Math.ceil(filteredKelasData.length / itemsPerPage)
  )
    return;
  currentPage = pageNumber;
  renderTable(filteredKelasData);
}

// ==========================================
// 6. OPERASI CRUD (TAMBAH, EDIT, UPDATE KELAS)
// ==========================================
async function handleTambahKelas() {
  const payload = {
    kode_kelas: document.getElementById("add-kode-kelas").value,
    nama_kelas: document.getElementById("add-nama-kelas").value,
    prodi_id: document.getElementById("add-prodi").value,
    tahun_akademik_id: document.getElementById("add-tahun").value,
    kapasitas_mahasiswa: document.getElementById("add-kapasitas").value,
    status: document.getElementById("add-status").value,
    keterangan: document.getElementById("add-keterangan").value,
  };

  const res = await fetch(`${API_BASE_URL}/kelas`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    alert("Berhasil menambahkan kelas baru!");
    document.getElementById("modal-tambah-kelas").classList.remove("show");
    fetchKelas();
  } else {
    alert("Gagal menambahkan kelas.");
  }
}

async function editKelas(id) {
  const modalEdit = document.getElementById("modal-edit-kelas");
  if (!modalEdit) return;

  try {
    const res = await fetch(`${API_BASE_URL}/kelas/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const item = await res.json();

    await fillEditDropdowns();

    document.getElementById("edit-id-kelas").value = item.id;
    document.getElementById("edit-header-kode").innerText = item.kode_kelas;
    document.getElementById("edit-kode-kelas").value = item.kode_kelas;
    document.getElementById("edit-nama-kelas").value = item.nama_kelas;
    document.getElementById("edit-kapasitas").value = item.kapasitas_mahasiswa;
    document.getElementById("edit-status").value = item.status;
    document.getElementById("edit-keterangan").value = item.keterangan || "";
    document.getElementById("edit-prodi").value = item.prodi_id;
    document.getElementById("edit-tahun").value = item.tahun_akademik_id;

    modalEdit.classList.add("show");
  } catch (err) {
    console.error("Gagal mengambil data detail kelas:", err);
  }
}

async function fillEditDropdowns() {
  const [prodiRes, tahunRes] = await Promise.all([
    fetch(`${API_BASE_URL}/prodis`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch(`${API_BASE_URL}/tahun-akademik`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);
  const prodis = await prodiRes.json();
  const tahuns = await tahunRes.json();

  const editProdi = document.getElementById("edit-prodi");
  const editTahun = document.getElementById("edit-tahun");

  if (editProdi)
    editProdi.innerHTML = prodis
      .map((p) => `<option value="${p.id}">${p.nama_prodi}</option>`)
      .join("");
  if (editTahun)
    editTahun.innerHTML = tahuns
      .map((t) => `<option value="${t.id}">${t.tahun_akademik}</option>`)
      .join("");
}

async function handleUpdateKelas() {
  const id = document.getElementById("edit-id-kelas").value;
  const payload = {
    kode_kelas: document.getElementById("edit-kode-kelas").value,
    nama_kelas: document.getElementById("edit-nama-kelas").value,
    prodi_id: document.getElementById("edit-prodi").value,
    tahun_akademik_id: document.getElementById("edit-tahun").value,
    kapasitas_mahasiswa: document.getElementById("edit-kapasitas").value,
    status: document.getElementById("edit-status").value,
    keterangan: document.getElementById("edit-keterangan").value,
  };

  const res = await fetch(`${API_BASE_URL}/kelas/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    alert("Data berhasil diperbarui!");
    document.getElementById("modal-edit-kelas").classList.remove("show");
    fetchKelas();
  } else {
    alert("Gagal memperbarui data.");
  }
}

/**
 * Fungsi untuk berpindah ke halaman detail kelas.
 * Dipanggil dari tombol detail (ikon user) di tabel.
 * @param {number} id - ID Kelas
 */
window.viewDetail = function(id) {
    window.location.href = `detail_kelas.html?id=${id}`;
};
