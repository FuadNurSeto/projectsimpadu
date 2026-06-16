document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "https://hurdle-tinkling-crazy.ngrok-free.dev/api/akademik";
  const token = localStorage.getItem("token");

  // Redirect jika belum login
  if (!token) {
    window.location.href = "/loginbaru/baru.html";
    return;
  }

  function getAuthHeaders() {
    return {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    };
  }

  const tableBody = document.getElementById("mata-kuliah-table-body");
  const searchInput = document.getElementById("search-mk");
  const filterTahun = document.getElementById("filter-tahun");
  const filterProdi = document.getElementById("filter-prodi");
  const filterSemester = document.getElementById("filter-semester");
  const prodiListContainer = document.getElementById("prodi-list-container");

  // --- 1. INISIALISASI DROPDOWN CUSTOM ---
  function initCustomDropdowns() {
    document.querySelectorAll(".custom-dropdown").forEach((dropdown) => {
      const trigger = dropdown.querySelector(".dropdown-trigger");
      const menu = dropdown.querySelector(".dropdown-menu-list");
      const hiddenInput = dropdown.querySelector("input[type='hidden']");
      const selectedSpan = dropdown.querySelector("span[id^='selected-']");

      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("show");
      });

      dropdown.addEventListener("click", (e) => {
        const li = e.target.closest("li");
        if (li) {
          const val = li.getAttribute("data-value");
          const text = li.textContent.trim();

          hiddenInput.value = val;
          selectedSpan.textContent = text;

          dropdown
            .querySelectorAll("li")
            .forEach((item) => item.classList.remove("active"));
          li.classList.add("active");

          dropdown.classList.remove("show");
          fetchMataKuliah(); // Refresh data saat filter berubah
        }
      });
    });

    document.addEventListener("click", () => {
      document
        .querySelectorAll(".custom-dropdown")
        .forEach((d) => d.classList.remove("show"));
    });
  }

  // --- 2. AMBIL DATA PROGRAM STUDI ---
  async function fetchProdis() {
    try {
      const response = await fetch(`${API_BASE_URL}/prodis`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const data = await response.json();

      prodiListContainer.innerHTML = `<li class="active" data-value="">Semua Program Studi</li>`;
      data.forEach((prodi) => {
        const li = document.createElement("li");
        li.setAttribute("data-value", prodi.id);
        li.textContent = prodi.nama_prodi;
        prodiListContainer.appendChild(li);
      });
    } catch (error) {
      console.error("Gagal memuat prodi:", error);
    }
  }

  // --- 3. AMBIL DATA MATA KULIAH ---
  async function fetchMataKuliah(searchKeyword = "") {
    const tableBody = document.getElementById("mata-kuliah-table-body");
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Memuat data...</td></tr>`;

    try {
      let url = `${API_BASE_URL}/mata-kuliah`;

      if (searchKeyword) {
        url += `?search=${encodeURIComponent(searchKeyword)}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      // JIKA SERVER MENOLAK (Status 400, 401, 403, 500, dll)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const serverMessage = errorData.message || `HTTP Status: ${response.status}`;
        throw new Error(serverMessage);
      }

      const data = await response.json();
      tableBody.innerHTML = "";

      if (!data || data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Data mata kuliah tidak ditemukan.</td></tr>`;
        return;
      }

      // Memasukkan data ke tabel jika sukses
      data.forEach((mk, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${index + 1}</td>
        <td><strong>${mk.nama_mk}</strong></td>
        <td>Semester ${mk.semester}</td>
        <td>${mk.sks} SKS</td>
        <td>
          <span class="badge ${mk.status === "aktif" ? "badge-success" : "badge-danger"}">
            ${mk.status}
          </span>
        </td>
        <td>
          <button class="btn-edit" onclick="openEditModal(${mk.id_mk}, '${mk.nama_mk}', ${mk.semester}, ${mk.sks}, '${mk.status}', ${mk.prodi_id})">
            <i class="fas fa-edit"></i> Edit
          </button>
        </td>
      `;
        tableBody.appendChild(row);
      });
    } catch (error) {
      console.error("Detail Error:", error);
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#ef4444; font-weight:600;">Terjadi Kesalahan Server: "${error.message}"</td></tr>`;
    }
  }

  // --- 4. AMBIL DATA PROFIL ADMIN ---
  async function fetchAdminProfile() {
    const adminNameEl = document.getElementById("admin-name");
    const adminAvatarEl = document.getElementById("admin-avatar");

    try {
      // Menggunakan rute global auth user backend Anda
      const response = await fetch("https://hurdle-tinkling-crazy.ngrok-free.dev/api/user", {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data user");
      }

      const adminData = await response.json();
      const namaAdmin = adminData.name || adminData.nama || "Admin";

      // 1. Suntik nama ke elemen header HTML
      if (adminNameEl) {
        adminNameEl.textContent = namaAdmin;
      }

      // 2. Olah inisial nama otomatis untuk avatar lingkar biru
      if (adminAvatarEl) {
        const inisial = namaAdmin
          .split(" ")
          .filter(kata => kata.length > 0)
          .map((kata) => kata[0])
          .join("")
          .toUpperCase()
          .substring(0, 2);
        
        adminAvatarEl.textContent = inisial;
      }

    } catch (error) {
      console.error("Gagal memuat profil admin:", error);
      if (adminNameEl) adminNameEl.textContent = "Admin Academic";
      if (adminAvatarEl) adminAvatarEl.textContent = "AA";
    }
  }

  // --- 5. EVENT LISTENERS ---
  let searchTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => fetchMataKuliah(searchInput.value), 500); // Debounce 500ms
  });

  // --- FUNGSI GLOBAL UNTUK TOMBOL AKSI ---
  window.handleDetail = (id) => {
    console.log("Detail MK ID:", id);
  };

  window.handleEdit = (id) => {
    console.log("Edit MK ID:", id);
  };

  document.getElementById("btnTambahMK").addEventListener("click", () => {
    console.log("Tambah Mata Kuliah Baru");
  });

  // --- FUNGSI LOGOUT ---
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "/loginbaru/baru.html";
    });
  }

  // Inisialisasi awal saat halaman siap dimuat
  initCustomDropdowns();
  fetchAdminProfile(); // <-- Memanggil profil dinamis dari API
  fetchProdis();
  fetchMataKuliah();
});