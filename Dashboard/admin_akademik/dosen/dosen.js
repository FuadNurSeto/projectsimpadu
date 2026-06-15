// d:\Semester 4\PBL\projectsimpadu\Dashboard\admin_akademik\dosen\dosen.js

const API_BASE_URL = "https://admin4e06.vps-poliban.my.id/api/akademik";
const API_TOKEN = localStorage.getItem("token"); // Token diambil sekali di awal, tapi akan di-refresh saat fetch

let allDosenData = []; // Global State

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
  document
    .getElementById("search-dosen")
    ?.addEventListener("input", applyFilters);

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

    // Mengambil data beban, tahun, dosen, matkul, dan kelas secara paralel dari localhost
    const [bebanResponse, tahunResponse, dosenResponse, mkResponse, kelasResponse] = await Promise.all([
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

    if (!bebanResponse.ok || !tahunResponse.ok || !dosenResponse.ok || !mkResponse.ok || !kelasResponse.ok) {
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
    const dataKelas = Array.isArray(kelasJson) ? kelasJson : kelasJson.data || [];

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
    populateLecturerDropdown(dataDosen); // Untuk edit
    populateTambahModalOptions(dataDosen, dataMK, dataKelas); // Untuk tambah baru

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

// Populasi Dropdown Dosen Pengajar di Modal Edit dengan semua dosen tersedia
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
        throw new Error(`Gagal mengambil tahun akademik aktif: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.id && data.tahun_akademik) {
        const semesterText = data.tahun_akademik.toLowerCase().includes('ganjil') ? 'Ganjil' : 'Genap';
        
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
      const fallbackYear = localStorage.getItem("active_tahun_akademik") || "20262";
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
    selectDosen.innerHTML = '<option value="" disabled selected>Pilih Dosen Pengajar</option>';
    dosenArr.forEach((d) => {
      const opt = new Option(d.name, d.id);
      selectDosen.add(opt);
    });
  }

  if (selectMK) {
    selectMK.innerHTML = '<option value="" disabled selected>Pilih atau cari mata kuliah...</option>';
    mkArr.forEach((m) => {
      const opt = new Option(`${m.nama_mk} (${m.sks} SKS)`, m.id_mk);
      selectMK.add(opt);
    });
  }

  if (selectKelas) {
    selectKelas.innerHTML = '<option value="" disabled selected>Cari kelas (mis. TI-4E)...</option>';
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

  const filteredData = allDosenData
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

  renderDosenTable(filteredData);
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
      applyFilters();
    });
  });
}

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
// RENDER TABEL UTAMA
// ==========================================================================
function renderDosenTable(dosenData) {
  const tableBody = document.getElementById("list-dosen");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  if (dosenData.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:40px; color:#64748b;">Tidak ada data dosen yang sesuai dengan filter.</td></tr>`;
    return;
  }

  dosenData.forEach((item) => {
    const dosen = item.dosen;
    const mataKuliahList = item.mata_kuliah;

    if (!dosen || !mataKuliahList) return;

    mataKuliahList.forEach((mk, index) => {
      const row = document.createElement("tr");
      const mkSem = getSemesterNumber(mk);
      const semLabel = /^[1-8]$/.test(mkSem)
        ? `Sms ${mkSem} (${parseInt(mkSem) % 2 !== 0 ? "Ganjil" : "Genap"})`
        : "—";

      row.innerHTML = `
        <td>
          ${
            index === 0
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
  });
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
      const namaDosen = targetEdit.getAttribute("data-dosen-name") || "";
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
// ==========================================================================
// CONTROLLER: EVENT HANDLER UNTUK MODAL VIEW DETAIL DOSEN
// ==========================================================================
function initViewDosenModal() {
  const modalView = document.getElementById("view-dosen-modal");
  const cardView = document.getElementById("viewModalCard");
  const btnCloseView = document.getElementById("btn-close-view");
  const tableBody = document.getElementById("list-dosen");

  if (!modalView || !tableBody) return;

  const openViewModal = (data) => {
    // Menghasilkan inisial nama secara ringkas (contoh: Ahmad Husaini -> AH)
    const initials = data.nama.split(" ").filter(n => n.length > 0).map(n => n[0]).slice(0, 2).join("").toUpperCase();

    // Petakan data ke elemen HTML Modal View
    document.getElementById("view-header-nama").innerText = data.nama;
    document.getElementById("view-header-nip").innerText = data.nip;
    document.getElementById("view-tahun-akademik").innerText = `${data.tahunId} (${data.tahunSem.replace("Sms ", "Semester ")})`;
    document.getElementById("view-initial-circle").innerText = initials || "??";
    document.getElementById("view-block-nama").innerText = data.nama;
    document.getElementById("view-block-nip").innerText = data.nip;
    document.getElementById("view-mata-kuliah").innerText = `${data.mkNama} (${data.mkSks} SKS)`;
    document.getElementById("view-kelas-prodi").innerHTML = `<span style="font-weight: 700;">${data.kelasCode}</span> / <span style="color: #64748b; font-weight: 400;">${data.prodiName}</span>`;
    document.getElementById("view-peserta-badge").innerText = `${data.jumlahMhs} Mahasiswa`;

    // Tampilkan Modal & jalankan efek transisi CSS
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

  // Event Delegation untuk menangkap klik tombol .view-btn di dalam tbody tabel
  tableBody.addEventListener("click", (e) => {
    const targetBtn = e.target.closest(".view-btn");
    
    if (targetBtn) {
      e.preventDefault();
      
      // Ambil data-attribute dari tombol yang diklik sesuai mapping di renderDosenTable
      const dataDetail = {
        nama: targetBtn.getAttribute("data-dosen-name"),
        nip: targetBtn.getAttribute("data-dosen-nip"),
        tahunId: targetBtn.getAttribute("data-tahun-id"),
        tahunSem: targetBtn.getAttribute("data-tahun-sem"),
        mkNama: targetBtn.getAttribute("data-mk-name"),
        mkSks: targetBtn.getAttribute("data-mk-sks"),
        kelasCode: targetBtn.getAttribute("data-kelas-code"),
        prodiName: targetBtn.getAttribute("data-prodi-name"),
        jumlahMhs: targetBtn.getAttribute("data-jumlah-mhs")
      };
      
      // Kirim objek data ke fungsi penampil modal
      openViewModal(dataDetail);
    }
  });

  // Tombol X / Close Modal View klik handler
  btnCloseView?.addEventListener("click", closeViewModal);

  // Klik di luar card modal untuk menutup popup otomatis
  modalView.addEventListener("click", (e) => {
    if (e.target === modalView) closeViewModal();
  });
}