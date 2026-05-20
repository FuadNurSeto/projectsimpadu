document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  // Validasi sederhana
  if (email === "admin@gmail.com" && password === "12345") {
    alert("Login berhasil!");
    window.location.href = "dashboard.html"; // arahkan ke halaman lain
  } else {
    alert("Email atau password salah!");
  }
});
