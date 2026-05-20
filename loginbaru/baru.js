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
    const response = await fetch("http://localhost:8000/api/akademik/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      // Simpan token dan info user ke localStorage
      localStorage.setItem("token", result.token);
      localStorage.setItem("role_id", result.role_id);
      localStorage.setItem("user_id", result.id);

      alert("Login Berhasil!");

      // Arahkan halaman berdasarkan role_id jika diperlukan
      window.location.href = "../Dashboard/index.html";
    } else {
      // Tampilkan pesan error di banner merah, bukan pop-up alert bawaan browser
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
