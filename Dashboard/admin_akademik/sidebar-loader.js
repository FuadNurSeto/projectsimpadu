// File: Dashboard/admin_akademik/sidebar-loader.js
document.addEventListener("DOMContentLoaded", function () {
  // 1. Ambil template kodingan sidebar.html
  fetch("/Dashboard/admin_akademik/sidebar.html")
    .then((response) => {
      if (!response.ok) throw new Error("Gagal mengambil file sidebar.html");
      return response.text();
    })
    .then((htmlContent) => {
      // 2. Masukkan kodenya ke dalam div target di halaman HTML
      const container = document.getElementById("sidebar-container");
      if (container) {
        container.innerHTML = htmlContent;

        // Pastikan semua menu yang mengandung kata "Dosen" mengarah ke path absolut yang benar
        container.querySelectorAll(".menu-item a").forEach((link) => {
          if (link.textContent.toLowerCase().includes("dosen")) {
            link.setAttribute(
              "href",
              "/Dashboard/admin_akademik/dosen/index.html",
            );
          }
        });

        // 3. FITUR OTOMATIS: Berikan class 'active' pada menu yang sedang dibuka
        const currentPath = window.location.pathname;
        const menuLinks = container.querySelectorAll(".menu-item a");

        menuLinks.forEach((link) => {
          const hrefValue = link.getAttribute("href");

          // Abaikan link logout atau anchor (#) agar tidak dianggap aktif otomatis di setiap halaman
          if (
            !hrefValue ||
            hrefValue === "#" ||
            link.parentElement.classList.contains("logout")
          )
            return;

          // Ambil direktori folder dari menu (misal: /Dashboard/admin_akademik/kelas/)
          const menuFolder = hrefValue.substring(
            0,
            hrefValue.lastIndexOf("/") + 1,
          );

          const isExactMatch = currentPath === hrefValue;
          // Jika berada di folder yang sama (untuk halaman detail), tapi abaikan folder root agar Dashboard tidak aktif terus
          const isFolderMatch =
            menuFolder !== "" &&
            menuFolder !== "/Dashboard/admin_akademik/" &&
            currentPath.startsWith(menuFolder);

          if (isExactMatch || isFolderMatch) {
            link.parentElement.classList.add("active");
          }
        });

        // 4. LOGIKA MODAL LOGOUT GLOBAL
        const modalLogout = document.getElementById("logout-modal"); // Menggunakan ID yang benar
        const btnBatal = document.getElementById("btn-batal-logout"); // Menggunakan ID yang benar
        const btnExecute = document.querySelector(".logout-btn-konfirmasi"); // Menggunakan selector kelas yang benar

        // 4. LOGIKA MODAL LOGOUT GLOBAL: Menggunakan Event Delegation agar lebih robust
        document.addEventListener("click", function (e) {
          // Mencari tombol logout dengan berbagai kemungkinan selector class yang ada di CSS
          const triggerLogout = e.target.closest(
            ".menu-item.logout a, .nav-item.item-logout a, #logout-trigger, a[href*='keluar']",
          );

          if (triggerLogout) {
            e.preventDefault();
            if (modalLogout) {
              modalLogout.classList.add("show");
            } else {
              // Fallback jika modal tidak ditemukan di HTML: Gunakan konfirmasi browser bawaan
              if (confirm("Apakah Anda yakin ingin keluar dari sistem?")) {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = "/loginbaru/baru.html";
              }
            }
          }
        });

        if (modalLogout) {
          if (btnBatal) {
            btnBatal.addEventListener("click", () =>
              modalLogout.classList.remove("show"),
            );
          }

          modalLogout.addEventListener("click", (e) => {
            if (e.target === modalLogout) modalLogout.classList.remove("show");
          });

          if (btnExecute) {
            btnExecute.addEventListener("click", function () {
              localStorage.clear();
              sessionStorage.clear();
              // Path absolut agar redirect logout berhasil dari subfolder mana pun
              window.location.href = "/loginbaru/baru.html";
            });
          }
        }
      }
    })
    .catch((error) => console.error("Error pada Sidebar Loader:", error));
});
