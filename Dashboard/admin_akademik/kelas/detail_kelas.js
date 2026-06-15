const API_BASE_URL = "https://admin4e06.vps-poliban.my.id/api/akademik";
const token = localStorage.getItem("token");

let allStudents = []; // Menyimpan data asli dari API untuk fitur search lokal
let filteredStudents = []; // Menyimpan data hasil filter/pencarian
let detailKelasData = null;
let currentPage = 1;
const itemsPerPage = 10;

document.addEventListener("DOMContentLoaded", () => {
  // Proteksi Halaman
  if (!token) {
    window.location.href = "../../../loginbaru/baru.html";
    return;
  }

  // Set Nama Admin secara dinamis dari localStorage
  const namaAdminTerdaftar = localStorage.getItem("name") || "Admin Akademik";
  document.getElementById("topbar-admin-name").innerText = namaAdminTerdaftar;
  document.getElementById("topbar-admin-badge").innerText =
    getInitials(namaAdminTerdaftar);

  // Ambil ID dari URL parameter (?id=...)
  const urlParams = new URLSearchParams(window.location.search);
  const kelasId = urlParams.get("id");

  if (!kelasId) {
    alert("ID Kelas tidak ditemukan dalam parameter URL.");
    window.location.href = "index.html";
    return;
  }

  // Jalankan pemuatan data paralel
  loadHalamanDetail(kelasId);

  // Event Listener untuk Fitur Real-time Search
  document.getElementById("search-mahasiswa").addEventListener("input", (e) => {
    const keyword = e.target.value.toLowerCase();
    filteredStudents = allStudents.filter((student) => {
      // Perbaikan: Ambil objek mahasiswa/user secara fleksibel
      const s = student.mahasiswa || student.user || student;
      const nim = (s.nim || s.nomor_identitas || "").toLowerCase();
      const nama = (s.name || s.nama || "").toLowerCase();
      return nim.includes(keyword) || nama.includes(keyword);
    });
    currentPage = 1;
    renderTableMahasiswa();
  });
});

async function loadHalamanDetail(id) {
  await fetchDetailKelas(id);
  await fetchMahasiswaKelas(id);
}

/**
 * 1. Mengambil detail informasi kelas (Endpoint #8)
 */
async function fetchDetailKelas(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/kelas/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) throw new Error("Gagal mengambil detail kelas");

    const result = await res.json();
    // Antisipasi jika API membungkus data dalam properti 'data'
    let tempData = result.data || result;

    // PERBAIKAN: Jika API mengembalikan array (karena penggunaan ->get() di backend), ambil elemen pertama
    if (Array.isArray(tempData)) {
      detailKelasData = tempData[0];
    } else if (tempData && typeof tempData === "object" && tempData.kelas) {
      // Antisipasi jika data dibungkus lagi dalam objek 'kelas'
      detailKelasData = tempData.kelas;
    } else {
      detailKelasData = tempData;
    }

    if (detailKelasData) {
      // Log untuk debugging (bisa dihapus jika sudah jalan)
      console.log("Data Detail Kelas:", detailKelasData);

      // Render Informasi ke Header Card Utama
      const elHeaderNama = document.getElementById("header-nama-kelas");
      // Cek variasi nama properti: nama_kelas, nama, atau kode_kelas
      const namaKelas =
        detailKelasData.nama_kelas ||
        detailKelasData.nama ||
        detailKelasData.kode_kelas ||
        "-";
      if (elHeaderNama) elHeaderNama.innerText = `Kelas ${namaKelas}`;

      const namaProdi = detailKelasData.prodi
        ? detailKelasData.prodi.nama_prodi || detailKelasData.prodi.nama || "-"
        : "-";

      const elHeaderSub = document.getElementById("header-sub-detail");
      if (elHeaderSub) elHeaderSub.innerText = `${namaKelas} • ${namaProdi}`;

      // Cek apakah tahun_akademik berupa objek (relasi) atau string langsung
      let tahunText = "-";
      if (detailKelasData.tahun_akademik) {
        tahunText =
          typeof detailKelasData.tahun_akademik === "object"
            ? detailKelasData.tahun_akademik.tahun_akademik ||
              detailKelasData.tahun_akademik.nama_tahun ||
              detailKelasData.tahun_akademik.tahun ||
              "-"
            : detailKelasData.tahun_akademik;
      }

      const elWidgetTahun = document.getElementById("widget-tahun");
      if (elWidgetTahun) elWidgetTahun.innerText = tahunText;
    } else {
      console.warn("Detail kelas data is empty or malformed.");
      document.getElementById("header-nama-kelas").innerText = "Kelas -";
      document.getElementById("header-sub-detail").innerText = "- • -";
      document.getElementById("widget-tahun").innerText = "-";
    }
  } catch (error) {
    console.error("Error detail kelas:", error);
  }
}

/**
 * 2. Mengambil daftar mahasiswa di kelas (Endpoint #9)
 */
async function fetchMahasiswaKelas(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/kelas/${id}/mahasiswa`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) throw new Error("Gagal mengambil daftar mahasiswa");

    const rawData = await res.json();

    // Saring data agar mahasiswa tidak duplikat (terdouble) di tabel.
    // Hal ini dikarenakan satu mahasiswa terdaftar di banyak mata kuliah dalam satu kelas.
    const uniqueMap = new Map();
    rawData.forEach((item) => {
      const s = item.mahasiswa || item.user || item;
      const nim = s.nomor_identitas || s.nim || item.nim;
      if (nim && !uniqueMap.has(nim)) {
        uniqueMap.set(nim, item);
      }
    });
    allStudents = Array.from(uniqueMap.values());

    // Update kapasitas widget (Jumlah terdaftar / Maksimal kapasitas)
    // Perbaikan: Gunakan kapasitas_mahasiswa sesuai dengan database/API
    const maxKapasitas = detailKelasData?.kapasitas_mahasiswa || 40;
    document.getElementById("widget-kapasitas").innerText =
      `${allStudents.length} / ${maxKapasitas} Mhs`;

    filteredStudents = [...allStudents];

    // Render data ke dalam tabel
    renderTableMahasiswa();
  } catch (error) {
    console.error("Error mahasiswa:", error);
    document.getElementById("list-mahasiswa").innerHTML = `
            <tr><td colspan="6" style="text-align:center; color:#ef4444; padding:40px;">Gagal memuat daftar mahasiswa kelas.</td></tr>
        `;
  }
}

/**
 * 3. Render Data Array ke DOM Tabel (Sesuai Desain Gambar)
 */
function renderTableMahasiswa() {
  const tbody = document.getElementById("list-mahasiswa");
  tbody.innerHTML = "";

  if (!filteredStudents || filteredStudents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 40px; color:#64748b;">Tidak ada data mahasiswa yang cocok.</td></tr>`;
    document.getElementById("pagination-info").innerText =
      "Menampilkan 0 dari total 0 mahasiswa terdaftar";
    renderPagination();
    return;
  }

  // Hitung index data yang akan ditampilkan
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredStudents.slice(startIndex, endIndex);

  paginatedItems.forEach((item) => {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid #f1f5f9";

    // Ambil Nilai dari Data Relasional Objek
    // Perbaikan: Cek properti 'mahasiswa' atau 'user' agar data tidak kosong
    const studentObj = item.mahasiswa || item.user || item;
    const nimValue =
      studentObj.nomor_identitas || studentObj.nim || item.nim || "-";
    const namaFull = studentObj.name || studentObj.nama || "-";
    const emailValue =
      studentObj.email ||
      (nimValue !== "-"
        ? `${nimValue.toLowerCase()}@mahasiswa.simpadu.ac.id`
        : "-");

    const prodiValue =
      detailKelasData && detailKelasData.prodi
        ? detailKelasData.prodi.nama_prodi
        : "D3 Teknik Informatika";

    // Tentukan Badge Status (Aktif / Non-Aktif)
    const isAktif =
      item.status === undefined || item.status === 1 || item.status === "Aktif";
    const statusBadge = isAktif
      ? `<span style="background-color: #e6f4ea; color: #137333; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 600;">Aktif</span>`
      : `<span style="background-color: #f1f5f9; color: #475569; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 600;">Non-Aktif</span>`;

    // Generate Monogram Avatar (Inisial Dua Huruf Depan)
    const inisial = getInitials(namaFull);

    tr.innerHTML = `
            <td style="padding: 14px 16px; color: #1e293b; font-weight: 500;">${nimValue}</td>
            <td style="padding: 14px 16px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="background-color: #e0eafd; color: #1e5bb9; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; text-transform: uppercase;">
                        ${inisial}
                    </div>
                    <span style="font-weight: 600; color: #1e293b;">${namaFull}</span>
                </div>
            </td>
            <td style="padding: 14px 16px; color: #64748b;">${emailValue}</td>
            <td style="padding: 14px 16px; color: #1e293b;">${prodiValue}</td>
            <td style="padding: 14px 16px;">${statusBadge}</td>
            <td style="padding: 14px 16px; text-align: center;">
                <button onclick="kickMahasiswa('${item.id}', '${namaFull}', '${nimValue}')" style="background: #fff5f5; border: none; width: 32px; height: 32px; border-radius: 8px; color: #ef4444; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s;" title="Keluarkan Mahasiswa">
                    <i class="fas fa-user-minus" style="font-size: 14px;"></i>
                </button>
            </td>
        `;
    tbody.appendChild(tr);
  });

  // Update Teks Informasi Pagination di Kiri Bawah
  const showingCount = Math.min(endIndex, filteredStudents.length);
  document.getElementById("pagination-info").innerText =
    `Menampilkan ${startIndex + 1}-${showingCount} dari total ${filteredStudents.length} mahasiswa`;

  renderPagination();
}

/**
 * Helper untuk mengambil huruf inisial nama depan & belakang (Contoh: Muhammad Dzaka -> MD)
 */
function getInitials(name) {
  if (!name || name === "-") return "AA";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Render komponen pagination secara dinamis
 */
function renderPagination() {
  const container = document.getElementById("pagination-controls");
  if (!container) return;
  container.innerHTML = "";

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  if (totalPages <= 1) return;

  // Tombol Previous
  const prevBtn = document.createElement("button");
  prevBtn.className = "pagination-item";
  prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => changePage(currentPage - 1);
  container.appendChild(prevBtn);

  // Tombol Angka Halaman
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.className = `pagination-item ${i === currentPage ? "active" : ""}`;
    pageBtn.innerText = i;
    pageBtn.onclick = () => changePage(i);
    container.appendChild(pageBtn);
  }

  // Tombol Next
  const nextBtn = document.createElement("button");
  nextBtn.className = "pagination-item";
  nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => changePage(currentPage + 1);
  container.appendChild(nextBtn);
}

/**
 * Fungsi untuk berpindah halaman
 */
function changePage(page) {
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderTableMahasiswa();
}

let studentIdToDelete = null; // Menyimpan ID sementara mahasiswa yang mau dihapus (ID Plotting)

/**
 * 🔥 FUNGSI UNTUK MEMBUKA MODAL KUSTOM HAPUS MAHASISWA
 */
window.kickMahasiswa = function (id, nama, nim) {
  studentIdToDelete = id; // Simpan ID plotting mahasiswa yang ditargetkan

  // Ambil nama kelas dari data objek utama kelas yang sedang aktif
  const namaKelasSekarang = detailKelasData?.nama_kelas
    ? `Kelas ${detailKelasData.nama_kelas}`
    : "Kelas";

  // Inject teks dinamis ke dalam modal sesuai gambar mockup
  const infoEl = document.getElementById("kick-modal-student-info");
  const classEl = document.getElementById("kick-modal-class-info");

  if (infoEl) infoEl.innerText = `${nama} (${nim})`;
  if (classEl) classEl.innerText = namaKelasSekarang;

  // Tampilkan Modal
  const modal = document.getElementById("kick-modal");
  if (modal) modal.classList.add("show");
};

/**
 * EVENT LISTENER UNTUK TOMBOL DI DALAM MODAL
 */
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("kick-modal");
  if (!modal) return;

  const btnBatal = document.getElementById("btn-batal-kick");
  const btnKonfirmasi = document.getElementById("btn-konfirmasi-kick");

  // Aksi 1: Tutup modal saat tombol Batal ditekan
  btnBatal?.addEventListener("click", () => {
    modal.classList.remove("show");
    studentIdToDelete = null;
  });

  // Aksi 2: Jalankan eksekusi hapus saat tombol "Ya, Hapus Data" ditekan
  btnKonfirmasi?.addEventListener("click", async () => {
    if (!studentIdToDelete) return;

    btnKonfirmasi.innerText = "Menghapus...";
    btnKonfirmasi.disabled = true;

    try {
      // Sesuai Dokumentasi #29: DELETE /api/akademik/mahasiswa-kelas/{id}
      const res = await fetch(
        `${API_BASE_URL}/mahasiswa-kelas/${studentIdToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (!res.ok) throw new Error("Gagal mengeluarkan mahasiswa");

      alert("Mahasiswa berhasil dikeluarkan dari kelas!");
      modal.classList.remove("show");

      // Refresh data tabel
      const urlParams = new URLSearchParams(window.location.search);
      fetchMahasiswaKelas(urlParams.get("id"));
    } catch (error) {
      console.error("Error eksekusi hapus:", error);
      alert("Terjadi kesalahan saat mencoba menghapus mahasiswa.");
    } finally {
      btnKonfirmasi.innerText = "Ya, Hapus Data";
      btnKonfirmasi.disabled = false;
      studentIdToDelete = null;
    }
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("show");
      studentIdToDelete = null;
    }
  });
});
