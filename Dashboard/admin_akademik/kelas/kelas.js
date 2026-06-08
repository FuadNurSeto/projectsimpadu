const API_BASE_URL = "https://admin4e06.vps-poliban.my.id/api/akademik";
const token = localStorage.getItem("token");

let allKelasData = []; // Stores all data from API
let filteredKelasData = []; // Stores data after search/filter
let currentPage = 1;
const itemsPerPage = 10;

document.addEventListener("DOMContentLoaded", () => {
  if (!token) {
    window.location.href = "../../../loginbaru/baru.html";
    return;
  }

  fetchKelas();
  setupEventListeners();
});

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
    filteredKelasData = [...allKelasData]; // Initialize filtered data
    renderTable(filteredKelasData);
  } catch (error) {
    console.error("Gagal mengambil data kelas:", error);
    const tbody = document.getElementById("list-kelas");
    if (tbody)
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Gagal memuat data</td></tr>`;
    const paginationContainer = document.getElementById("pagination-kelas");
    if (paginationContainer) paginationContainer.innerHTML = ""; // Clear pagination on error
  }
}

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

    // Format Tahun Akademik: "2026 ganjil" -> "20261 (Ganjil)"
    let displayTahun = "-";
    if (item.tahun_akademik) {
      const semester = item.tahun_akademik.tahun_akademik
        .toLowerCase()
        .includes("ganjil")
        ? "Ganjil"
        : "Genap";
      displayTahun = `${item.tahun_akademik.id} (${semester})`;
    }

    tr.innerHTML = `
            <td style="padding: 10px 20px"><strong>${item.kode_kelas}</strong></td>
            <td style="padding: 10px 20px"><strong>${item.nama_kelas}</strong></td>
            <td style="padding: 10px 20px">${item.prodi ? item.prodi.nama_prodi : "-"}</td>
            <td style="padding: 10px 20px">${displayTahun}</td>
            <td style="padding: 10px 20px">${item.terisi || 0} / ${item.kapasitas_mahasiswa}</td>
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

  // Urutan: totalData, limit, currentPage, callback
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

  // 1. Update teks keterangan di atasnya (Menampilkan 1-10 dari total 14 data kelas)
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

  // Jika data tidak ada atau hanya 1 halaman, tidak perlu tombol navigasi
  if (totalPages <= 1) return;

  // 2. Tombol Panah Kiri (<)
  const prevBtn = document.createElement("button");
  prevBtn.className = "pagination-item";
  prevBtn.innerHTML =
    '<i class="fas fa-chevron-left" style="font-size: 12px;"></i>';
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  });
  paginationContainer.appendChild(prevBtn);

  // 3. Tombol Angka Halaman (1, 2, 3, dst)
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    // Jika halaman ini sedang aktif, tambahkan class 'active'
    pageBtn.className = `pagination-item ${i === currentPage ? "active" : ""}`;
    pageBtn.textContent = i;

    if (i !== currentPage) {
      pageBtn.addEventListener("click", () => onPageChange(i));
    }
    paginationContainer.appendChild(pageBtn);
  }

  // 4. Tombol Panah Kanan (>)
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

function setupEventListeners() {
  const searchInput = document.getElementById("search-kelas");
  const btnBukaModal = document.getElementById("btn-buka-modal-tambah");
  const btnBatal = document.getElementById("btn-batal-tambah");
  const modal = document.getElementById("modal-tambah-kelas");
  const formTambah = document.getElementById("form-tambah-kelas");

  // Filter Pencarian
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const keyword = e.target.value.toLowerCase();
      filteredKelasData = allKelasData.filter(
        (k) =>
          k.nama_kelas.toLowerCase().includes(keyword) ||
          k.kode_kelas.toLowerCase().includes(keyword),
      );
      currentPage = 1; // Reset to first page on search
      renderTable(filteredKelasData);
    });
  }

  // Modal Toggle
  if (btnBukaModal) {
    btnBukaModal.addEventListener("click", () => {
      modal.classList.remove("hidden");
      fillDropdowns();
    });
  }

  if (btnBatal) {
    btnBatal.addEventListener("click", () => modal.classList.add("hidden"));
  }

  // Submit Form
  if (formTambah) {
    formTambah.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleTambahKelas();
    });
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

    document.getElementById("add-prodi").innerHTML = prodis
      .map((p) => `<option value="${p.id}">${p.nama_prodi}</option>`)
      .join("");
    document.getElementById("add-tahun").innerHTML = tahuns
      .map((t) => `<option value="${t.id}">${t.tahun_akademik}</option>`)
      .join("");
  } catch (error) {
    console.error("Gagal memuat pilihan dropdown:", error);
  }
}

function goToPage(pageNumber) {
  if (
    pageNumber < 1 ||
    pageNumber > Math.ceil(filteredKelasData.length / itemsPerPage)
  ) {
    return;
  }
  currentPage = pageNumber;
  renderTable(filteredKelasData);
}

async function handleTambahKelas() {
  const payload = {
    kode_kelas: document.getElementById("add-kode-kelas").value,
    nama_kelas: document.getElementById("add-nama-kelas").value,
    prodi_id: document.getElementById("add-prodi").value,
    tahun_akademik_id: document.getElementById("add-tahun").value,
    kapasitas_mahasiswa: document.getElementById("add-kapasitas").value,
    status: "aktif",
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
    document.getElementById("modal-tambah-kelas").classList.add("hidden");
    fetchKelas();
  } else {
    alert("Gagal menambahkan kelas. Periksa kembali inputan Anda.");
  }
}
