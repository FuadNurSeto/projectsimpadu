// Script untuk toggle sembunyi/lihat password
document.querySelectorAll(".toggle-pwd").forEach((icon) => {
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

// Penanganan form submit
document
  .getElementById("registerForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Pendaftaran Berhasil! (Ini hanya simulasi)");
  });
