// d:\Semester 4\PBL\projectsimpadu\Dashboard\admin_akademik\dosen\dosen.js

// ==========================================================================
// CONFIGURATION API VPS SIMPADU
// ==========================================================================
const API_BASE_URL = "https://admin4e06.vps-poliban.my.id/api/akademik";
const API_TOKEN = localStorage.getItem("token");

const requestHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${API_TOKEN}`,
};

document.addEventListener("DOMContentLoaded", () => {
  // Jalankan pengecekan token terlebih dahulu (Proteksi Halaman)
  if (!API_TOKEN) {
    alert("Sesi Anda habis atau belum login, silakan login kembali.");
    window.location.href = "/loginbaru/baru.html"; // Use absolute path
    return;
  }

  loadDosenPengajarData();
  initFilterDropdowns(); // Initialize custom dropdowns if any
});

// ==========================================================================
// FUNGSI UTAMA UNTUK MENGAMBIL DAN MENAMPILKAN DATA DOSEN PENGAJAR
// ==========================================================================
async function loadDosenPengajarData() {
  const tableBody = document.getElementById("list-dosen");
  if (!tableBody) return;

  // Show loading state
  tableBody.innerHTML = `
    <tr>
      <td colspan="5" style="text-align: center; padding: 40px; color: #64748b">
        <i class="fas fa-spinner fa-spin" style="margin-right: 8px"></i>
        Memuat data dosen pengajar...
      </td>
    </tr>
  `;

  try {
    // Fetch data from API endpoint #49: /api/akademik/dosen/beban-mengajar
    const response = await fetch(`${API_BASE_URL}/dosen/beban-mengajar`, {
      method: "GET",
      headers: requestHeaders,
    });

    if (response.status === 403) {
      // Handle forbidden access (e.g., if role is not Admin Akademik)
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 40px; color: #ef4444;">
            Akses Ditolak: Anda tidak memiliki izin untuk melihat data ini.
          </td>
        </tr>
      `;
      console.warn(
        "Akses Ditolak: Pengguna tidak memiliki izin untuk endpoint /dosen/beban-mengajar.",
      );
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Gagal mengambil data dosen pengajar (Status: ${response.status})`,
      );
    }

    const data = await response.json();
    renderDosenTable(data);
  } catch (error) {
    console.error("Error fetching dosen pengajar data:", error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 40px; color: #ef4444;">
          Gagal memuat data dosen pengajar: ${error.message}
        </td>
      </tr>
    `;
  }
}

// ==========================================================================
// FUNGSI UNTUK MERENDER DATA DOSEN KE DALAM TABEL
// ==========================================================================
function renderDosenTable(dosenData) {
  const tableBody = document.getElementById("list-dosen");
  if (!tableBody) return;

  tableBody.innerHTML = ""; // Clear loading message

  if (dosenData.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 40px; color: #64748b;">
          Tidak ada data dosen pengajar yang ditemukan.
        </td>
      </tr>
    `;
    return;
  }

  dosenData.forEach((item) => {
    const dosen = item.dosen;
    const mataKuliahList = item.mata_kuliah;

    if (!dosen || !mataKuliahList || mataKuliahList.length === 0) {
      // Handle cases where dosen might not have any assigned mata_kuliah
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <div class="dosen-profile-cell">
            <div class="avatar-circle blue-avatar">${getInitials(dosen.name)}</div>
            <div class="dosen-meta">
              <span class="dosen-name">${dosen.name}</span>
              <span class="dosen-nip">NIP. ${dosen.nomor_identitas || "-"}</span>
            </div>
          </div>
        </td>
        <td><span class="mk-name">Tidak ada mata kuliah</span></td>
        <td><span class="kelas-code">-</span></td>
        <td><span class="badge-peserta gray-badge">0 Mahasiswa</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-action view-btn" title="Lihat"><i class="far fa-eye"></i></button>
            <button class="btn-action edit-btn" title="Edit"><i class="fas fa-pencil-alt"></i></button>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
      return;
    }

    mataKuliahList.forEach((mk, index) => {
      const row = document.createElement("tr");
      const isWarningRow = mk.jumlah_mahasiswa === 0; // Example warning condition

      if (isWarningRow) {
        row.classList.add("warning-row");
      }

      row.innerHTML = `
        <td>
          ${
            index === 0
              ? `
            <div class="dosen-profile-cell">
              <div class="avatar-circle ${getAvatarColorClass(dosen.name)}">${getInitials(dosen.name)}</div>
              <div class="dosen-meta">
                <span class="dosen-name">${dosen.name}</span>
                <span class="dosen-nip">NIP. ${dosen.nomor_identitas || "-"}</span>
              </div>
            </div>
          `
              : ""
          }
        </td>
        <td>
          <div class="mk-cell">
            <span class="mk-name">${mk.nama_mk}</span>
            <span class="badge-sks">${mk.sks} SKS</span>
          </div>
        </td>
        <td>
          <div class="kelas-cell">
            <span class="kelas-code">${mk.kelas.kode_kelas} <span class="prodi-slash">/ ${mk.prodi.nama_prodi}</span></span>
            <span class="kelas-tahun">Tahun: ${mk.tahun_akademik.id} (${mk.tahun_akademik.tahun_akademik.includes("ganjil") ? "Ganjil" : "Genap"})</span>
          </div>
        </td>
        <td>
          <span class="badge-peserta ${getPesertaBadgeClass(mk.jumlah_mahasiswa, mk.kelas.kapasitas_mahasiswa)}">
            ${isWarningRow ? '<i class="fas fa-exclamation-circle"></i> ' : ""}
            ${mk.jumlah_mahasiswa} Mahasiswa
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn-action view-btn" title="Lihat"><i class="far fa-eye"></i></button>
            <button class="btn-action edit-btn" title="Edit"><i class="fas fa-pencil-alt"></i></button>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    });
  });
}

// Helper function to get initials for avatar
function getInitials(name) {
  if (!name) return "NA";
  const parts = name.split(" ").filter((n) => n.length > 0);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Helper function to get avatar color class (simple example)
function getAvatarColorClass(name) {
  const colors = [
    "blue-avatar",
    "pink-avatar",
    "green-avatar",
    "purple-avatar",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash % colors.length)];
}

// Helper function to get badge class for peserta
function getPesertaBadgeClass(current, max) {
  if (current === 0) return "red-badge";
  if (current < max / 2) return "orange-badge"; // Example: less than half capacity
  return "green-badge";
}

// ==========================================================================
// FUNGSI UNTUK MENGINISIALISASI DROPDOWN FILTER (jika menggunakan custom HTML)
// ==========================================================================
function initFilterDropdowns() {
  // This function is for custom dropdowns.
  // The current HTML uses native <select> elements, so this might not be needed
  // unless the user intends to switch to custom dropdowns later.
  // For now, we'll leave it as a placeholder or remove if not applicable.

  // Example for a custom dropdown:
  const dropdownWrapper = document.querySelector(".dropdown-wrapper");
  const filterSelectTrigger = dropdownWrapper
    ? dropdownWrapper.querySelector(".filter-select")
    : null;
  const dropdownMenuList = dropdownWrapper
    ? dropdownWrapper.querySelector(".dropdown-menu-list")
    : null;

  if (filterSelectTrigger && dropdownMenuList) {
    filterSelectTrigger.addEventListener("click", () => {
      dropdownMenuList.style.display =
        dropdownMenuList.style.display === "block" ? "none" : "block";
    });

    dropdownMenuList.querySelectorAll("li").forEach((item) => {
      item.addEventListener("click", () => {
        filterSelectTrigger.textContent = item.textContent;
        dropdownMenuList.style.display = "none";
        // Trigger filter logic here
        console.log("Selected filter:", item.textContent);
      });
    });

    document.addEventListener("click", (e) => {
      if (!dropdownWrapper.contains(e.target)) {
        dropdownMenuList.style.display = "none";
      }
    });
  }
}
