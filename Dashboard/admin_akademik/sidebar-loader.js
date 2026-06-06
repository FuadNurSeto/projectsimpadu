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

        // 3. FITUR OTOMATIS: Berikan class 'active' pada menu yang sedang dibuka
        const currentPath = window.location.pathname;
        const menuLinks = container.querySelectorAll(".menu-item a");

        menuLinks.forEach((link) => {
          const hrefValue = link.getAttribute("href");
          // Jika URL browser saat ini mengandung atau sama dengan href di sidebar
          if (currentPath.includes(hrefValue)) {
            link.parentElement.classList.add("active");
          }
        });

        // 4. LOGIKA MODAL LOGOUT GLOBAL
        const modalLogout = document.getElementById("modal-logout-container");
        const btnBatal = document.getElementById("btn-close-logout");
        const btnExecute = document.getElementById("btn-execute-logout");

        // Mencari tombol logout di dalam sidebar yang baru dimuat
        const triggerLogout = container.querySelector(
          ".menu-item.logout a, #logout-trigger, a[href*='keluar']",
        );

        if (triggerLogout && modalLogout) {
          triggerLogout.addEventListener("click", function (e) {
            e.preventDefault();
            modalLogout.classList.add("aktif-modal");
          });

          if (btnBatal) {
            btnBatal.addEventListener("click", () =>
              modalLogout.classList.remove("aktif-modal"),
            );
          }

          modalLogout.addEventListener("click", (e) => {
            if (e.target === modalLogout)
              modalLogout.classList.remove("aktif-modal");
          });

          if (btnExecute) {
            btnExecute.addEventListener("click", function () {
              localStorage.clear();
              sessionStorage.clear();
              // Sesuaikan path redirect dengan lokasi file login Anda
              window.location.href = "../../../loginbaru/baru.html";
            });
          }
        }
      }
    })
    .catch((error) => console.error("Error pada Sidebar Loader:", error));
});
