document.querySelectorAll(".toggle-password").forEach((icon) => {
  icon.addEventListener("click", function () {
    const passwordInput = this.previousElementSibling;

    // Toggle tipe input
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      this.classList.replace("fa-eye-slash", "fa-eye");
    } else {
      passwordInput.type = "password";
      this.classList.replace("fa-eye", "fa-eye-slash");
    }
  });
});

// Penanganan submit form sederhana
document
  .getElementById("registerForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Pendaftaran sedang diproses!");
  });
