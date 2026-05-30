// patient-dashboard.js
document.addEventListener("DOMContentLoaded", () => {
  const user = window.SHIPSession.requireAuth(["patient"]);
  if (!user) return;

  window.SHIPSession.hydrateUser("#patientName", "#patientRole");

  const logoutBtn = document.getElementById("patientLogoutBtn");
  const logoutLink = document.getElementById("logoutLink");

  if (logoutBtn) logoutBtn.addEventListener("click", window.SHIPSession.logout);
  if (logoutLink) logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.SHIPSession.logout();
  });

  const patientAppointments = document.getElementById("patientAppointments");
  if (patientAppointments) {
    patientAppointments.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      const label = btn.textContent.trim().toLowerCase();
      if (label === "chat") alert("Open appointment chat");
      if (label === "call") alert("Start voice call");
      if (label === "video") alert("Join video visit");
    });
  }
});