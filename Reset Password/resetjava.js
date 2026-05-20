// Fungsi untuk menampilkan/menyembunyikan password
const togglePasswordIcons = document.querySelectorAll(".toggle-password");

togglePasswordIcons.forEach((icon) => {
  icon.addEventListener("click", function () {
    const input = this.previousElementSibling;
    if (input.type === "password") {
      input.type = "text";
      this.classList.remove("fa-eye-slash");
      this.classList.add("fa-eye");
    } else {
      input.type = "password";
      this.classList.remove("fa-eye");
      this.classList.add("fa-eye-slash");
    }
  });
});

// Validasi sederhana saat form dikirim
document
  .getElementById("resetPasswordForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const pass = document.getElementById("password").value;
    const confirmPass = document.getElementById("confirmPassword").value;

    if (pass === "" || confirmPass === "") {
      alert("Harap isi semua field!");
      return;
    }

    if (pass !== confirmPass) {
      alert("Kata sandi tidak cocok!");
    } else {
      alert("Kata sandi berhasil diperbarui!");
    }
  });
