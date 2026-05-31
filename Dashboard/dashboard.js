// ==========================================
// VARIABLE GLOBAL (Untuk Filter Tahun Tanpa Reload API)
// ==========================================
let globalUsersList = [];

// Map role_id ke nama role (Global agar bisa diakses form submit dan render)
const roleMap = {
  2: "Admin Akademik",
  3: "Admin Pegawai",
  4: "Admin Mahasiswa",
  5: "Admin Keuangan",
};

// ==========================================
// FUNGSI GLOBAL: MEMBUKA MODAL EDIT PEGAWAI
// ==========================================
function openEditModal(userId) {
  const userRow = globalUsersList.find((u) => u.id == userId);
  if (!userRow) {
    console.error("Gagal: Data user tidak ditemukan di globalUsersList!");
    return;
  }

  // Isi field input modal edit
  if (document.getElementById("edit-user-id"))
    document.getElementById("edit-user-id").value = userRow.id;
  if (document.getElementById("edit-nip"))
    document.getElementById("edit-nip").value = userRow.nomor_identitas || "-";
  if (document.getElementById("edit-nama"))
    document.getElementById("edit-nama").value = userRow.name || "";
  if (document.getElementById("edit-username"))
    document.getElementById("edit-username").value = userRow.username || "";
  if (document.getElementById("edit-email"))
    document.getElementById("edit-email").value = userRow.email || "";
  if (document.getElementById("edit-role"))
    document.getElementById("edit-role").value = userRow.role_id; // Langsung gunakan role_id numerik
  if (document.getElementById("edit-status"))
    document.getElementById("edit-status").value =
      userRow.status === "non-aktif" || userRow.status === "nonaktif"
        ? "Non-Aktif"
        : "Aktif";

  const modalEdit = document.getElementById("modal-edit-pegawai");
  if (modalEdit) modalEdit.classList.add("show");
}

// ==========================================
// FUNGSI GLOBAL: MODAL TOGGLE STATUS (DIPANGGIL OLEH INLINE ONCLICK)
// ==========================================
function showToggleModal(userId, userName, newStatus) {
  if (newStatus === "nonaktif") {
    const textNama = document.getElementById("text-nama-nonaktif");
    const formNonaktif = document.getElementById("form-nonaktifkan");

    if (textNama) textNama.innerText = userName;
    if (formNonaktif) formNonaktif.setAttribute("data-user-id", userId);

    const modalEl = document.getElementById("modalNonAktifkan");
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  } else {
    const textNama = document.getElementById("text-nama-aktif");
    const formAktif = document.getElementById("form-aktifkan");

    if (textNama) textNama.innerText = userName;
    if (formAktif) formAktif.setAttribute("data-user-id", userId);

    const modalEl = document.getElementById("modalAktifkan");
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }
}

// ==========================================
// SATU INDUK INITIALIZATION (DOM CONTENT LOADED)
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  // ------------------------------------------
  // 1. PROTEKSI BANNER PROFILE
  // ------------------------------------------
  function lockSuperAdminBanner() {
    const userInfoSection = document.querySelector(".user-profile .user-info");
    if (!userInfoSection) return;

    const existingBadge = userInfoSection.querySelector(".badge-super-admin");
    if (existingBadge) {
      existingBadge.remove();
    }

    const roleText = userInfoSection.querySelector("p");
    if (roleText) {
      roleText.innerText = "Super Admin";
      roleText.style.color = "#64748b";
      roleText.style.fontWeight = "500";
      roleText.style.background = "none";
      roleText.style.border = "none";
      roleText.style.padding = "0";
      roleText.style.marginTop = "0";
    }
  }
  lockSuperAdminBanner();

  // ------------------------------------------
  // 2. INTERAKSI LAYOUT & UI (Sidebar, Dropdown, Logout)
  // ------------------------------------------
  const toggleBtn = document.querySelector(".toggle-sidebar");
  const sidebar = document.querySelector(".sidebar");

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", function () {
      sidebar.classList.toggle("collapsed");
    });
  }

  const userProfile = document.querySelector(".user-profile");
  const profileDropdown = document.getElementById("profileDropdown");
  const logoutBtn = document.getElementById("logoutBtn");

  if (userProfile && profileDropdown) {
    userProfile.addEventListener("click", function (e) {
      e.stopPropagation();
      profileDropdown.classList.toggle("show");
      this.classList.toggle("active");
    });

    document.addEventListener("click", function (e) {
      if (
        !userProfile.contains(e.target) &&
        !profileDropdown.contains(e.target)
      ) {
        profileDropdown.classList.remove("show");
        userProfile.classList.remove("active");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.clear();
      window.location.href = "../loginbaru/baru.html";
    });
  }

  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      navItems.forEach((nav) => nav.classList.remove("active"));
      this.classList.add("active");
    });
  });

  const yearSelect = document.querySelector(".year-select");
  if (yearSelect) {
    yearSelect.addEventListener("change", function (e) {
      filterDanUpdateGrafik(e.target.value);
    });
  }

  const searchInput = document.querySelector(".search-input");
  if (searchInput) {
    searchInput.addEventListener("keyup", function (e) {
      if (e.key === "Enter") {
        console.log("Mencari: " + this.value);
      }
    });
  }

  // ------------------------------------------
  // 3. HANDLER CUSTOM OVERLAY (Modal Tambah & Edit Pegawai)
  // ------------------------------------------

  // Modal Tambah Pegawai
  const btnTambahPegawai = document.getElementById("btn-tambah-pegawai");
  const modalTambah = document.getElementById("modal-tambah-pegawai");
  const btnCloseTambah = document.getElementById("btn-close-modal");
  const btnBatalTambah = document.getElementById("btn-batal-modal");

  // Modal Edit Pegawai
  const modalEdit = document.getElementById("modal-edit-pegawai");
  const btnCloseEdit = document.getElementById("btn-close-edit-modal");
  const btnBatalEdit = document.getElementById("btn-batal-edit-modal");

  // Event Handler Modal Tambah
  if (btnTambahPegawai) {
    btnTambahPegawai.addEventListener("click", () =>
      modalTambah.classList.add("show"),
    );
  }
  [btnCloseTambah, btnBatalTambah].forEach((btn) => {
    if (btn)
      btn.addEventListener("click", () => modalTambah.classList.remove("show"));
  });

  // Event Handler Modal Edit
  [btnCloseEdit, btnBatalEdit].forEach((btn) => {
    if (btn)
      btn.addEventListener("click", () => modalEdit.classList.remove("show"));
  });

  // Logika Fitur Show / Hide Password (Mata diklik)
  document.querySelectorAll(".toggle-password").forEach((icon) => {
    icon.addEventListener("click", function () {
      // Ensure the inputPassword is the direct previous sibling
      const inputPassword = this.previousElementSibling;
      if (inputPassword && inputPassword.type === "password") {
        inputPassword.type = "text";
        this.classList.remove("fa-eye-slash");
        this.classList.add("fa-eye");
      } else if (inputPassword) {
        inputPassword.type = "password";
        this.classList.remove("fa-eye");
        this.classList.add("fa-eye-slash");
      }
    });
  });

  // Close modal when clicking outside the modal-container
  [modalTambah, modalEdit].forEach((modalOverlay) => {
    if (modalOverlay) {
      modalOverlay.addEventListener("click", function (e) {
        // Check if the click occurred directly on the overlay, not its children
        if (e.target === modalOverlay) {
          modalOverlay.classList.remove("show");
        }
      });
    }
  });

  // ------------------------------------------
  // HANDLER FORM TAMBAH PEGAWAI (POST - CREATE)
  // ------------------------------------------
  const formTambahPegawai = document.getElementById("form-tambah-pegawai");
  if (formTambahPegawai) {
    formTambahPegawai.addEventListener("submit", function (e) {
      e.preventDefault();

      const token = localStorage.getItem("token");
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      const payload = {
        nomor_identitas: document.getElementById("tambah-nip").value,
        name: document.getElementById("tambah-nama").value,
        username: document.getElementById("tambah-username").value,
        email: document.getElementById("tambah-email").value,
        status:
          document.getElementById("tambah-status").value === "Aktif"
            ? "aktif"
            : "nonaktif",
        role_id: parseInt(document.getElementById("tambah-role").value),
        password: document.getElementById("tambah-password").value,
      };

      const confirmPassword = document.getElementById(
        "tambah-confirm-password",
      ).value;

      if (payload.password !== confirmPassword) {
        alert("Kata sandi tidak cocok!");
        return;
      }

      if (payload.password.length < 8) {
        alert("Kata sandi minimal 8 karakter!");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Memproses...';

      fetch("https://admin4e06.vps-poliban.my.id/api/akademik/register", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then(async (response) => {
          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || "Gagal menambahkan pegawai");
          }
          return response.json();
        })
        .then(() => {
          alert("Pegawai berhasil ditambahkan!");
          location.reload();
        })
        .catch((error) => {
          alert("Error: " + error.message);
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        });
    });
  }

  // ------------------------------------------
  // HANDLER FORM EDIT PEGAWAI (PUT - UPDATE)
  // ------------------------------------------
  const formEditPegawai = document.getElementById("form-edit-pegawai");
  if (formEditPegawai) {
    formEditPegawai.addEventListener("submit", function (e) {
      e.preventDefault();

      const token = localStorage.getItem("token");
      const userId = document.getElementById("edit-user-id").value;
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      const payload = {
        nomor_identitas: document.getElementById("edit-nip").value,
        name: document.getElementById("edit-nama").value,
        username: document.getElementById("edit-username").value,
        email: document.getElementById("edit-email").value,
        status:
          document.getElementById("edit-status").value === "Aktif"
            ? "aktif"
            : "nonaktif",
        role_id: parseInt(document.getElementById("edit-role").value), // Langsung gunakan role_id numerik
      };

      // Email simple regex validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        alert("Format email tidak valid!");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

      fetch(
        `https://admin4e06.vps-poliban.my.id/api/akademik/users/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        },
      )
        .then(async (response) => {
          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || "Gagal memperbarui data");
          }
          return response.json();
        })
        .then(() => {
          alert("Data pegawai berhasil diperbarui!");
          location.reload();
        })
        .catch((error) => {
          alert("Error: " + error.message);
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        });
    });
  }
  // ------------------------------------------
  // 4. INTEGRASI API UTAMA
  // ------------------------------------------
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "../loginbaru/baru.html";
    return;
  }

  fetch("https://admin4e06.vps-poliban.my.id/api/akademik/users", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((users) => {
      globalUsersList = users;

      // --- CHART INITIALIZATION ---
      // Pastikan ada elemen <canvas id="chartStatusPegawai"></canvas> di HTML Anda
      const ctx = document.getElementById('chartStatusPegawai');
      if (ctx) {
        window.pegawaiChart = new Chart(ctx.getContext('2d'), {
          type: 'line', // Tipe chart yang digunakan (misal: 'line', 'bar', dll.)
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
            datasets: [
              // Dataset awal, akan diisi dan diperbarui oleh fungsi updateDashboardChart
              {
                label: 'Aktif',
                data: [], // Data akan diisi nanti
                borderColor: '#28a745', // Contoh warna hijau
                backgroundColor: 'rgba(40, 167, 69, 0.2)', // Contoh warna hijau transparan
                fill: true,
                tension: 0.4 // Untuk garis yang lebih halus
              },
              {
                label: 'Non-Aktif',
                data: [], // Data akan diisi nanti
                borderColor: '#6c757d', // Contoh warna abu-abu
                backgroundColor: 'rgba(108, 117, 125, 0.2)', // Contoh warna abu-abu transparan
                fill: true,
                tension: 0.4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                min: 0,
                ticks: {
                  stepSize: 1,  // Kunci kelipatan angka bulat 1
                  precision: 0, // Kunci anti desimal pecahan saat di-zoom
                  callback: function(value) {
                    if (value % 1 === 0) return value;
                  }
                },
                grid: {
                  display: false // ❌ Menghilangkan garis kotak horizontal di latar belakang
                }
              },
              x: {
                offset: false,      // Membuat garis grafik melebar penuh ke kanan-kiri
                boundaryGap: false,
                grid: {
                  display: false // ❌ Menghilangkan garis kotak vertikal di latar belakang
                }
              }
            },
            plugins: {
              legend: {
                display: false // ❌ Menghilangkan legend kotak bawaan yang menumpuk double
              },
              tooltip: {
                enabled: true,       // Menghidupkan kembali Pop-up saat kursor diarahkan ke chart
                mode: 'index',       // Menampilkan info Aktif & Non-Aktif sekaligus
                intersect: false     // Tetap muncul meski kursor tidak pas di titik bulat
              }
            }
          }
        });
      }
      // --- END CHART INITIALIZATION ---

      let totalAkademik = 0,
        totalPegawai = 0,
        totalMahasiswa = 0,
        totalKeuangan = 0;

      users.forEach((user) => {
        if (user.role_id === 2) totalAkademik++;
        if (user.role_id === 3) totalPegawai++;
        if (user.role_id === 4) totalMahasiswa++;
        if (user.role_id === 5) totalKeuangan++;
      });

      if (document.getElementById("count-akademik"))
        document.getElementById("count-akademik").innerText = totalAkademik;
      if (document.getElementById("count-pegawai"))
        document.getElementById("count-pegawai").innerText = totalPegawai;
      if (document.getElementById("count-mahasiswa"))
        document.getElementById("count-mahasiswa").innerText = totalMahasiswa;
      if (document.getElementById("count-keuangan"))
        document.getElementById("count-keuangan").innerText = totalKeuangan;

      if (yearSelect) {
        filterDanUpdateGrafik(yearSelect.value);
      } else {
        filterDanUpdateGrafik("2026");
      }

      renderTablePegawai(users);
      renderAkunRolePage(users); // This function is called here to populate the table on akunrole.html
    })
    .catch((error) => console.error("Terjadi kesalahan API Dashboard:", error));

  // ==========================================
  // 5. HANDLER API: ACTION DI DALAM TABEL (EDIT & DELETE)
  // ==========================================
  const tableBodyAkunRole = document.getElementById("table-akunrole-body");

  if (tableBodyAkunRole) {
    tableBodyAkunRole.addEventListener("click", function (e) {
      // ----------- LOGIKA TOMBOL EDIT -----------
      const btnEdit = e.target.closest(".btn-edit-pegawai");
      if (btnEdit) {
        console.log("=== TOMBOL EDIT DIKLIK ===");
        const userId = btnEdit.getAttribute("data-id");
        openEditModal(userId); // Panggil fungsi global openEditModal
        return;
      }

      // ----------- LOGIKA TOMBOL DELETE -----------
      const btnDelete = e.target.closest(".btn-delete");
      if (btnDelete) {
        const userId = btnDelete.getAttribute("data-id");
        const userToken = localStorage.getItem("token");

        if (!confirm("Yakin ingin menghapus data pegawai ini?")) return;

        fetch(
          `https://admin4e06.vps-poliban.my.id/api/akademik/users/${userId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${userToken}`,
              Accept: "application/json",
            },
          },
        )
          .then((response) => {
            if (!response.ok) throw new Error("Gagal menghapus pegawai");
            return response.json();
          })
          .then(() => {
            location.reload();
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("Terjadi kesalahan saat menghapus pegawai: " + error.message);
          });
      }
    });
  }

  // ------------------------------------------
  // 5.5 HANDLER: ROLE CHANGE DI MODAL EDIT (UPDATE CHECKBOX OTOMATIS)
  // ------------------------------------------
  const selectRoleEdit = document.getElementById("edit-role");
  if (selectRoleEdit) {
    selectRoleEdit.addEventListener("change", (e) => {
      const selectedRole = e.target.value;

      // Looping semua baris tabel hak akses di modal edit
      document.querySelectorAll(".table-hak-akses tbody tr").forEach((row) => {
        const rowRole = row.getAttribute("data-role-row");
        const checkboxes = row.querySelectorAll('input[type="checkbox"]');

        if (rowRole === selectedRole) {
          // Jika baris cocok dengan role yang dipilih, centang default
          checkboxes[0].checked = true; // Create
          checkboxes[1].checked = true; // Read
          checkboxes[2].checked = true; // Write
          checkboxes[3].checked = false; // Delete
        } else {
          // Jika tidak cocok, kosongkan semua centang
          checkboxes.forEach((cb) => (cb.checked = false));
        }
      });
    });
  }

  // ------------------------------------------
  // 8. HANDLER API: PUT STATUS SUBMISSION
  // ------------------------------------------
  const formNonaktifkan = document.getElementById("form-nonaktifkan");
  const formAktifkan = document.getElementById("form-aktifkan");

  if (formNonaktifkan) {
    formNonaktifkan.addEventListener("submit", function (e) {
      e.preventDefault();
      const userId = this.getAttribute("data-user-id");
      const userToken = localStorage.getItem("token");

      fetch(
        `https://admin4e06.vps-poliban.my.id/api/akademik/users/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ status: "nonaktif" }),
        },
      )
        .then((response) => {
          if (!response.ok) throw new Error("Gagal mengubah status");
          return response.json();
        })
        .then(() => {
          location.reload(); // Langsung reload instan tanpa pop-up mengganggu browser
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Terjadi kesalahan: " + error.message);
        });
    });
  }

  if (formAktifkan) {
    formAktifkan.addEventListener("submit", function (e) {
      e.preventDefault();
      const userId = this.getAttribute("data-user-id");
      const userToken = localStorage.getItem("token");

      fetch(
        `https://admin4e06.vps-poliban.my.id/api/akademik/users/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ status: "aktif" }),
        },
      )
        .then((response) => {
          if (!response.ok) throw new Error("Gagal mengubah status");
          return response.json();
        })
        .then(() => {
          location.reload(); // Langsung reload instan tanpa pop-up mengganggu browser
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Terjadi kesalahan: " + error.message);
        });
    });
  }
});

// ==========================================
// ENGINE KALENDER (PERBAIKAN DINAMIS FIT)
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  const monthYearLabel = document.querySelector(".cal-month-year");
  const calendarGrid = document.querySelector(".calendar-grid");

  // Memilih tombol prev dan next khusus di dalam kotak kalender agar lebih aman
  const prevBtn = document.querySelector(
    ".calendar-container .cal-btn:first-child",
  );
  const nextBtn = document.querySelector(
    ".calendar-container .cal-btn:last-child",
  );

  let currentDate = new Date();
  const monthsID = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  function renderCalendar() {
    const viewYear = currentDate.getFullYear();
    const viewMonth = currentDate.getMonth();

    if (monthYearLabel)
      monthYearLabel.innerText = `${monthsID[viewMonth]} ${viewYear}`;
    if (!calendarGrid) return;
    calendarGrid.innerHTML = "";

    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const lastDate = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevLastDate = new Date(viewYear, viewMonth, 0).getDate();

    // 1. Tanggal Bulan Sebelumnya (Samar)
    for (let i = firstDayIndex; i > 0; i--) {
      const span = document.createElement("span");
      span.classList.add("cal-date", "empty-day");
      span.innerText = prevLastDate - i + 1;
      calendarGrid.appendChild(span);
    }

    // 2. Tanggal Bulan Berjalan
    const realToday = new Date();
    for (let date = 1; date <= lastDate; date++) {
      const span = document.createElement("span");
      span.classList.add("cal-date"); // Class dasar untuk styling kotak angka
      span.innerText = date;

      const currentGridCount = calendarGrid.children.length;
      if (currentGridCount % 7 === 0) span.classList.add("holiday");

      // VALIDASI HARI INI: Jika tanggal, bulan, & tahun komputer COCOK
      if (
        date === realToday.getDate() &&
        viewMonth === realToday.getMonth() &&
        viewYear === realToday.getFullYear()
      ) {
        span.classList.add("today"); // Menambahkan penanda hari ini
      }

      calendarGrid.appendChild(span);
    }

    // 3. Tanggal Bulan Berikutnya (Agar Grid Genap & Rapi)
    const totalCells = calendarGrid.children.length;
    const nextDaysNeeded = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let j = 1; j <= nextDaysNeeded; j++) {
      const span = document.createElement("span");
      span.classList.add("cal-date", "empty-day");
      span.innerText = j;
      calendarGrid.appendChild(span);
    }
  }

  renderCalendar();

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    });
  }
});

// ==========================================
// UTILITY FUNCTIONS (GRAFIK & RENDER TABEL)
// ==========================================
function filterDanUpdateGrafik(tahunYangDipilih) {
  let grafikAktifBulan = new Array(12).fill(0);
  let grafikNonAktifBulan = new Array(12).fill(0);

  globalUsersList.forEach((user) => {
    if ([2, 3, 4, 5].includes(user.role_id)) {
      const tanggalDaftar = user.created_at || user.tanggal_terdaftar;
      let cocokTahun = false;
      let bulanIndex = new Date().getMonth();

      if (tanggalDaftar) {
        const tanggalObjek = new Date(tanggalDaftar);
        const tahunUser = tanggalObjek.getFullYear().toString();
        bulanIndex = tanggalObjek.getMonth();
        if (tahunUser === tahunYangDipilih) cocokTahun = true;
      } else {
        const tahunSekarang = new Date().getFullYear().toString();
        if (tahunSekarang === tahunYangDipilih) cocokTahun = true;
      }

      if (cocokTahun) {
        if (user.status === "aktif") {
          grafikAktifBulan[bulanIndex]++;
        } else if (user.status === "nonaktif" || user.status === "non-aktif") {
          grafikNonAktifBulan[bulanIndex]++;
        }
      }
    }
  });

  updateDashboardChart(grafikAktifBulan, grafikNonAktifBulan);
}

function renderTablePegawai(users) {
  const tableBody = document.getElementById("table-pegawai-body");
  const totalBadge = document.getElementById("total-pegawai-badge");

  if (!tableBody) return;
  tableBody.innerHTML = "";

  const pegawaiList = users.filter((user) =>
    [2, 3, 4, 5].includes(user.role_id),
  );

  if (totalBadge) totalBadge.innerText = pegawaiList.length;

  if (pegawaiList.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: gray; padding: 20px;">Tidak ada data pegawai ditemukan.</td></tr>`;
    return;
  }

  pegawaiList.forEach((user) => {
    let namaJabatan = "Pegawai",
      tagClass = "tag-blue";

    if (user.role_id === 2) {
      namaJabatan = "Admin Akademik";
      tagClass = "tag-blue";
    }
    if (user.role_id === 3) {
      namaJabatan = "Admin Pegawai";
      tagClass = "tag-purple";
    }
    if (user.role_id === 4) {
      namaJabatan = "Admin Mahasiswa";
      tagClass = "tag-red";
    }
    if (user.role_id === 5) {
      namaJabatan = "Admin Keuangan";
      tagClass = "tag-green";
    }

    let tanggalTeks = "14 Januari 2020";
    const tanggalDaftar = user.created_at || user.tanggal_terdaftar;
    if (tanggalDaftar) {
      tanggalTeks = new Date(tanggalDaftar).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    let statusClass = "aktif",
      statusTeks = "Aktif";
    if (user.status === "nonaktif" || user.status === "non-aktif") {
      statusClass = "non-aktif";
      statusTeks = "Non-Aktif";
    }

    let nomorIdentitas = user.nomor_identitas || `PGW00${user.id}`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>
            <div class="emp-name">${user.name}</div>
            <div class="emp-email">${user.email}</div>
        </td>
        <td><span class="role-badge ${tagClass}">${namaJabatan}</span></td>
        <td>${tanggalTeks}</td>
        <td>${nomorIdentitas}</td>
        <td><span class="status-txt ${statusClass}">${statusTeks}</span></td>
    `;
    tableBody.appendChild(tr);
  });
}

function updateDashboardChart(dataAktif, dataNonAktif) {
  if (window.pegawaiChart) {
    if (typeof window.pegawaiChart.updateSeries === "function") {
      window.pegawaiChart.updateSeries([
        { name: "Aktif", data: dataAktif },
        { name: "Non-Aktif", data: dataNonAktif },
      ]);
    } else if (window.pegawaiChart.data && window.pegawaiChart.data.datasets) {
      window.pegawaiChart.data.datasets[0].data = dataAktif;
      window.pegawaiChart.data.datasets[1].data = dataNonAktif;
      window.pegawaiChart.update();
    }
  }
}

function renderAkunRolePage(users) {
  const tableBody = document.getElementById("table-akunrole-body");
  const emptyStateElement = document.getElementById("empty-state");

  const statAkademik = document.getElementById("stat-akademik");
  const statPegawai = document.getElementById("stat-pegawai");
  const statMahasiswa = document.getElementById("stat-mahasiswa");
  const statKeuangan = document.getElementById("stat-keuangan");

  if (!tableBody) return;

  const akademikList = users.filter((user) => user.role_id === 2);
  const pegawaiList = users.filter((user) => user.role_id === 3);
  const mahasiswaList = users.filter((user) => user.role_id === 4);
  const keuanganList = users.filter((user) => user.role_id === 5);

  if (statAkademik) statAkademik.innerText = akademikList.length;
  if (statPegawai) statPegawai.innerText = pegawaiList.length;
  if (statMahasiswa) statMahasiswa.innerText = mahasiswaList.length;
  if (statKeuangan) statKeuangan.innerText = keuanganList.length;

  const allPegawai = users.filter((user) =>
    [2, 3, 4, 5].includes(user.role_id),
  );

  if (allPegawai.length === 0) {
    tableBody.innerHTML = "";
    if (emptyStateElement) emptyStateElement.style.display = "flex";
    return;
  } else {
    if (emptyStateElement) emptyStateElement.style.display = "none";
  }

  tableBody.innerHTML = "";

  allPegawai.forEach((user) => {
    let namaJabatan = "Pegawai",
      tagClass = "tag-blue";

    if (user.role_id === 2) {
      namaJabatan = "Admin Akademik";
      tagClass = "tag-blue";
    }
    if (user.role_id === 3) {
      namaJabatan = "Admin Pegawai";
      tagClass = "tag-purple";
    }
    if (user.role_id === 4) {
      namaJabatan = "Admin Mahasiswa";
      tagClass = "tag-red";
    }
    if (user.role_id === 5) {
      namaJabatan = "Admin Keuangan";
      tagClass = "tag-green";
    }

    let tanggalTeks = "-";
    const tanggalDaftar = user.created_at || user.tanggal_terdaftar;
    if (tanggalDaftar) {
      tanggalTeks = new Date(tanggalDaftar).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    let nipTeks = user.nomor_identitas || "-";
    let nomorIdentitas = user.nomor_identitas || `PGW00${user.id}`;

    let statusClass = "aktif",
      statusTeks = "Aktif";
    if (user.status === "nonaktif" || user.status === "non-aktif") {
      statusClass = "non-aktif";
      statusTeks = "Non-Aktif";
    }

    const isUserActive = user.status === "aktif" || user.status === "active";
    const toggleStatus = isUserActive ? "nonaktif" : "aktif";
    const toggleTitle = isUserActive
      ? "Nonaktifkan Pegawai"
      : "Aktifkan Pegawai";
    const toggleImage = isUserActive
      ? "../Asset/Vector.png"
      : "../Asset/Group 102.png";

    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>
            <div class="emp-name">${user.name}</div>
            <div class="emp-email">${user.email}</div>
        </td>
        <td>${nipTeks}</td>
        <td><span class="role-badge ${tagClass}">${namaJabatan}</span></td>
        <td>${nomorIdentitas}</td>
        <td>${tanggalTeks}</td>
        <td><span class="status-txt ${statusClass}">${statusTeks}</span></td>
        <td>
            <div style="display: flex; gap: 10px;">
                <button type="button" class="btn-toggle-status" title="${toggleTitle}" style="background: none; border: none; cursor: pointer; padding: 0; color: #4CC9F0;" onclick="showToggleModal('${user.id}', '${user.name}', '${toggleStatus}')">
                    <img src="${toggleImage}" alt="${toggleTitle}" width="20" height="20">
                </button>
                <button type="button" class="btn-edit-pegawai" data-id="${user.id}" style="background: none; border: none; cursor: pointer; padding: 0;" title="Edit Pegawai">
                    <img src="../Asset/Edit.png" alt="Edit" width="20" height="20">
                </button>
            </div>
        </td>
    `;
    tableBody.appendChild(tr);
  });
}
