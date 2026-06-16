const API_BASE_URL = "https://admin4e06.vps-poliban.my.id/api/akademik";
const token = localStorage.getItem("token");

let allKelasData = [];      // Menyimpan data asli dari API
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

// State global krusial untuk mengunci ID kelas yang sedang diedit (Mencegah 'undefined')
let currentEditKelasId = null;

document.addEventListener("DOMContentLoaded", () => {
  if (!token) {
    window.location.href = "../../../loginbaru/baru.html";
    return;
  }

  // Inject CSS khusus Tooltip Info Kelas agar tampilan pop-up keterangan presisi
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
    .tooltip-popup-card {
      visibility: hidden;
      opacity: 0;
      width: max-content;
      max-width: 280px;
      background-color: #1e2530;
      color: #ffffff;
      border-radius: 8px;
      padding: 14px 18px;
      position: absolute;
      bottom: 150%;
      left: 50%;
      transform: translateX(-50%) translateY(8px);
      z-index: 10000;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
      pointer-events: none;
    }
    .tooltip-popup-card .title {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      margin-bottom: 4px;
      letter-spacing: 0.05em;
    }
    .tooltip-popup-card .description {
      font-size: 14px;
      color: #f8fafc;
      font-weight: 400;
      line-height: 1.4;
      white-space: normal;
    }
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
    .tooltip-wrapper:hover .tooltip-popup-card {
      visibility: visible;
      opacity: 1;
      transform: translateX(-50%) translateY(0);
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
    allKelasData = data.data ? data.data : data;
    filteredKelasData = [...allKelasData];
    renderTable(filteredKelasData);
  } catch (error) {
    console.error("Gagal mengambil data kelas:", error);
    const tbody = document.getElementById("list-kelas");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Gagal memuat data</td></tr>`;
    }
  }
}

// ==========================================
// 2. RENDER TABEL
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
    const kelasId = item.id || item.id_kelas || item.kode_kelas;

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

    const isiKeterangan =
      item.keterangan && item.keterangan.trim() !== ""
        ? item.keterangan
        : "Tidak ada catatan atau keterangan untuk kelas ini.";

    const terisi =
      item.jumlah_mahasiswa !== undefined
        ? item.jumlah_mahasiswa
        : item.mahasiswa_kelas_mks_count || 0;

    tr.innerHTML = `
            <td style="padding: 10px 20px"><strong>${item.kode_kelas}</strong></td>
            <td style="padding: 10px 20px">
                <div class="tooltip-wrapper">
                    <strong>${typeof item.nama_kelas === 'object' ? (item.nama_kelas.nama_kelas || item.nama_kelas.nama || '-') : (item.nama_kelas || item.kelas || '-')}</strong>
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
                    <button class="action-btn-container detail-btn" onclick="viewDetail('${kelasId}')" title="Lihat Detail">
                        <i class="fas fa-user"></i>
                    </button>
                    <button class="action-btn-container edit-btn" onclick="editKelas('${kelasId}')" title="Edit Kelas">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                </div>
            </td>
        `;
    tbody.appendChild(tr);
  });

  renderPaginationKelas(dataToRender.length, itemsPerPage, currentPage, goToPage);
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
  prevBtn.innerHTML = '<i class="fas fa-chevron-left" style="font-size: 12px;"></i>';
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
  nextBtn.innerHTML = '<i class="fas fa-chevron-right" style="font-size: 12px;"></i>';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  });
  paginationContainer.appendChild(nextBtn);
}

// ==========================================
// 3. LOGIKA PENCARIAN & FILTER PANEL (FLOATING)
// ==========================================
function jalankanFilterDanCari() {
  const searchInput = document.getElementById("search-kelas");
  const keyword = searchInput ? searchInput.value.toLowerCase().trim() : "";

  filteredKelasData = allKelasData.filter((item) => {
    const matchKeyword =
      keyword === "" ||
      item.nama_kelas.toLowerCase().includes(keyword) ||
      item.kode_kelas.toLowerCase().includes(keyword);

    const currentProdiId = item.prodi_id || (item.prodi ? item.prodi.id : "");
    const currentTahunId = item.tahun_akademik_id || (item.tahun_akademik ? item.tahun_akademik.id : "");

    const matchProdi = filterProdi === "" || currentProdiId == filterProdi;
    const matchTahun = filterTahun === "" || currentTahunId == filterTahun;
    const matchStatus = filterStatus === "" || item.status == filterStatus;

    return matchKeyword && matchProdi && matchTahun && matchStatus;
  });

  currentPage = 1;
  renderTable(filteredKelasData);
}

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
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
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
          <label style="font-size: 11px; font-weight: 600; color: #475569;">Program Studi</label>
          <select id="filter-prodi" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px;">
            <option value="">Semua Program Studi</option>
            ${prodiList.map((p) => `<option value="${p.id}" ${p.id == filterProdi ? "selected" : ""}>${p.nama_prodi}</option>`).join("")}
          </select>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 11px; font-weight: 600; color: #475569;">Tahun Akademik</label>
          <select id="filter-tahun" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px;">
            <option value="">Semua Tahun</option>
            ${tahunList.map((t) => `<option value="${t.id}" ${t.id == filterTahun ? "selected" : ""}>${t.tahun_akademik}</option>`).join("")}
          </select>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 11px; font-weight: 600; color: #475569;">Status</label>
          <select id="filter-status" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px;">
            <option value="">Semua Status</option>
            <option value="aktif" ${filterStatus === "aktif" ? "selected" : ""}>Aktif</option>
            <option value="non-aktif" ${filterStatus === "non-aktif" ? "selected" : ""}>Non-Aktif</option>
          </select>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 4px;">
          <button id="btn-reset-filter" style="flex: 1; padding: 8px; background: #f1f5f9; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">Reset</button>
          <button id="btn-terapkan-filter" style="flex: 1; padding: 8px; background: #2563eb; border: none; border-radius: 6px; font-size: 12px; color: white; cursor: pointer;">Terapkan</button>
        </div>
      `;

      document.body.appendChild(panelFilter);

      document.getElementById("btn-terapkan-filter").addEventListener("click", () => {
        filterProdi = document.getElementById("filter-prodi").value;
        filterTahun = document.getElementById("filter-tahun").value;
        filterStatus = document.getElementById("filter-status").value;
        jalankanFilterDanCari();
        panelFilter.remove();
      });

      document.getElementById("btn-reset-filter").addEventListener("click", () => {
        filterProdi = ""; filterTahun = ""; filterStatus = "";
        jalankanFilterDanCari();
        panelFilter.remove();
      });
    });
  }

  window.addEventListener("click", (e) => {
    const panelFilter = document.getElementById("floating-filter-panel");
    if (panelFilter && !panelFilter.contains(e.target) && e.target !== btnFilter) {
      panelFilter.remove();
    }
  });

  if (btnBukaModal && modal) {
    btnBukaModal.addEventListener("click", () => {
      modal.classList.add("show");
      fillDropdowns();
    });
  }
  if (btnBatalTambah) {
    btnBatalTambah.addEventListener("click", () => modal.classList.remove("show"));
  }
  if (btnBatalEdit) {
    btnBatalEdit.addEventListener("click", () => {
      document.getElementById("modal-edit-kelas").classList.remove("show");
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
// 4. MEMUAT OPTIONS DROPDOWN
// ==========================================
async function loadFilterOptions() {
  try {
    const [prodiRes, tahunRes] = await Promise.all([
      fetch(`${API_BASE_URL}/prodis`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_BASE_URL}/tahun-akademik`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    const prodis = await prodiRes.json();
    const tahuns = await tahunRes.json();
    prodiList = prodis.data ? prodis.data : prodis;
    tahunList = tahuns.data ? tahuns.data : tahuns;
  } catch (error) {
    console.error("Gagal memuat pilihan dropdown filter:", error);
  }
}

async function fillDropdowns() {
  try {
    const [prodiRes, tahunRes] = await Promise.all([
      fetch(`${API_BASE_URL}/prodis`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_BASE_URL}/tahun-akademik`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    let prodis = await prodiRes.json();
    let tahuns = await tahunRes.json();
    prodis = prodis.data ? prodis.data : prodis;
    tahuns = tahuns.data ? tahuns.data : tahuns;

    const addProdi = document.getElementById("add-prodi");
    const addTahun = document.getElementById("add-tahun");
    if (addProdi) addProdi.innerHTML = prodis.map((p) => `<option value="${p.id}">${p.nama_prodi}</option>`).join("");
    if (addTahun) addTahun.innerHTML = tahuns.map((t) => `<option value="${t.id}">${t.tahun_akademik}</option>`).join("");
  } catch (error) {
    console.error("Gagal memuat dropdown tambah:", error);
  }
}

async function fillEditDropdowns() {
  if (prodiList.length === 0 || tahunList.length === 0) {
    try {
      const [prodiRes, tahunRes] = await Promise.all([
        fetch(`${API_BASE_URL}/prodis`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/tahun-akademik`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      let prodis = await prodiRes.json();
      let tahuns = await tahunRes.json();
      prodiList = prodis.data ? prodis.data : prodis;
      tahunList = tahuns.data ? tahuns.data : tahuns;
    } catch (error) {
      console.error("Gagal memuat pilihan dropdown edit:", error);
    }
  }

  // Multi-Selector Target: Mendeteksi segala variasi nama ID dropdown di HTML Anda
  const targetProdiElements = ["edit-prodi", "prodi_id", "id_prodi", "program_studi"];
  const targetTahunElements = ["edit-tahun", "tahun_akademik_id", "id_tahun_akademik", "tahun_akademik"];

  let editProdi = null;
  for (let id of targetProdiElements) {
    editProdi = document.getElementById(id);
    if (editProdi) break;
  }

  let editTahun = null;
  for (let id of targetTahunElements) {
    editTahun = document.getElementById(id);
    if (editTahun) break;
  }

  if (editProdi) {
    editProdi.innerHTML = `<option value="">-- Pilih Program Studi --</option>` + 
      prodiList.map((p) => `<option value="${p.id}">${p.nama_prodi}</option>`).join("");
  }
  if (editTahun) {
    editTahun.innerHTML = `<option value="">-- Pilih Tahun Akademik --</option>` + 
      tahunList.map((t) => `<option value="${t.id}">${t.tahun_akademik}</option>`).join("");
  }
}

function goToPage(pageNumber) {
  if (pageNumber < 1 || pageNumber > Math.ceil(filteredKelasData.length / itemsPerPage)) return;
  currentPage = pageNumber;
  renderTable(filteredKelasData);
}

// ==========================================
// 5. OPERASI CRUD (TAMBAH DATA KELAS)
// ==========================================
async function handleTambahKelas() {
  const payload = {
    kode_kelas: document.getElementById("add-kode-kelas").value,
    nama_kelas: document.getElementById("add-nama-kelas").value,
    prodi_id: document.getElementById("add-prodi").value,
    tahun_akademik_id: document.getElementById("add-tahun").value,
    kapasitas_mahasiswa: document.getElementById("add-kapasitas").value,
    status: document.getElementById("add-status").value.toLowerCase(), 
    keterangan: document.getElementById("add-keterangan").value,
  };

  const res = await fetch(`${API_BASE_URL}/kelas`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
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

// ==========================================
// 🛠️ SMART-MATCHING ENGINE (SANGAT KRUSIAL)
// Memilih data awal secara cerdas & kebal tipe data / ID HTML
// ==========================================
function setElementValue(possibleIds, value) {
  const idList = Array.isArray(possibleIds) ? possibleIds : [possibleIds];
  let el = null;
  
  for (let id of idList) {
    el = document.getElementById(id);
    if (el) break;
  }
  
  if (!el) return;

  if (value === undefined || value === null) {
    el.value = "";
    return;
  }

  // Jika data bertipe objek, bongkar properti pentingnya secara otomatis
  if (typeof value === "object") {
    value = value.id || value.id_prodi || value.id_tahun_akademik || value.nama_kelas || value.nama || "";
  }

  const stringValue = String(value).trim();
  const lowerValue = stringValue.toLowerCase();

  // Set nilai dasar
  el.value = value;

  // Manajemen khusus elemen Dropdown (SELECT)
  if (el.tagName === "SELECT") {
    let matched = false;

    // Tahap 1: Cocokkan nilai Value secara fleksibel (Aman untuk Integer ID vs String ID)
    for (let option of el.options) {
      if (option.value == stringValue || option.value.toLowerCase().trim() === lowerValue) {
        el.value = option.value;
        matched = true;
        break;
      }
    }

    // Tahap 2: Jika gagal, cocokkan teks label yang terlihat (Fallback jika data API mengembalikan nama string, bukan ID)
    if (!matched) {
      for (let option of el.options) {
        const optionText = option.text.toLowerCase().trim();
        if (optionText === lowerValue || optionText.includes(lowerValue)) {
          el.value = option.value;
          matched = true;
          break;
        }
      }
    }
  }
}

// ==========================================
// 6. OPERASI CRUD (EDIT KELAS - FIX AUTO SELECT DATA AWAL)
// ==========================================
async function editKelas(id) {
  const modalEdit = document.getElementById("modal-edit-kelas");
  if (!modalEdit) return alert("Elemen modal edit tidak ditemukan.");

  if (!id || id === "undefined" || id === "") {
    return alert("Gagal memuat form: ID Kelas rusak / tidak valid.");
  }

  try {
    // ----------------------------------------------------------------
    // TRIK SUPER AMAN: Ambil data dari tabel yang sudah dimuat (allKelasData)
    // Ini mencegah error jika API detail mengembalikan nama key yang hilang/berbeda
    // ----------------------------------------------------------------
    let item = allKelasData.find(
      (k) => String(k.id) === String(id) || 
             String(k.id_kelas) === String(id) || 
             String(k.kode_kelas) === String(id)
    );

    // Jika entah kenapa tidak ketemu di lokal, jadikan fetch API sebagai cadangan
    if (!item) {
      const url = `${API_BASE_URL}/kelas/${id}`;
      const res = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const responseData = await res.json();
      item = responseData.data ? responseData.data : responseData;
      
      // Jaga-jaga jika datanya dibungkus array
      if (Array.isArray(item)) item = item[0];
    }

    if (!item) return alert("Data detail kelas tidak ditemukan.");

    // Kunci ID Asli database ke State Global
    currentEditKelasId = item.id || item.id_kelas || id;

    // Render ulang opsi dropdown (Prodi & Tahun)
    await fillEditDropdowns();

    // ----------------------------------------------------------------
    // PENGISIAN DATA KE FORM (Menggunakan Native Javascript)
    // ----------------------------------------------------------------
    
    // 1. ID Tersembunyi
    const idInput = document.getElementById("edit-id-kelas");
    if (idInput) idInput.value = currentEditKelasId;

    // 2. Header
    const elHeader = document.getElementById("edit-header-kode");
    if (elHeader) elHeader.innerText = item.kode_kelas || item.kode || "-";

    // 3. Kode Kelas (Dijamin terisi karena ambil dari data tabel)
    const kodeInput = document.getElementById("edit-kode-kelas");
    if (kodeInput) kodeInput.value = item.kode_kelas || item.kode || "";

    // 4. Kapasitas (Dijamin terisi karena ambil dari data tabel)
    const kapasitasInput = document.getElementById("edit-kapasitas");
    if (kapasitasInput) {
        kapasitasInput.value = item.kapasitas_mahasiswa || item.kapasitas || item.maksimal_mahasiswa || "";
    }

    // 5. Nama Kelas
    let namaKelasTerpilih = "";
    let rawNama = item.nama_kelas || item.kelas || item.nama;
    if (rawNama) {
      if (typeof rawNama === "object") {
        namaKelasTerpilih = rawNama.nama_kelas || rawNama.nama || "";
      } else {
        namaKelasTerpilih = rawNama;
      }
    }
    const namaInput = document.getElementById("edit-nama-kelas");
    if (namaInput) namaInput.value = namaKelasTerpilih;

    // 6. Status
    const statusInput = document.getElementById("edit-status");
    if (statusInput) statusInput.value = item.status || "aktif";

    // 7. Keterangan
    const ketInput = document.getElementById("edit-keterangan");
    if (ketInput) ketInput.value = item.keterangan || "";

    // 8. Relasi Prodi & Tahun
    const prodiId = item.prodi_id || (item.prodi ? (item.prodi.id || item.prodi.id_prodi) : "") || item.id_prodi;
    const tahunId = item.tahun_akademik_id || (item.tahun_akademik ? (item.tahun_akademik.id || item.tahun_akademik.id_tahun_akademik) : "") || item.id_tahun_akademik;

    const prodiSelect = document.getElementById("edit-prodi");
    if (prodiSelect) prodiSelect.value = prodiId;

    const tahunSelect = document.getElementById("edit-tahun");
    if (tahunSelect) tahunSelect.value = tahunId;

    // Tampilkan Modal
    modalEdit.classList.add("show");

  } catch (err) {
    console.error("Gagal memuat fungsi editKelas:", err);
  }
}

// ==========================================
// 7. OPERASI CRUD (UPDATE/PUT KELAS KE VPS)
// ==========================================
async function handleUpdateKelas() {
  let id = currentEditKelasId;
  if (!id) {
    const elId = document.getElementById("edit-id-kelas") || document.getElementById("id_kelas");
    id = elId ? elId.value : "";
  }
  
  if (!id || id === "undefined" || id === "") {
    alert("Gagal memperbarui data: ID kelas tidak valid.");
    return;
  }
  
  const getValue = (possibleIds) => {
    const idList = Array.isArray(possibleIds) ? possibleIds : [possibleIds];
    for (let id of idList) {
      const el = document.getElementById(id);
      if (el) return el.value;
    }
    return "";
  };

  let rawStatus = getValue(["edit-status", "status", "status_kelas"]);
  let secureStatus = typeof rawStatus === "string" ? rawStatus.toLowerCase().trim() : "aktif";

  const payload = {
    kode_kelas: getValue(["edit-kode-kelas", "kode_kelas"]),
    nama_kelas: getValue(["edit-nama-kelas", "nama_kelas"]),
    prodi_id: parseInt(getValue(["edit-prodi", "prodi_id", "id_prodi"])) || getValue(["edit-prodi", "prodi_id", "id_prodi"]),
    tahun_akademik_id: parseInt(getValue(["edit-tahun", "tahun_akademik_id", "id_tahun_akademik"])) || getValue(["edit-tahun", "tahun_akademik_id", "id_tahun_akademik"]),
    kapasitas_mahasiswa: parseInt(getValue(["edit-kapasitas", "kapasitas_mahasiswa"])) || getValue(["edit-kapasitas", "kapasitas_mahasiswa"]),
    status: secureStatus, 
    keterangan: getValue(["edit-keterangan", "keterangan"]),
  };

  try {
    const res = await fetch(`${API_BASE_URL}/kelas/${id}`, {
      method: "PUT", 
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json", 
      },
      body: JSON.stringify(payload),
    });

    const contentType = res.headers.get("content-type");
    let result = {};
    if (contentType && contentType.includes("application/json")) {
      result = await res.json();
    }

    if (res.ok) {
      alert("Data berhasil diperbarui!");
      document.getElementById("modal-edit-kelas").classList.remove("show");
      fetchKelas();
    } else {
      if (result.errors) {
        const pesanError = Object.entries(result.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join("\n");
        alert(`Gagal memperbarui data (Ditolak Server):\n${pesanError}`);
      } else {
        alert(`Gagal memperbarui data: ${result.message || "Status kode HTTP " + res.status}`);
      }
    }
  } catch (error) {
    console.error("Error Sistem/Koneksi:", error);
    alert("Terjadi kesalahan koneksi internet atau kegagalan internal sistem.");
  }
}

window.viewDetail = function (id) {
  window.location.href = `detail_kelas.html?id=${id}`;
};