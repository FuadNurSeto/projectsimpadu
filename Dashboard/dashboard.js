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
