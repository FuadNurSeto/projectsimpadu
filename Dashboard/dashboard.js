document.addEventListener("DOMContentLoaded", function () {
  // 1. Sidebar Toggle Responsif
  const toggleBtn = document.querySelector(".toggle-sidebar");
  const sidebar = document.querySelector(".sidebar");

  toggleBtn.addEventListener("click", function () {
    sidebar.classList.toggle("collapsed");
    // Tambahkan logic css jika ingin menyembunyikan penuh di device kecil
  });

 // ==========================================
  // PERBAIKAN: 2. Logika Klik Dropdown Profil User
  // ==========================================
  const userProfile = document.querySelector(".user-profile");
  const profileDropdown = document.getElementById("profileDropdown");
  const logoutBtn = document.getElementById("logoutBtn");

  if (userProfile && profileDropdown) {
    // Jalankan fungsi toggle buka/tutup saat bar diklik
    userProfile.addEventListener("click", function (e) {
      e.stopPropagation(); // Mencegah event menutup otomatis saat bar diklik
      profileDropdown.classList.toggle("show");
      this.classList.toggle("active"); // Untuk memutar icon chevron
    });

    // Menutup dropdown otomatis jika pengguna mengklik di luar area profile
    document.addEventListener("click", function (e) {
      if (!userProfile.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.remove("show");
        userProfile.classList.remove("active");
      }
    });
  }

  // Logika ketika tombol keluar akun diklik
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("token");
      localStorage.removeItem("user_data");
      alert("Anda telah berhasil keluar.");
      window.location.href = "login.html"; // Ubah ke file halaman login kamu
    });
  }

  // 3. Navigasi Sidebar Menu Aktif
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      navItems.forEach((nav) => nav.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // 4. Deteksi Filter Tahun di Chart
  const yearSelect = document.querySelector(".year-select");
  yearSelect.addEventListener("change", function (e) {
    console.log("Memuat data grafik untuk tahun: " + e.target.value);
    // Di sini bisa ditambahkan fungsi update chart jika menggunakan Chart.js asli
  });

  // Tambahkan baris ini di dalam document.addEventListener("DOMContentLoaded", function () { ... }) yang lama

  // 5. Interaksi Tombol Tambah Pegawai
  const btnTambahPegawai = document.querySelector(".btn-primary");
  if (btnTambahPegawai) {
    btnTambahPegawai.addEventListener("click", function () {
      alert("Form tambah pegawai akan muncul!");
    });
  }

  // 6. Logika Fitur Ketik Kolom Pencarian
  const searchInput = document.querySelector(".search-input");
  if (searchInput) {
    searchInput.addEventListener("keyup", function (e) {
      if (e.key === "Enter") {
        alert("Mencari data untuk pegawai: " + this.value);
      }
    });
  }
});
document.addEventListener("DOMContentLoaded", function () {
    // Ambil elemen-elemen berdasarkan class HTML yang kamu miliki
    const monthYearLabel = document.querySelector(".cal-month-year");
    const calendarGrid = document.querySelector(".calendar-grid");
    const prevBtn = document.querySelectorAll(".cal-btn")[0]; // Tombol kiri
    const nextBtn = document.querySelectorAll(".cal-btn")[1]; // Tombol kanan

    // Simpan objek tanggal saat ini (Real Time)
    let currentDate = new Date();

    // Daftar nama bulan bahasa Indonesia
    const monthsID = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    function renderCalendar() {
        const viewYear = currentDate.getFullYear();
        const viewMonth = currentDate.getMonth();

        // 1. Update Teks Header (Contoh: "Mei 2026")
        if (monthYearLabel) {
            monthYearLabel.innerText = `${monthsID[viewMonth]} ${viewYear}`;
        }

        if (!calendarGrid) return;
        
        // Bersihkan seluruh isi tanggal statis/dummy bawaan HTML sebelumnya
        calendarGrid.innerHTML = ""; 

        // Cari tahu hari pertama di bulan ini jatuh pada hari apa (0 = Minggu, 1 = Senin, dst)
        const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

        // Cari tahu tanggal terakhir di bulan aktif ini
        const lastDate = new Date(viewYear, viewMonth + 1, 0).getDate();

        // Cari tahu tanggal terakhir di bulan sebelumnya (untuk angka pudar di awal grid)
        const prevLastDate = new Date(viewYear, viewMonth, 0).getDate();

        // 2. RENDERING TANGGAL BULAN SEBELUMNYA (Class: empty-day)
        for (let i = firstDayIndex; i > 0; i--) {
            const span = document.createElement("span");
            span.classList.add("empty-day");
            span.innerText = prevLastDate - i + 1;
            calendarGrid.appendChild(span);
        }

        // 3. RENDERING TANGGAL BULAN BERJALAN
        for (let date = 1; date <= lastDate; date++) {
            const span = document.createElement("span");
            span.innerText = date;

            // Hitung posisi kolom di grid. Jika kolom pertama (index kelipatan 7), maka itu hari Minggu
            const currentGridCount = calendarGrid.children.length;
            if (currentGridCount % 7 === 0) {
                span.classList.add("holiday"); // Otomatis jadi hari Minggu sesuai css-mu
            }

            // Cek apakah tanggal, bulan, dan tahun ini cocok dengan HARI INI secara presisi
            const realToday = new Date();
            if (
                date === realToday.getDate() &&
                viewMonth === realToday.getMonth() &&
                viewYear === realToday.getFullYear()
            ) {
                span.classList.add("today"); // Menyorot hari ini menggunakan class .today milikmu
            }

            calendarGrid.appendChild(span);
        }
    }

    // Jalankan fungsi render kalender pertama kali saat halaman dimuat
    renderCalendar();

    // 4. LOGIKA NAVIGASI TOMBOL KIRI (BULAN SEBELUMNYA)
    if (prevBtn) {
        prevBtn.addEventListener("click", function () {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    // 5. LOGIKA NAVIGASI TOMBOL KANAN (BULAN BERIKUTNYA)
    if (nextBtn) {
        nextBtn.addEventListener("click", function () {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }
});