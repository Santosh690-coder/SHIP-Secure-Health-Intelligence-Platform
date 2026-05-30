// session.js
const SHIPSession = (() => {
  const KEY = "ship_user";

  function setUser(user) {
    if (!user || typeof user !== "object") return;
    sessionStorage.setItem(KEY, JSON.stringify(user));
  }

  function getUser() {
    try {
      const raw = sessionStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function clearUser() {
    sessionStorage.removeItem(KEY);
  }

  function requireAuth(allowedRoles = []) {
    const user = getUser();
    if (!user) {
      window.location.href = "login.html";
      return null;
    }

    if (allowedRoles.length && !allowedRoles.includes(user.role)) {
      window.location.href = "index.html";
      return null;
    }

    return user;
  }

  function logout() {
    clearUser();
    window.location.href = "index.html";
  }

  function hydrateUser(nameSelector, roleSelector) {
    const user = getUser();
    if (!user) return;

    const nameEl = document.querySelector(nameSelector);
    const roleEl = document.querySelector(roleSelector);

    if (nameEl) nameEl.textContent = user.name || "User";
    if (roleEl) roleEl.textContent = user.role || "guest";
  }

  return {
    setUser,
    getUser,
    clearUser,
    requireAuth,
    logout,
    hydrateUser
  };
})();