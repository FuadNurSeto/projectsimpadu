document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================================================
  // 1. KONTROL DROPDOWN KUSTOM (SEMESTER)
  // ==========================================================================
  const dropdownTrigger = document.getElementById('dropdownTrigger');
  const dropdownMenu = document.getElementById('dropdownMenu');

  if (dropdownTrigger && dropdownMenu) {
    // Toggle menu saat trigger diklik
    dropdownTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });

    // Pilih item di dalam dropdown kustom
    const dropdownItems = dropdownMenu.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
      item.addEventListener('click', function () {
        // Hapus status terpilih dari item sebelumnya
        dropdownItems.forEach(i => {
          i.classList.remove('selected');
          const checkIcon = i.querySelector('.fa-check');
          if (checkIcon) checkIcon.remove();
        });

        // Tandai item aktif yang baru
        this.classList.add('selected');
        
        // Buat ikon checkmark baru secara dinamis
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-check';
        this.appendChild(icon);

        // Update teks label utama pada tombol trigger
        dropdownTrigger.querySelector('span').innerText = this.textContent.trim();
        
        // Tutup menu kembali
        dropdownMenu.classList.remove('show');

        // Opsional: Panggil fungsi filter data di sini jika terhubung dengan API
        console.log(`Filter berdasarkan: ${this.textContent.trim()}`);
      });
    });

    // Tutup paksa dropdown jika pengguna mengklik di luar area komponen
    document.addEventListener('click', () => {
      dropdownMenu.classList.remove('show');
    });
  }

  // ==========================================================================
  // 2. FITUR LIVE SEARCH / PENCARIAN REAL-TIME
  // ==========================================================================
  const searchInput = document.getElementById('searchInput');
  const tableRows = document.querySelectorAll('#tableBody tr');

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const query = this.value.toLowerCase().trim();

      tableRows.forEach(row => {
        // Membaca seluruh teks di dalam satu baris tabel untuk dicocokkan
        const rowText = row.textContent.toLowerCase();
        
        if (rowText.includes(query)) {
          row.style.display = ''; // Tampilkan baris jika cocok
        } else {
          row.style.display = 'none'; // Sembunyikan baris jika tidak cocok
        }
      });
    });
  }

  // ==========================================================================
  // 3. EVENT HANDLER TAMBAHAN (PLACEHOLDER TOMBOL)
  // ==========================================================================
  const btnAdd = document.querySelector('.btn-add');
  if (btnAdd) {
    btnAdd.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Fitur Tambah Dosen Pengajar (Trigger Modal / Navigasi Form)!');
    });
  }
});