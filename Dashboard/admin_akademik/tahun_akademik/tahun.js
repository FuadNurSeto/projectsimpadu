// ==========================================================================
// --- KONFIGURASI UTAMA & BASE URL ---
// ==========================================================================
// DIUBAH: Mengganti http menjadi https untuk menghindari CORS Preflight Redirect
const BASE_URL = "https://admin4e06.vps-poliban.my.id";

document.addEventListener("DOMContentLoaded", () => {
  // Ambil token dari storage
  const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
  
  // Proteksi Halaman: Jika tidak ada token, tendang kembali ke halaman login
  if (!token) {
    alert("Sesi Anda habis atau Anda belum login. Silakan masuk terlebih dahulu.");
    window.location.href = "../../../loginbaru/baru.html";
    return;
  }

  // Jalankan inisialisasi seluruh fitur komponen halaman
  initUserData();
  fetchTahunAkademik(token);
  initModalLogic(token);
  initLogoutLogic();
});

// ==========================================================================
// --- 1. AMBIL PROFILE USER (TOPBAR) ---
// ==========================================================================
function initUserData() {
  const localName = localStorage.getItem("name") || "Admin Akademik";
  const topbarName = document.getElementById("topbar-user-name");
  const topbarAvatar = document.getElementById("topbar-avatar");

  if (topbarName) topbarName.textContent = localName;
  if (topbarAvatar && localName) {
    // Ambil 2 huruf pertama dari nama user untuk avatar instan
    const initials = localName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    topbarAvatar.textContent = initials;
  }
}

// ==========================================================================
// --- 2. TARIK DATA TAHUN AKADEMIK DARI VPS (READ) ---
// ==========================================================================
async function fetchTahunAkademik(token) {
  const tbody = document.getElementById("list-tahun-akademik");
  if (!tbody) return;

  try {
    const response = await fetch(`${BASE_URL}/api/akademik/tahun-akademik`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Gagal mengambil data. Status: ${response.status}`);
    }

    const data = await response.json();
    tbody.innerHTML = ""; // Bersihkan teks loading awal

    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: #94a3b8; padding: 24px;">
            Belum ada data tahun akademik di database.
          </td>
        </tr>`;
      return;
    }

    // Render baris data ke dalam struktur elemen tabel HTML
    data.forEach((item, index) => {
      const tr = document.createElement("tr");

      // Deteksi status untuk menentukan class styling badge
      const statusClass = item.status === "aktif" ? "status-active" : "status-inactive";
      const statusLabel = item.status === "aktif" ? "Aktif" : "Nonaktif";

      // Potong info semester jika data 'tahun_akademik' dari backend sudah mengandung string kata semester
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td style="font-weight: 600; color: #0f172a;">${item.tahun_akademik || item.id}</td>
        <td>${item.semester || (item.tahun_akademik && item.tahun_akademik.toLowerCase().includes("ganjil") ? "Ganjil" : "Genap")}</td>
        <td><span class="badge-status ${statusClass}">${statusLabel}</span></td>
        <td style="text-align: center;">
          <button class="btn-status-toggle" data-id="${item.id}">
            Atur Akses
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error Fetch:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: #ef4444; padding: 24px; font-weight: 500;">
          ❌ Terjadi kesalahan saat memuat data dari VPS Poliban.
        </td>
      </tr>`;
  }
}

// ==========================================================================
// --- 3. LOGIKA INTERAKSI & SUBMIT MODAL (CREATE) ---
// ==========================================================================
function initModalLogic(token) {
  const modal = document.getElementById("modal-tambah-tahun");
  const btnBuka = document.getElementById("btn-buka-modal-tambah");
  const btnCloseX = document.getElementById("btn-close-modal-tambah");
  const btnBatal = document.getElementById("btn-batal-tambah");
  const form = document.getElementById("form-tambah-tahun");

  if (!modal) return;

  // Buka Modal Dialog
  if (btnBuka) btnBuka.addEventListener("click", () => modal.classList.add("show"));

  // Fungsi Tutup Modal Kontrol
  const closeModal = () => {
    modal.classList.remove("show");
    if (form) form.reset();
  };

  if (btnCloseX) btnCloseX.addEventListener("click", closeModal);
  if (btnBatal) btnBatal.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  // Kirim data baru ke backend API Laravel VPS
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const inputTahunVal = document.getElementById("input-tahun").value.trim();
      const selectSemesterVal = document.getElementById("select-semester").value;

      // Membuat ID Unik numerik murni seperti standar rancangan database (contoh: 20261)
      const tahunBersih = inputTahunVal.replace(/[^0-9]/g, "").substring(0, 4);
      const kodeSemester = selectSemesterVal === "Ganjil" ? "1" : "2";
      const generatedId = `${tahunBersih}${kodeSemester}`;

      // Susun JSON payload sesuai dokumentasi nomor #6
      const payload = {
        id: generatedId,
        tahun_akademik: `${inputTahunVal} ${selectSemesterVal.toLowerCase()}`,
        status: "nonaktif" // Standar bawaan saat baru mendaftar
      };

      try {
        const response = await fetch(`${BASE_URL}/api/akademik/tahun-akademik`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          alert("Tahun akademik baru berhasil disimpan ke server VPS Poliban!");
          closeModal();
          fetchTahunAkademik(token); // Segarkan muatan tabel otomatis
        } else {
          const errData = await response.json();
          alert(`Gagal Menyimpan: ${errData.message || response.statusText}`);
        }
      } catch (error) {
        console.error("Submit Error:", error);
        alert("Gagal terhubung ke server VPS. Cek koneksi internet Anda.");
      }
    });
  }
}

// ==========================================================================
// --- 4. LOGIKA MODAL LOGOUT KELUAR AKUN ---
// ==========================================================================
function initLogoutLogic() {
  const logoutTrigger = document.querySelector(".menu-item.logout a");
  const modalOverlay = document.querySelector(".logout-modal-overlay");
  const btnBatal = document.querySelector(".logout-btn-batal");
  const btnKonfirmasi = document.querySelector(".logout-btn-konfirmasi");

  if (!logoutTrigger || !modalOverlay) return;

  logoutTrigger.addEventListener("click", (e) => {
    e.preventDefault();
    modalOverlay.classList.add("show");
  });

  if (btnBatal) {
    btnBatal.addEventListener("click", (e) => {
      e.preventDefault();
      modalOverlay.classList.remove("show");
    });
  }

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove("show");
  });

  if (btnKonfirmasi) {
    btnKonfirmasi.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear(); // Bersihkan seluruh session login
      window.location.href = "../../../loginbaru/baru.html"; // Jalur relatif akurat keluar 3 tingkat
    });
  }
}