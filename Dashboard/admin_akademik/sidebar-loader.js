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
      }
    })
    .catch((error) => console.error("Error pada Sidebar Loader:", error));
});