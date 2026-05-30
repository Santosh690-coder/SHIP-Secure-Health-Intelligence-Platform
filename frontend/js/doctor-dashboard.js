// doctor-dashboard.js
document.addEventListener("DOMContentLoaded", () => {
  const user = window.SHIPSession.requireAuth(["doctor"]);
  if (!user) return;

  window.SHIPSession.hydrateUser("#doctorName", "#doctorRole");

  const logoutBtn = document.getElementById("doctorLogoutBtn");
  const logoutLink = document.getElementById("doctorLogoutLink");

  if (logoutBtn) logoutBtn.addEventListener("click", window.SHIPSession.logout);
  if (logoutLink) logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.SHIPSession.logout();
  });

  const doctorAppointments = document.getElementById("doctorAppointments");
  if (doctorAppointments) {
    doctorAppointments.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      const label = btn.textContent.trim().toLowerCase();
      if (label === "chat") alert("Open patient chat");
      if (label === "call") alert("Start voice call with patient");
      if (label === "video") alert("Start video consultation");
    });
  }
});