// auth.js
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    SHIPForms.submitWithValidation(loginForm, SHIPValidation.validateLogin, () => {
      const role = loginForm.querySelector('[name="role"]').value;
      const email = loginForm.querySelector('[name="email"]').value;

      SHIPSession.setUser({
        role,
        name: email.split("@")[0],
        email
      });

      SHIPNotify.success("Login successful.");

      if (role === "patient") window.location.href = "patient_dashboard.html";
      else if (role === "doctor") window.location.href = "doctor_dashboard.html";
      else if (role === "admin") window.location.href = "admin_dashboard.html";
      else window.location.href = "index.html";
    });
  }

  if (registerForm) {
    SHIPForms.submitWithValidation(registerForm, SHIPValidation.validateRegister, () => {
      const role = registerForm.querySelector('[name="role"]').value;
      const fullName = registerForm.querySelector('[name="fullName"]').value;
      const email = registerForm.querySelector('[name="email"]').value;

      SHIPSession.setUser({
        role,
        name: fullName,
        email
      });

      SHIPNotify.success("Registration successful.");

      if (role === "patient") window.location.href = "patient_dashboard.html";
      else if (role === "doctor") window.location.href = "doctor_dashboard.html";
      else if (role === "admin") window.location.href = "admin_dashboard.html";
      else window.location.href = "index.html";
    });
  }
});