window.SHIPLogout = {
  clearSession() {
    try {
      if (window.SHIPSession && typeof window.SHIPSession.logout === "function") {
        window.SHIPSession.logout();
      } else {
        sessionStorage.clear();
        localStorage.clear();
      }
    } catch (error) {
      console.error("Logout cleanup failed:", error);
    }
  },

  redirect(target = "logout.html") {
    window.location.replace(target);
  },

  handleLogout(e) {
    if (e) e.preventDefault();
    this.clearSession();
    this.redirect("logout.html");
  },

  bind() {
    const selectors = [
      "[data-logout]",
      "#patientLogoutBtn",
      "#patientLogoutLink",
      "#doctorLogoutBtn",
      "#doctorLogoutLink",
      "#adminLogoutBtn",
      "#adminLogoutLink"
    ];

    document.querySelectorAll(selectors.join(",")).forEach((el) => {
      el.addEventListener("click", (e) => this.handleLogout(e));
    });
  },

  logoutNow() {
    this.clearSession();
    this.redirect("logout.html");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.SHIPLogout.bind();
});