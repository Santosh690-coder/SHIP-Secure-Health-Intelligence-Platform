// admin-dashboard.js
document.addEventListener("DOMContentLoaded", () => {
  const user = window.SHIPSession.requireAuth(["admin"]);
  if (!user) return;

  window.SHIPSession.hydrateUser("#adminName", "#adminRole");

  const logoutBtn = document.getElementById("adminLogoutBtn");
  const logoutLink = document.getElementById("adminLogoutLink");

  if (logoutBtn) logoutBtn.addEventListener("click", window.SHIPSession.logout);
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.SHIPSession.logout();
    });
  }

  const dashboard = document.getElementById("dashboard");
  const panels = document.querySelectorAll(".panel");

  panels.forEach((panel) => {
    const button = panel.querySelector("button");
    if (button) {
      button.addEventListener("click", () => {
        const title = panel.querySelector("h2")?.textContent || "Section";
        alert(`Open admin action for ${title}`);
      });
    }
  });

  if (dashboard) {
    dashboard.addEventListener("click", () => {
      console.log("Admin dashboard clicked");
    });
  }
});