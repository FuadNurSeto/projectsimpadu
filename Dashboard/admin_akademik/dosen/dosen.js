// d:\Semester 4\PBL\projectsimpadu\Dashboard\admin_akademik\dosen\dosen.js

const API_BASE_URL = "https://admin4e06.vps-poliban.my.id/api/akademik";
const API_TOKEN = localStorage.getItem("token");

let allDosenData = []; // Global State Data Master
let currentFilteredData = []; // Global State Data Terfilter
let currentPage = 1; // Halaman Active saat ini
const rowsPerPage = 10; // Jumlah baris maksimum per halaman

const requestHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${API_TOKEN}`,
};

document.addEventListener("DOMContentLoaded", () => {
  if (!API_TOKEN) {
    alert("Sesi Anda habis atau belum login, silakan login kembali.");
    window.location.href = "/loginbaru/baru.html";
    return;
  }

  setDynamicProfile();
  loadDosenPengajarData();

  // Inisialisasi Kontrol Pengklik 3 Custom Dropdown
  initCustomTahunDropdown();
  initCustomProdiDropdown();
  initCustomSemesterDropdown();

  // Search Box Event Listener
  document.getElementById("search-dosen")?.addEventListener("input", () => {
    currentPage = 1; // Reset ke halaman pertama saat mengetik kata kunci
    applyFilters();
  });

  // Inisialisasi Modal Tambah & View Dosen
  initTambahDosenModal();
  initViewDosenModal();
});

function setDynamicProfile() {
  const loggedInName = localStorage.getItem("name") || "Admin Academic";
  document
    .querySelectorAll(".user-name")
    .forEach((el) => (el.innerText = loggedInName));

  const initials = loggedInName
    .split(" ")
    .filter((n) => n.length > 0)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  document
    .querySelectorAll(".user-avatar-badge")
    .forEach((el) => (el.innerText = initials || "AA"));
}

// ==========================================================================
// AMBIL DATA & POPULASI DROPDOWN DINAMIS
// ==========================================================================
async function loadDosenPengajarData() {
  const tableBody = document.getElementById("list-dosen");
  if (!tableBody) return;

  try {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    // Mengambil data beban, tahun, dosen, matkul, dan kelas secara paralel
    const [
      bebanResponse,
      tahunResponse,
      dosenResponse,
      mkResponse,
      kelasResponse,
    ] = await Promise.all([
      fetch(`${API_BASE_URL}/dosen/beban-mengajar`, {
        method: "GET",
        headers: headers,
      }),
      fetch(`${API_BASE_URL}/tahun-akademik`, {
        method: "GET",
        headers: headers,
      }),
      fetch(`${API_BASE_URL}/dosen`, { method: "GET", headers: headers }),
      fetch(`${API_BASE_URL}/mata-kuliah`, { method: "GET", headers: headers }),
      fetch(`${API_BASE_URL}/kelas`, { method: "GET", headers: headers }),
    ]);

    if (
      !bebanResponse.ok ||
      !tahunResponse.ok ||
      !dosenResponse.ok ||
      !mkResponse.ok ||
      !kelasResponse.ok
    ) {
      throw new Error(
        `Gagal mengambil data (Beban: ${bebanResponse.status}, MK: ${mkResponse.status}, Kelas: ${kelasResponse.status})`,
      );
    }

    const bebanJson = await bebanResponse.json();
    const tahunJson = await tahunResponse.json();
    const dosenJson = await dosenResponse.json();
    const mkJson = await mkResponse.json();
    const kelasJson = await kelasResponse.json();

    // Unboxing data jika dibungkus oleh objek wrapper Laravel { data: [...] }
    allDosenData = Array.isArray(bebanJson) ? bebanJson : bebanJson.data || [];
    const dataTahun = Array.isArray(tahunJson)
      ? tahunJson
      : tahunJson.data || [];
    const dataDosen = Array.isArray(dosenJson)
      ? dosenJson
      : dosenJson.data || [];
    const dataMK = Array.isArray(mkJson) ? mkJson : mkJson.data || [];
    const dataKelas = Array.isArray(kelasJson)
      ? kelasJson
      : kelasJson.data || [];

    if (
      !Array.isArray(allDosenData) ||
      !Array.isArray(dataTahun) ||
      !Array.isArray(dataDosen)
    ) {
      throw new Error(
        "Format data yang diterima dari API bukan berupa Array valid.",
      );
    }

    // Distribusikan data ke generator penyuplai list custom dropdown
    populateCustomTahunFilter(dataTahun);
    populateCustomProdiFilter(allDosenData);

    // Populasi pilihan untuk modal Tambah & Edit
    populateLecturerDropdown(dataDosen);
    populateTambahModalOptions(dataDosen, dataMK, dataKelas);
  } catch (error) {
    console.error("Detail Kendala Fetching:", error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:#ef4444; padding:40px; font-weight:500;">
          <i class="fas fa-exclamation-triangle" style="margin-right:8px;"></i>
          Gagal memuat data akademik.<br>
          <small style="color: #64748b; font-weight: 400; display:block; margin-top:5px;">Info Dev: ${error.message}</small>
        </td>
      </tr>
    `;
  }
}

// 1. Populasi List Tahun Akademik
function populateCustomTahunFilter(data) {
  const tahunContainer = document.getElementById("tahun-list-container");
  const selectedText = document.getElementById("selected-tahun");
  const hiddenInput = document.getElementById("filter-tahun");
  if (!tahunContainer) return;

  const tahunMap = new Map();
  let apiActiveYearId = null;

  data.forEach((item) => {
    if (item.id) {
      const idStr = item.id.toString();
      const tipeSemester = idStr.endsWith("1")
        ? "Ganjil"
        : idStr.endsWith("2")
          ? "Genap"
          : "";
      const checkIsActive =
        item.status === "aktif" ||
        item.status == 1 ||
        item.is_aktif === true ||
        item.is_active === true;

      if (checkIsActive) apiActiveYearId = idStr;
      tahunMap.set(idStr, tipeSemester);
    }
  });

  const sortedYears = Array.from(tahunMap.entries()).sort(
    (a, b) => b[0] - a[0],
  );
  const globalActiveYear = localStorage.getItem("active_tahun_akademik");
  let activeYearId =
    globalActiveYear ||
    apiActiveYearId ||
    (sortedYears.length > 0 ? sortedYears[0][0] : null);

  const hasActiveYear = activeYearId && tahunMap.has(activeYearId);

  if (hasActiveYear) {
    if (selectedText)
      selectedText.innerText = `Tahun: ${activeYearId} (${tahunMap.get(activeYearId)})`;
    if (hiddenInput) hiddenInput.value = activeYearId;
  } else {
    if (selectedText) selectedText.innerText = "Semua Tahun Akademik";
    if (hiddenInput) hiddenInput.value = "";
  }

  let htmlContent = `
    <li class="${!hasActiveYear ? "active" : ""}" data-value="">
      Semua Tahun Akademik
      ${!hasActiveYear ? '<i class="fas fa-check check-icon"></i>' : ""}
    </li>
  `;

  sortedYears.forEach(([id, ket]) => {
    const isActive = id === activeYearId;
    htmlContent += `
      <li class="${isActive ? "active" : ""}" data-value="${id}">
        Tahun: ${id} (${ket})
        ${isActive ? '<span class="badge-aktif-dropdown" style="background: #e0f2fe; color: #0369a1; font-size: 11px; padding: 2px 8px; border-radius: 4px; margin-left: 8px; font-weight: 600;">AKTIF</span>' : ""}
        ${isActive ? '<i class="fas fa-check check-icon" style="color: #2563eb; margin-left: auto;"></i>' : ""}
      </li>
    `;
  });

  tahunContainer.innerHTML = htmlContent;
  bindTahunItemsClick();
  applyFilters();
}

// 2. Populasi List Program Studi Dinamis
function populateCustomProdiFilter(data) {
  const prodiContainer = document.getElementById("prodi-list-container");
  if (!prodiContainer) return;

  const prodis = new Map();
  data.forEach((item) => {
    item.mata_kuliah?.forEach((mk) => {
      if (mk.prodi?.id) prodis.set(mk.prodi.id, mk.prodi.nama_prodi);
    });
  });

  prodiContainer.innerHTML = `
    <li class="active" data-value="">
      Semua Program Studi
      <i class="fas fa-check check-icon"></i>
    </li>
  `;

  prodis.forEach((nama, id) => {
    prodiContainer.innerHTML += `<li data-value="${id}">${nama}</li>`;
  });

  bindProdiItemsClick();
}

// Populasi Dropdown Dosen Pengajar di Modal Edit
function populateLecturerDropdown(dosenList) {
  const selectNamaDosen = document.getElementById("edit-nama-dosen");
  if (!selectNamaDosen) return;

  selectNamaDosen.innerHTML =
    '<option value="" disabled selected>Pilih Dosen Pengajar</option>';
  dosenList.forEach((dosen) => {
    const option = new Option(dosen.name, dosen.id);
    selectNamaDosen.add(option);
  });
}

// ==========================================================================
// FUNGSI KONTROL MODAL TAMBAH DOSEN PENGAJAR
// ==========================================================================
function initTambahDosenModal() {
  const btnTambah = document.getElementById("btnTambahDosen");
  const modal = document.getElementById("modalTambahDosen");
  const card = document.getElementById("modalCard");
  const btnBatal = document.getElementById("btnBatal");
  const btnCancelTambah = document.getElementById("btn-cancel-tambah");
  const form = document.getElementById("formTambahDosen");

  if (!modal) return;

  const openModal = async () => {
    modal.style.display = "flex";
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    const selectTambahTahun = document.getElementById("select-tambah-tahun");
    const textTambahTahun = document.getElementById("text-tambah-tahun");

    try {
      const currentToken = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/tahun-akademik/aktif`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${currentToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Gagal mengambil tahun akademik aktif: ${response.status}`,
        );
      }

      const data = await response.json();
      if (data && data.id && data.tahun_akademik) {
        const semesterText = data.tahun_akademik
          .toLowerCase()
          .includes("ganjil")
          ? "Ganjil"
          : "Genap";

        if (selectTambahTahun) selectTambahTahun.value = data.id;
        if (textTambahTahun) {
          textTambahTahun.value = `${data.id} (${semesterText})`;
        }
        localStorage.setItem("active_tahun_akademik", data.id);
      } else {
        throw new Error("Format data tahun akademik aktif tidak sesuai.");
      }
    } catch (error) {
      console.error("Error fetching active academic year:", error);
      const fallbackYear =
        localStorage.getItem("active_tahun_akademik") || "20262";
      const fallbackSemester = fallbackYear.endsWith("1") ? "Ganjil" : "Genap";

      if (selectTambahTahun) selectTambahTahun.value = fallbackYear;
      if (textTambahTahun) {
        textTambahTahun.value = `${fallbackYear} (${fallbackSemester})`;
      }
    }

    setTimeout(() => {
      card?.classList.remove("scale-95", "opacity-0");
      card?.classList.add("scale-100", "opacity-100");
    }, 10);
  };

  const closeModal = () => {
    card?.classList.remove("scale-100", "opacity-100");
    card?.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      modal.style.display = "none";
      modal.classList.add("hidden");
      document.body.style.overflow = "";
      form?.reset();
    }, 200);
  };

  btnTambah?.addEventListener("click", openModal);
  btnBatal?.addEventListener("click", closeModal);
  btnCancelTambah?.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      dosen_id: document.getElementById("select-tambah-dosen")?.value,
      mata_kuliah_id: document.getElementById("select-tambah-mk")?.value,
      tahun_akademik_id: localStorage.getItem("active_tahun_akademik"),
    };

    const kelasId = document.getElementById("select-tambah-kelas")?.value;

    if (!payload.dosen_id || !payload.mata_kuliah_id || !kelasId) {
      alert("Harap lengkapi semua data bertanda bintang (*)");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/kelas/${kelasId}/dosen`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || API_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Dosen pengajar berhasil ditambahkan ke kelas!");
        closeModal();
        loadDosenPengajarData();
      } else {
        const err = await response.json();
        alert(`Gagal: ${err.message || "Terjadi kesalahan pada server."}`);
      }
    } catch (error) {
      console.error("Error Submit:", error);
      alert("Gagal terhubung ke server API.");
    }
  });
}

function populateTambahModalOptions(dosenArr, mkArr, kelasArr) {
  const selectDosen = document.getElementById("select-tambah-dosen");
  const selectMK = document.getElementById("select-tambah-mk");
  const selectKelas = document.getElementById("select-tambah-kelas");

  if (selectDosen) {
    selectDosen.innerHTML =
      '<option value="" disabled selected>Pilih Dosen Pengajar</option>';
    dosenArr.forEach((d) => {
      const opt = new Option(d.name, d.id);
      selectDosen.add(opt);
    });
  }

  if (selectMK) {
    selectMK.innerHTML =
      '<option value="" disabled selected>Pilih atau cari mata kuliah...</option>';
    mkArr.forEach((m) => {
      const opt = new Option(`${m.nama_mk} (${m.sks} SKS)`, m.id_mk);
      selectMK.add(opt);
    });
  }

  if (selectKelas) {
    selectKelas.innerHTML =
      '<option value="" disabled selected>Cari kelas (mis. TI-4E)...</option>';
    kelasArr.forEach((k) => {
      if (k.status === "aktif" || k.status == 1) {
        const opt = new Option(`${k.nama_kelas} (${k.kode_kelas})`, k.id);
        selectKelas.add(opt);
      }
    });
  }
}

// ==========================================================================
// CORE FILTER ENGINE
// ==========================================================================
function applyFilters() {
  const searchTerm =
    document.getElementById("search-dosen")?.value.toLowerCase() || "";
  const tahunFilter = document.getElementById("filter-tahun")?.value || "";
  const prodiFilter = document.getElementById("filter-prodi")?.value || "";
  const semesterFilter =
    document.getElementById("filter-semester")?.value || "";

  if (!Array.isArray(allDosenData)) return;

  currentFilteredData = allDosenData
    .map((item) => {
      if (!item.mata_kuliah) return { ...item, mata_kuliah: [] };

      const filteredMK = item.mata_kuliah.filter((mk) => {
        const matchesSearch =
          (item.dosen?.name &&
            item.dosen.name.toLowerCase().includes(searchTerm)) ||
          (item.dosen?.nomor_identitas &&
            item.dosen.nomor_identitas.toLowerCase().includes(searchTerm)) ||
          (mk.nama_mk && mk.nama_mk.toLowerCase().includes(searchTerm)) ||
          (mk.kelas?.kode_kelas &&
            mk.kelas.kode_kelas.toLowerCase().includes(searchTerm));

        const matchesTahun =
          !tahunFilter ||
          (mk.tahun_akademik?.id &&
            mk.tahun_akademik.id.toString() === tahunFilter);
        const matchesProdi =
          !prodiFilter ||
          (mk.prodi?.id && mk.prodi.id.toString() === prodiFilter);
        const matchesSemester = matchSemesterLogic(mk, semesterFilter);

        return matchesSearch && matchesTahun && matchesProdi && matchesSemester;
      });
      return { ...item, mata_kuliah: filteredMK };
    })
    .filter((item) => item.mata_kuliah.length > 0);

  renderDosenTable(currentFilteredData);
}

function getSemesterNumber(mk) {
  if (!mk) return "";
  if (mk.semester) {
    const s = mk.semester.toString().replace(/\D/g, "");
    if (s && parseInt(s) >= 1 && parseInt(s) <= 8) return s;
  }
  if (mk.kelas && mk.kelas.kode_kelas) {
    const match = mk.kelas.kode_kelas.match(/\d/);
    if (match) return match[0];
  }
  return "";
}

function matchSemesterLogic(mk, filterValue) {
  if (!filterValue) return true;
  const target = filterValue.toLowerCase().trim();
  const mkSem = getSemesterNumber(mk);

  if (/^[1-8]$/.test(mkSem)) {
    if (/^[1-8]$/.test(target)) return mkSem === target;
    const isOdd = parseInt(mkSem) % 2 !== 0;
    if (target.includes("ganjil")) return isOdd;
    if (target.includes("genap")) return !isOdd;
  }
  return false;
}

// ==========================================================================
// CONTROLLERS MANAGEMENT: CUSTOM DROPDOWNS
// ==========================================================================
function initCustomTahunDropdown() {
  const wrapper = document.getElementById("dropdown-tahun");
  wrapper
    ?.querySelector(".dropdown-trigger")
    ?.addEventListener("click", (e) => {
      e.stopPropagation();
      document
        .querySelectorAll(".custom-dropdown")
        .forEach((d) => d !== wrapper && d.classList.remove("open"));
      wrapper.classList.toggle("open");
    });
}

function bindTahunItemsClick() {
  const wrapper = document.getElementById("dropdown-tahun");
  const listItems = wrapper?.querySelectorAll("#tahun-list-container li");
  const selectedText = document.getElementById("selected-tahun");
  const hiddenInput = document.getElementById("filter-tahun");

  listItems?.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const value = item.getAttribute("data-value");
      let text = item.childNodes[0].textContent.trim();
      if (value !== "") text = `Tahun: ${text}`;

      if (selectedText) selectedText.innerText = text;
      if (hiddenInput) hiddenInput.value = value;

      listItems.forEach((li) => {
        li.classList.remove("active");
        li.querySelector(".check-icon")?.remove();
      });

      item.classList.add("active");
      const checkIcon = document.createElement("i");
      checkIcon.className = "fas fa-check check-icon";

      if (value === "") item.appendChild(checkIcon);
      else {
        checkIcon.style.marginLeft = "auto";
        item.appendChild(checkIcon);
      }

      wrapper.classList.remove("open");
      currentPage = 1;
      applyFilters();
    });
  });
}

// Inisialisasi Custom Dropdown Program Studi
function initCustomProdiDropdown() {
  const wrapper = document.getElementById("dropdown-prodi");
  const innerSearchInput = document.getElementById("search-prodi-dropdown");

  wrapper
    ?.querySelector(".dropdown-trigger")
    ?.addEventListener("click", (e) => {
      e.stopPropagation();
      document
        .querySelectorAll(".custom-dropdown")
        .forEach((d) => d !== wrapper && d.classList.remove("open"));
      wrapper.classList.toggle("open");
      if (wrapper.classList.contains("open")) innerSearchInput?.focus();
    });

  innerSearchInput?.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    wrapper.querySelectorAll("#prodi-list-container li").forEach((item) => {
      const text = item.textContent.toLowerCase();
      item.style.display =
        text.includes(query) || item.getAttribute("data-value") === ""
          ? ""
          : "none";
    });
  });
}

function bindProdiItemsClick() {
  const wrapper = document.getElementById("dropdown-prodi");
  const listItems = wrapper?.querySelectorAll("#prodi-list-container li");
  const selectedText = document.getElementById("selected-prodi");
  const hiddenInput = document.getElementById("filter-prodi");

  listItems?.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const value = item.getAttribute("data-value");
      const text = item.childNodes[0].textContent.trim();

      if (selectedText) selectedText.innerText = text;
      if (hiddenInput) hiddenInput.value = value;

      listItems.forEach((li) => {
        li.classList.remove("active");
        li.querySelector(".check-icon")?.remove();
      });

      item.classList.add("active");
      const checkIcon = document.createElement("i");
      checkIcon.className = "fas fa-check check-icon";
      item.appendChild(checkIcon);

      wrapper.classList.remove("open");
      currentPage = 1;
      applyFilters();
    });
  });
}

function initCustomSemesterDropdown() {
  const wrapper = document.getElementById("dropdown-semester");
  const listItems = wrapper?.querySelectorAll(".dropdown-menu-list li");
  const selectedText = document.getElementById("selected-semester");
  const hiddenInput = document.getElementById("filter-semester");

  wrapper
    ?.querySelector(".dropdown-trigger")
    ?.addEventListener("click", (e) => {
      e.stopPropagation();
      document
        .querySelectorAll(".custom-dropdown")
        .forEach((d) => d !== wrapper && d.classList.remove("open"));
      wrapper.classList.toggle("open");
    });

  listItems?.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const value = item.getAttribute("data-value");
      const text = item.childNodes[0].textContent.trim();

      if (selectedText) selectedText.innerText = text;
      if (hiddenInput) hiddenInput.value = value;

      listItems.forEach((li) => {
        li.classList.remove("active");
        li.querySelector(".check-icon")?.remove();
      });

      item.classList.add("active");
      const checkIcon = document.createElement("i");
      checkIcon.className = "fas fa-check check-icon";
      item.appendChild(checkIcon);

      wrapper.classList.remove("open");
      currentPage = 1;
      applyFilters();
    });
  });
}

document.addEventListener("click", () => {
  document
    .querySelectorAll(".custom-dropdown")
    .forEach((d) => d.classList.remove("open"));
});

// ==========================================================================
// RENDER TABEL UTAMA + CLIENT SIDE PAGINATION ENGINE
// ==========================================================================
function renderDosenTable(dosenData) {
  const tableBody = document.getElementById("list-dosen");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  // 1. Flatten Data: Struktur data bersarang dipecah jadi baris tunggal
  const flattenedRows = [];
  dosenData.forEach((item) => {
    const dosen = item.dosen;
    const mataKuliahList = item.mata_kuliah;
    if (!dosen || !mataKuliahList) return;

    mataKuliahList.forEach((mk) => {
      flattenedRows.push({ dosen, mk });
    });
  });

  const totalRecords = flattenedRows.length;

  const currentCountEl = document.getElementById("current-count");
  const totalCountEl = document.getElementById("total-count");
  const paginationControlsEl = document.getElementById("pagination-controls");

  if (totalRecords === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:40px; color:#64748b;">Tidak ada data dosen yang sesuai dengan filter.</td></tr>`;
    if (currentCountEl) currentCountEl.innerText = "0";
    if (totalCountEl) totalCountEl.innerText = "0";
    if (paginationControlsEl) paginationControlsEl.innerHTML = "";
    return;
  }

  // 2. Kalkulasi Pagination Math
  const totalPages = Math.ceil(totalRecords / rowsPerPage);
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRecords);
  const paginatedRows = flattenedRows.slice(startIndex, endIndex);

  // 3. Update Text Keterangan Sisi Kiri Footer
  if (currentCountEl) currentCountEl.innerText = paginatedRows.length;
  if (totalCountEl) totalCountEl.innerText = totalRecords;

  // 4. Render Data Ke Tabel DOM
  let lastDosenId = null;

  paginatedRows.forEach((rowObj) => {
    const dosen = rowObj.dosen;
    const mk = rowObj.mk;
    const row = document.createElement("tr");

    const mkSem = getSemesterNumber(mk);
    const semLabel = /^[1-8]$/.test(mkSem)
      ? `Sms ${mkSem} (${parseInt(mkSem) % 2 !== 0 ? "Ganjil" : "Genap"})`
      : "—";

    const isFirstCellForLecturer = dosen.id !== lastDosenId;
    lastDosenId = dosen.id;

    row.innerHTML = `
      <td>
        ${
          isFirstCellForLecturer
            ? `
          <div class="dosen-profile-cell">
            <div class="avatar-circle ${getAvatarColorClass(dosen?.name)}">${getInitials(dosen?.name)}</div>
            <div class="dosen-meta">
              <span class="dosen-name">${dosen.name}</span>
              <span class="dosen-nip">NIP. ${dosen.nomor_identitas || "-"}</span>
            </div>
          </div>
        `
            : ""
        }
      </td>
      <td>
        <div class="mk-cell">
          <span class="mk-name">${mk.nama_mk}</span>
          <span class="badge-sks">${mk.sks} SKS</span>
        </div>
      </td>
      <td>
        <div class="kelas-cell">
          <span class="kelas-code">${mk.kelas?.kode_kelas || "-"} <span class="prodi-slash">/ ${mk.prodi?.nama_prodi || "-"}</span></span>
          <span class="kelas-tahun">TA: ${mk.tahun_akademik?.id || "-"} — ${semLabel}</span>
        </div>
      </td>
      <td>
        <span class="badge-peserta ${getPesertaBadgeClass(mk.jumlah_mahasiswa, mk.kelas?.kapasitas_mahasiswa || 40)}">
          ${mk.jumlah_mahasiswa} Mahasiswa
        </span>
      </td>
      <td>
        <div class="action-buttons" style="text-align:center">
          <button class="btn-action view-btn" 
                  data-dosen-name="${dosen.name || ""}" 
                  data-dosen-nip="${dosen.nomor_identitas || "-"}"
                  data-mk-name="${mk.nama_mk || ""}"
                  data-mk-sks="${mk.sks || 0}"
                  data-kelas-code="${mk.kelas?.kode_kelas || "-"}"
                  data-prodi-name="${mk.prodi?.nama_prodi || "-"}"
                  data-tahun-id="${mk.tahun_akademik?.id || "-"}"
                  data-tahun-sem="${semLabel}"
                  data-jumlah-mhs="${mk.jumlah_mahasiswa || 0}">
            <i class="far fa-eye"></i>
          </button>
          <button class="btn-action btn-edit" 
                  data-id-jadwal="${mk.id_jadwal || ""}"
                  data-id-kelas="${mk.kelas?.id || ""}"
                  data-dosen-id="${dosen.id || ""}"
                  data-dosen-name="${dosen.name || ""}"
                  data-mk-name="${mk.nama_mk || ""}"
                  data-kelas-code="${mk.kelas?.kode_kelas || ""}">
            <i class="fas fa-pencil-alt"></i>
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // 5. Gambar Ulang Navigasi Kontrol
  renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
  const container = document.getElementById("pagination-controls");
  if (!container) return;
  container.innerHTML = "";

  // Mengatur kerapatan antar tombol pagination
  container.style.display = "flex";
  container.style.gap = "6px";
  container.style.alignItems = "center";

  // UKURAN DIPERKECIL: Padding dari 8px 14px -> 5px 10px | Font dari 14px -> 12px
  const baseBtnStyle =
    "padding: 5px 10px; font-size: 12px; font-weight: 600; border-radius: 6px; border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif;";
  const disabledBtnStyle =
    "padding: 5px 10px; font-size: 12px; font-weight: 600; border-radius: 6px; border: 1px solid #e2e8f0; color: #cbd5e1; background-color: #f8fafc; cursor: not-allowed; font-family: 'Inter', sans-serif;";

  // ==========================================
  // 1. TOMBOL BACKWARD (<)
  // ==========================================
  const prevBtn = document.createElement("button");
  prevBtn.innerText = "<";

  if (currentPage === 1) {
    prevBtn.style.cssText = disabledBtnStyle;
    prevBtn.disabled = true;
  } else {
    prevBtn.style.cssText =
      baseBtnStyle + " background-color: #ffffff; color: #475569;";
    prevBtn.onmouseover = () => {
      prevBtn.style.backgroundColor = "#f8fafc";
      prevBtn.style.borderColor = "#cbd5e1";
    };
    prevBtn.onmouseout = () => {
      prevBtn.style.backgroundColor = "#ffffff";
      prevBtn.style.borderColor = "#e2e8f0";
    };
    prevBtn.addEventListener("click", () => {
      currentPage--;
      renderDosenTable(currentFilteredData);
    });
  }
  container.appendChild(prevBtn);

  // ==========================================
  // 2. TOMBOL ANGKA HALAMAN (1 2 3 ...)
  // ==========================================
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;

    if (i === currentPage) {
      btn.style.cssText =
        baseBtnStyle +
        " background-color: #2563eb; color: #ffffff; border-color: #2563eb;";
    } else {
      btn.style.cssText =
        baseBtnStyle + " background-color: #ffffff; color: #475569;";
      btn.onmouseover = () => {
        btn.style.backgroundColor = "#f8fafc";
        btn.style.borderColor = "#cbd5e1";
      };
      btn.onmouseout = () => {
        btn.style.backgroundColor = "#ffffff";
        btn.style.borderColor = "#e2e8f0";
      };
    }

    btn.addEventListener("click", () => {
      currentPage = i;
      renderDosenTable(currentFilteredData);
    });

    container.appendChild(btn);
  }

  // ==========================================
  // 3. TOMBOL FORWARD (>)
  // ==========================================
  const nextBtn = document.createElement("button");
  nextBtn.innerText = ">";

  if (currentPage === totalPages || totalPages === 0) {
    nextBtn.style.cssText = disabledBtnStyle;
    nextBtn.disabled = true;
  } else {
    nextBtn.style.cssText =
      baseBtnStyle + " background-color: #ffffff; color: #475569;";
    nextBtn.onmouseover = () => {
      nextBtn.style.backgroundColor = "#f8fafc";
      nextBtn.style.borderColor = "#cbd5e1";
    };
    nextBtn.onmouseout = () => {
      nextBtn.style.backgroundColor = "#ffffff";
      nextBtn.style.borderColor = "#e2e8f0";
    };
    nextBtn.addEventListener("click", () => {
      currentPage++;
      renderDosenTable(currentFilteredData);
    });
  }
  container.appendChild(nextBtn);
}

function getInitials(name) {
  if (!name) return "??";
  const parts = name.split(" ").filter((n) => n.length > 0);
  return parts.length === 1
    ? parts[0].substring(0, 2).toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColorClass(name) {
  if (!name) return "blue-avatar";
  const colors = [
    "blue-avatar",
    "pink-avatar",
    "green-avatar",
    "purple-avatar",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash % colors.length)];
}

function getPesertaBadgeClass(current, max) {
  if (current === 0) return "red-badge";
  if (current < max / 2) return "orange-badge";
  return "green-badge";
}

// ==========================================================================
// CONTROLLER: EVENT HANDLER UNTUK MODAL EDIT DOSEN PENGAJAR
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const editModal = document.getElementById("edit-dosen-modal");
  const formEditDosen = document.getElementById("form-edit-dosen");
  const btnCancelEdit = document.getElementById("btn-cancel-edit");

  const inputTahunAkademik = document.getElementById("edit-tahun-akademik");
  const inputIdDosen = document.getElementById("edit-id-dosen");
  const selectNamaDosen = document.getElementById("edit-nama-dosen");
  const inputMataKuliah = document.getElementById("edit-mata-kuliah");
  const inputKelasDosen = document.getElementById("edit-kelas-dosen");

  let activeJadwalId = null;
  let activeKelasId = null;

  document.getElementById("list-dosen")?.addEventListener("click", (e) => {
    const targetEdit = e.target.closest(".btn-edit");

    if (targetEdit) {
      e.preventDefault();

      const idDosen = targetEdit.getAttribute("data-dosen-id") || "";
      const namaMK = targetEdit.getAttribute("data-mk-name") || "";
      const kodeKelas = targetEdit.getAttribute("data-kelas-code") || "";

      activeJadwalId = targetEdit.getAttribute("data-id-jadwal");
      activeKelasId = targetEdit.getAttribute("data-id-kelas");

      const activeYearId =
        localStorage.getItem("active_tahun_akademik") || "20262";
      const tipeSemester = activeYearId.endsWith("1") ? "Ganjil" : "Genap";

      if (inputTahunAkademik)
        inputTahunAkademik.value = `${activeYearId} (${tipeSemester})`;
      if (inputMataKuliah) inputMataKuliah.value = namaMK;
      if (inputKelasDosen) inputKelasDosen.value = kodeKelas;
      if (inputIdDosen) inputIdDosen.value = idDosen;

      if (selectNamaDosen) {
        selectNamaDosen.value = idDosen;
      }

      if (editModal) editModal.style.display = "flex";
    }
  });

  btnCancelEdit?.addEventListener("click", () => {
    if (editModal) editModal.style.display = "none";
  });

  formEditDosen?.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!activeKelasId || !activeJadwalId) {
      alert("Gagal membaca metadata ID Jadwal atau ID Kelas.");
      return;
    }

    const dataPayload = {
      dosen_id: selectNamaDosen?.value,
      tahun_akademik: localStorage.getItem("active_tahun_akademik"),
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/kelas/${activeKelasId}/dosen/${activeJadwalId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(dataPayload),
        },
      );

      if (response.ok) {
        alert("Perubahan alokasi dosen pengajar kelas berhasil disimpan!");
        if (editModal) editModal.style.display = "none";
        loadDosenPengajarData();
      } else {
        const errorRes = await response.json();
        alert(
          `Gagal menyimpan: ${errorRes.message || "Terjadi kesalahan di server."}`,
        );
      }
    } catch (error) {
      console.error("Kesalahan koneksi form:", error);
      alert("Terjadi masalah jaringan saat menghubungi API VPS Poliban.");
    }
  });

  editModal?.addEventListener("click", (e) => {
    if (e.target === editModal) editModal.style.display = "none";
  });
});

// ==========================================================================
// CONTROLLER: EVENT HANDLER UNTUK MODAL VIEW DETAIL DOSEN
// ==========================================================================
function initViewDosenModal() {
  const modalView = document.getElementById("view-dosen-modal");
  const btnCloseView = document.getElementById("btn-close-view");
  const tableBody = document.getElementById("list-dosen");

  const cardView = modalView?.querySelector(".modal-form-card");

  if (!modalView || !tableBody) return;

  const openViewModal = (data) => {
    const initials = data.nama
      .split(" ")
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const headerNama = document.getElementById("view-header-nama");
    const headerNip = document.getElementById("view-header-nip");
    const tahunAkademik = document.getElementById("view-tahun-akademik");
    const initialCircle = document.getElementById("view-initial-circle");
    const blockNama = document.getElementById("view-block-nama");
    const blockNip = document.getElementById("view-block-nip");
    const mataKuliah = document.getElementById("view-mata-kuliah");
    const kelasProdi = document.getElementById("view-kelas-prodi");
    const pesertaBadge = document.getElementById("view-peserta-badge");

    if (headerNama) headerNama.innerText = data.nama;
    if (headerNip) headerNip.innerText = `NIP: ${data.nip}`;
    if (tahunAkademik)
      tahunAkademik.innerText = `${data.tahunId} (${data.tahunSem.replace("Sms ", "Semester ")})`;
    if (initialCircle) initialCircle.innerText = initials || "??";
    if (blockNama) blockNama.innerText = data.nama;
    if (blockNip) blockNip.innerText = `- NIP: ${data.nip}`;
    if (mataKuliah) mataKuliah.innerText = `${data.mkNama} (${data.mkSks} SKS)`;
    if (kelasProdi)
      kelasProdi.innerHTML = `<span style="font-weight: 700;">${data.kelasCode}</span> / <span style="color: #64748b; font-weight: 400;">${data.prodiName}</span>`;
    if (pesertaBadge) pesertaBadge.innerText = data.jumlahMhs;

    modalView.style.display = "flex";
    modalView.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      cardView?.classList.remove("scale-95", "opacity-0");
      cardView?.classList.add("scale-100", "opacity-100");
    }, 10);
  };

  const closeViewModal = () => {
    cardView?.classList.remove("scale-100", "opacity-100");
    cardView?.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      modalView.style.display = "none";
      modalView.classList.add("hidden");
      document.body.style.overflow = "";
    }, 200);
  };

  btnCloseView?.addEventListener("click", closeViewModal);

  modalView.addEventListener("click", (e) => {
    if (e.target === modalView) closeViewModal();
  });

  tableBody.addEventListener("click", (e) => {
    const targetView = e.target.closest(".view-btn");
    if (targetView) {
      e.preventDefault();
      const data = {
        nama: targetView.getAttribute("data-dosen-name"),
        nip: targetView.getAttribute("data-dosen-nip"),
        mkNama: targetView.getAttribute("data-mk-name"),
        mkSks: targetView.getAttribute("data-mk-sks"),
        kelasCode: targetView.getAttribute("data-kelas-code"),
        prodiName: targetView.getAttribute("data-prodi-name"),
        tahunId: targetView.getAttribute("data-tahun-id"),
        tahunSem: targetView.getAttribute("data-tahun-sem"),
        jumlahMhs: targetView.getAttribute("data-jumlah-mhs"),
      };
      openViewModal(data);
    }
  });
}
