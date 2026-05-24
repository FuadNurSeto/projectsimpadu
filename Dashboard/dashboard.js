document.addEventListener("DOMContentLoaded", function () {
  // 1. Sidebar Toggle Responsif
  const toggleBtn = document.querySelector(".toggle-sidebar");
  const sidebar = document.querySelector(".sidebar");

  toggleBtn.addEventListener("click", function () {
    sidebar.classList.toggle("collapsed");
    // Tambahkan logic css jika ingin menyembunyikan penuh di device kecil
  });

  // 2. Simulasi Klik Dropdown Profil User
  const userProfile = document.querySelector(".user-profile");
  userProfile.addEventListener("click", function () {
    alert("Menu manajemen profil kelompok/user aktif.");
  });

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
