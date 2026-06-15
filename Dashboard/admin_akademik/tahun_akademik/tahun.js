// ==========================================================================
// --- KONFIGURASI UTAMA & BASE URL ---
// ==========================================================================
const BASE_URL = "https://admin4e06.vps-poliban.my.id";

document.addEventListener("DOMContentLoaded", () => {
  console.log("🔄 [System] DOM selesai dimuat. Memulai inisialisasi fitur...");

  // Ambil token dari storage
  const token =
    localStorage.getItem("token") || localStorage.getItem("auth_token");

  // Proteksi Halaman
  if (!token) {
    console.warn(
      "⚠️ [Auth] Token tidak ditemukan! Mengalihkan ke halaman login...",
    );
    alert(
      "Sesi Anda habis atau Anda belum login. Silakan masuk terlebih dahulu.",
    );
    window.location.href = "../../../loginbaru/baru.html";
    return;
  }

  // Jalankan inisialisasi seluruh komponen halaman
  initUserData();
  fetchTahunAkademik(token);
  initModalLogic(token);
  initEditModalLogic(token);
  initStatusToggleLogic(token);
  initLogoutLogic();

  console.log("🚀 [System] Seluruh fungsi inisialisasi selesai dipanggil!");
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
    const initials = localName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
    topbarAvatar.textContent = initials;
  }
}

// ==========================================================================
// --- 2. TARIK DATA TAHUN AKADEMIK DARI VPS (READ) ---
// ==========================================================================
async function fetchTahunAkademik(token) {
  const tbody = document.getElementById("list-tahun-akademik");
  if (!tbody) {
    console.error(
      "❌ [Error] Elemen HTML 'list-tahun-akademik' tidak ditemukan!",
    );
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/akademik/tahun-akademik`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) throw new Error(`Status: ${response.status}`);

    const data = await response.json();
    tbody.innerHTML = "";

    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: #94a3b8; padding: 24px;">
            Belum ada data tahun akademik di database.
          </td>
        </tr>`;
      return;
    }

    data.forEach((item) => {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid #f1f5f9";
      tr.style.verticalAlign = "middle";

      const isAktif = item.status === "aktif";
      const statusBg = isAktif ? "#e6f4ea" : "#f1f5f9";
      const statusColor = isAktif ? "#137333" : "#475569";
      const statusLabel = isAktif ? "Aktif" : "Non-Aktif";

      let toggleButton = isAktif
        ? `<button class="btn-status-toggle" data-id="${item.id}" data-nama="${item.tahun_akademik}" data-status="aktif" title="Nonaktifkan Akses" style="background: #ffffff; border: 1px solid #cbd5e1; color: #64748b; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;"><i class="fas fa-ban"></i></button>`
        : `<button class="btn-status-toggle" data-id="${item.id}" data-nama="${item.tahun_akademik}" data-status="nonaktif" title="Aktifkan Akses" style="background: #e6f4ea; border: 1px solid #bbf7d0; color: #16a34a; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;"><i class="fas fa-check"></i></button>`;

      const editButton = ` 
        <button class="btn-edit-tahun" data-id="${item.id}" data-nama="${item.tahun_akademik}" data-status="${item.status}" title="Edit Tahun Akademik" style="background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;"><i class="fas fa-pencil-alt"></i></button>
      `;

      tr.innerHTML = `
        <td style="padding: 16px 24px; font-weight: 700; color: #0f172a;">${item.id}</td>
        <td style="padding: 16px 24px; font-weight: 500; color: #334155; text-transform: capitalize;">${item.tahun_akademik || ""}</td>
        <td style="padding: 16px 24px;">
          <span style="background: ${statusBg}; color: ${statusColor}; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 600; display: inline-block;">
            ${statusLabel}
          </span>
        </td>
        <td style="padding: 16px 24px;">
          <div style="display: flex; justify-content: center; gap: 8px; align-items: center;">
            ${toggleButton}
            ${editButton}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    const txtSekarang = document.getElementById("count-sekarang");
    const txtTotal = document.getElementById("count-total");
    if (txtSekarang && txtTotal) {
      txtSekarang.textContent = data.length;
      txtTotal.textContent = data.length;
    }
  } catch (error) {
    console.error("❌ [Error] fetchTahunAkademik Gagal:", error);
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #ef4444; padding: 24px;">❌ Gagal memuat data dari VPS.</td></tr>`;
  }
}

// ==========================================================================
// --- 3. LOGIKA MODAL TAMBAH (CREATE) ---
// ==========================================================================
function initModalLogic(token) {
  const modal = document.getElementById("modal-tambah-tahun");
  const btnBuka = document.getElementById("btn-buka-modal-tambah");
  const btnBatal = document.getElementById("btn-batal-tambah");
  const form = document.getElementById("form-tambah-tahun");

  if (!modal) return;

  if (btnBuka)
    btnBuka.addEventListener("click", () => modal.classList.remove("hidden"));

  const closeModal = () => {
    modal.classList.add("hidden");
    if (form) form.reset();
  };

  if (btnBatal) btnBatal.addEventListener("click", closeModal);

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        id: document.getElementById("id-tahun").value.trim(),
        tahun_akademik: document.getElementById("nama-tahun").value.trim(),
        status:
          document.getElementById("status-tahun").value === "Aktif"
            ? "aktif"
            : "nonaktif",
      };

      try {
        const response = await fetch(
          `${BASE_URL}/api/akademik/tahun-akademik`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        if (response.ok) {
          alert("Tahun akademik baru berhasil disimpan!");
          closeModal();
          fetchTahunAkademik(token);
        } else {
          const errData = await response.json();
          alert(`Gagal: ${errData.message || response.statusText}`);
        }
      } catch (error) {
        console.error("❌ [Error] Simpan Gagal:", error);
      }
    });
  }
}

// ==========================================================================
// --- 4. LOGIKA MODAL EDIT (UPDATE via POST) ---
// ==========================================================================
function initEditModalLogic(token) {
  const modalEdit = document.getElementById("modal-edit-tahun");
  const btnBatalEdit = document.getElementById("btn-batal-edit");
  const formEditTahun = document.getElementById("form-edit-tahun");
  const tbody = document.getElementById("list-tahun-akademik");

  if (!modalEdit || !tbody) return;

  tbody.addEventListener("click", (e) => {
    const btnEdit = e.target.closest(".btn-edit-tahun");
    if (btnEdit) {
      document.getElementById("edit-id-tahun").value =
        btnEdit.getAttribute("data-id");
      document.getElementById("edit-nama-tahun").value =
        btnEdit.getAttribute("data-nama");
      document.getElementById("edit-status-tahun").value =
        btnEdit.getAttribute("data-status");
      modalEdit.classList.remove("hidden");
    }
  });

  if (btnBatalEdit)
    btnBatalEdit.addEventListener("click", () =>
      modalEdit.classList.add("hidden"),
    );

  if (formEditTahun) {
    formEditTahun.addEventListener("submit", async (e) => {
      e.preventDefault();
      const idTahun = document.getElementById("edit-id-tahun").value;
      const dataDiperbarui = {
        id: idTahun,
        tahun_akademik: document.getElementById("edit-nama-tahun").value.trim(),
        status: document.getElementById("edit-status-tahun").value,
      };

      try {
        const response = await fetch(
          `${BASE_URL}/api/akademik/tahun-akademik/${idTahun}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(dataDiperbarui),
          },
        );

        if (response.ok) {
          alert("Data berhasil diperbarui!");
          modalEdit.classList.add("hidden");
          fetchTahunAkademik(token);
        } else {
          const errData = await response.json();
          alert(`Gagal: ${errData.message || response.statusText}`);
        }
      } catch (error) {
        console.error("❌ [Error] Update Gagal:", error);
      }
    });
  }
}

// ==========================================================================
// --- 5. LOGIKA TOGGLE STATUS (Disesuaikan dengan Desain Gambar 1 & 2) ---
// ==========================================================================
function initStatusToggleLogic(token) {
  const modalStatus = document.getElementById("modal-konfirmasi-status");
  const btnBatalStatus = document.getElementById("btn-status-batal");
  const btnYaStatus = document.getElementById("btn-status-ya");
  const iconBox = document.getElementById("confirm-icon-box");
  const confirmTitle = document.getElementById("confirm-title");
  const confirmDesc = document.getElementById("confirm-desc");
  const tbody = document.getElementById("list-tahun-akademik");

  let targetIdTahun = null;
  let targetStatusBaru = null;
  let targetNamaTahun = "";

  // Template SVG Ikon bulat sesuai desain UI Figma Anda
  const svgCheck = `
    <div style="background: #eff6ff; width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17L4 12" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>`;

  const svgWarning = `
    <div style="background: #fef2f2; width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 9V14M12 18H12.01M12 3L2 22H22L12 3Z" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>`;

  if (!tbody || !modalStatus) return;

  tbody.addEventListener("click", (e) => {
    const btnToggle = e.target.closest(".btn-status-toggle");
    if (btnToggle) {
      targetIdTahun = btnToggle.getAttribute("data-id");
      targetNamaTahun = btnToggle.getAttribute("data-nama");
      const statusSaatIni = btnToggle.getAttribute("data-status");

      if (statusSaatIni === "aktif") {
        // MAU MENONAKTIFKAN (GAMBAR 1)
        targetStatusBaru = "nonaktif";
        if (iconBox) iconBox.innerHTML = svgWarning;
        if (confirmTitle)
          confirmTitle.innerText = "Nonaktifkan Tahun Akademik?";
        if (confirmDesc) {
          confirmDesc.innerHTML = `Apakah Anda yakin ingin menonaktifkan periode <strong>${targetIdTahun} (${targetNamaTahun})</strong>?<br><span style="color: #64748b; font-size: 13px; display: inline-block; margin-top: 8px;">Tahun akademik yang dinonaktifkan tidak dapat digunakan untuk mengisi nilai.</span>`;
        }
        if (btnYaStatus) {
          btnYaStatus.innerText = "Ya, Nonaktifkan";
          btnYaStatus.style.backgroundColor = "#dc2626"; // Tombol Merah
        }
      } else {
        // MAU MENGAKTIFKAN (GAMBAR 2)
        targetStatusBaru = "aktif";
        if (iconBox) iconBox.innerHTML = svgCheck;
        if (confirmTitle) confirmTitle.innerText = "Aktifkan Tahun Akademik?";
        if (confirmDesc) {
          confirmDesc.innerHTML = `Apakah Anda yakin ingin mengaktifkan periode <strong>${targetIdTahun} (${targetNamaTahun})</strong>?<br><span style="color: #64748b; font-size: 13px; display: inline-block; margin-top: 8px;">Periode ini akan menjadi tahun akademik aktif untuk seluruh kegiatan perkuliahan dan input nilai.</span>`;
        }
        if (btnYaStatus) {
          btnYaStatus.innerText = "Ya, Aktifkan";
          btnYaStatus.style.backgroundColor = "#2563eb"; // Tombol Biru
        }
      }

      modalStatus.classList.remove("hidden");
    }
  });

  if (btnBatalStatus)
    btnBatalStatus.addEventListener("click", () =>
      modalStatus.classList.add("hidden"),
    );

  if (btnYaStatus) {
    btnYaStatus.addEventListener("click", async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/akademik/tahun-akademik/${targetIdTahun}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              id: targetIdTahun,
              tahun_akademik: targetNamaTahun,
              status: targetStatusBaru,
            }),
          },
        );

        if (response.ok) {
          alert("Status berhasil diubah!");
          modalStatus.classList.add("hidden");
          fetchTahunAkademik(token);
        } else {
          const errData = await response.json();
          alert(`Gagal: ${errData.message || response.statusText}`);
        }
      } catch (error) {
        console.error("❌ [Error] Toggle Gagal:", error);
      }
    });
  }
}

// ==========================================================================
// --- 6. LOGIKA MODAL LOGOUT (FIXED DENGAN EVENT DELEGATION) ---
// ==========================================================================
function initLogoutLogic() {
  // Kita menempelkan event ke 'document', bukan ke tombol langsung
  // Dengan ini, kita tidak peduli kapan tombol logout muncul di halaman
  document.addEventListener("click", function (e) {
    // Cari apakah yang diklik adalah tombol logout
    const trigger = e.target.closest(".menu-item.logout a");

    if (trigger) {
      e.preventDefault();
      console.log("✅ Tombol logout diklik, memicu modal...");

      const modal = document.querySelector(".logout-modal-overlay");
      if (modal) {
        modal.classList.add("show");
      } else {
        console.error(
          "❌ Modal logout (.logout-modal-overlay) tidak ditemukan di HTML!",
        );
      }
    }
  });

  // Logika tutup modal (Batal)
  document.addEventListener("click", function (e) {
    if (e.target.matches(".logout-btn-batal")) {
      const modal = document.querySelector(".logout-modal-overlay");
      if (modal) modal.classList.remove("show");
    }
  });

  // Logika eksekusi logout (Konfirmasi)
  document.addEventListener("click", function (e) {
    if (e.target.matches(".logout-btn-konfirmasi")) {
      console.log("🚪 Logout diproses...");
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "../../../loginbaru/baru.html";
    }
  });
}
