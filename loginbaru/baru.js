const togglePassword = document.querySelector("#togglePassword");
const passwordInput = document.querySelector("#password");
const loginForm = document.getElementById("loginForm");

// 1. Fungsi Toggle Password
togglePassword.addEventListener("click", function () {
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  this.classList.toggle("fa-eye");
  this.classList.toggle("fa-eye-slash");
});

// 2. Fungsi Hubungkan ke API Login dengan Banner Error
loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = passwordInput.value;
  const btnLogin = document.querySelector(".btn-login");
  const errorMessage = document.getElementById("error-message"); // Mengambil elemen alert merah

  // Sembunyikan pesan error setiap kali tombol submit ditekan ulang
  errorMessage.style.display = "none";

  // Loading state
  btnLogin.innerText = "Memproses...";
  btnLogin.disabled = true;

  try {
    const response = await fetch(
      "https://hurdle-tinkling-crazy.ngrok-free.dev/api/akademik/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      },
    );

    const result = await response.json();

    if (response.ok) {
      // 1. Ambil array role_ids dari response API
      const roles = result.role_ids;

      // 2. Validasi: Cek apakah user memiliki role 1 atau 2
      if (roles.includes(1) || roles.includes(2)) {
        // [PERBAIKAN UTAMA] Simpan data ke localStorage dengan format yang sinkron
        localStorage.setItem("token", result.token);

        // Membuat bungkus objek 'user' yang dinantikan oleh profil.html
        const userObj = {
          id: result.id,
          name: result.name,
          email: result.email,
        };
        localStorage.setItem("user", JSON.stringify(userObj));

        // Tetap pertahankan key lama ini jika halaman dashboard/akunrole kamu membutuhkannya
        localStorage.setItem("user_id", result.id);
        localStorage.setItem("name", result.name);
        localStorage.setItem("role_ids", JSON.stringify(result.role_ids));

        // Pengalihan halaman berdasarkan role masing-masing
        if (roles.includes(1)) {
          // Super Admin (role_id: 1)
          window.location.href = "../Dashboard/super_admin.html";
        } else if (roles.includes(2)) {
          // Admin Academic (role_id: 2)
          window.location.href = "../Dashboard/admin_akademik/index.html";
        }
      } else {
        // Jika user berhasil login di API tapi BUKAN Super Admin / Admin Akademik
        errorMessage.innerText =
          "Akses ditolak! Akun Anda tidak memiliki hak akses ke sistem ini.";
        errorMessage.style.display = "block";
      }
    } else {
      // Jika email atau password salah secara global di API
      errorMessage.innerText = "Email atau Kata Sandi salah. Silakan coba lagi";
      errorMessage.style.display = "block";
    }
  } catch (error) {
    console.error("Error:", error);
    // Tampilkan pesan error jaringan/server di banner merah
    errorMessage.innerText =
      "Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.";
    errorMessage.style.display = "block";
  } finally {
    btnLogin.innerText = "Masuk";
    btnLogin.disabled = false;
  }
});

const emailInput = document.getElementById("email");

// Validasi untuk Input Email
emailInput.addEventListener("invalid", function () {
  // Jika input kosong
  if (this.validity.valueMissing) {
    this.setCustomValidity("Email tidak boleh kosong!");
  }
  // Jika input diisi tapi formatnya bukan email (tidak ada @, dsb)
  else if (this.validity.typeMismatch) {
    this.setCustomValidity(
      "Format email tidak valid! Gunakan tanda '@' (Contoh: nama@domain.com)",
    );
  }
});

// Reset pesan error saat user mulai mengetik ulang
emailInput.addEventListener("input", function () {
  this.setCustomValidity("");
});

// Validasi untuk Input Password
passwordInput.addEventListener("invalid", function () {
  if (this.validity.valueMissing) {
    this.setCustomValidity("Kata sandi tidak boleh kosong!");
  }
});

passwordInput.addEventListener("input", function () {
  this.setCustomValidity("");
});
