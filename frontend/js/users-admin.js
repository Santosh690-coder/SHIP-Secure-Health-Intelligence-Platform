window.AdminUsers = {
  state: {
    users: [],
    filtered: [],
    selected: null
  },

  init() {
    this.cache();
    this.bind();
    this.loadUsers();
  },

  cache() {
    this.refreshBtn = document.getElementById("refreshUsersBtn");
    this.filterForm = document.getElementById("usersFilterForm");
    this.searchInput = document.getElementById("userSearch");
    this.roleFilter = document.getElementById("userRoleFilter");
    this.statusFilter = document.getElementById("userStatusFilter");
    this.listEl = document.getElementById("usersList");
    this.form = document.getElementById("userEditForm");
    this.clearEditBtn = document.getElementById("clearEditBtn");
    this.idInput = document.getElementById("editUserId");
    this.nameInput = document.getElementById("editUserName");
    this.emailInput = document.getElementById("editUserEmail");
    this.roleInput = document.getElementById("editUserRole");
    this.statusInput = document.getElementById("editUserStatus");
  },

  bind() {
    if (this.refreshBtn) this.refreshBtn.addEventListener("click", () => this.loadUsers());

    if (this.filterForm) {
      this.filterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.applyFilters();
      });
      this.filterForm.addEventListener("reset", () => {
        setTimeout(() => this.applyFilters(true), 0);
      });
    }

    [this.searchInput, this.roleFilter, this.statusFilter].forEach((el) => {
      if (el) {
        el.addEventListener("input", () => this.applyFilters());
        el.addEventListener("change", () => this.applyFilters());
      }
    });

    if (this.listEl) {
      this.listEl.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-user-id]");
        if (!btn) return;

        const id = btn.getAttribute("data-user-id");
        const action = e.target.closest("[data-action]")?.getAttribute("data-action");

        if (action === "edit") this.selectUser(id);
        if (action === "delete") this.deleteUser(id);
        if (!action) this.selectUser(id);
      });
    }

    if (this.form) {
      this.form.addEventListener("submit", (e) => this.updateUser(e));
    }

    if (this.clearEditBtn) {
      this.clearEditBtn.addEventListener("click", () => this.clearForm());
    }
  },

  async loadUsers() {
    if (this.listEl) this.listEl.innerHTML = "<p>Loading users...</p>";

    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      this.state.users = Array.isArray(data.users) ? data.users : [];
      this.applyFilters(true);
    } catch (error) {
      console.error(error);
      this.state.users = [];
      this.state.filtered = [];
      if (this.listEl) this.listEl.innerHTML = "<p>Unable to load users.</p>";
      this.renderCounts();
    }
  },

  applyFilters(skipText = false) {
    const search = skipText ? "" : (this.searchInput?.value || "").toLowerCase().trim();
    const role = skipText ? "" : (this.roleFilter?.value || "");
    const status = skipText ? "" : (this.statusFilter?.value || "");

    this.state.filtered = this.state.users.filter((u) => {
      const name = String(u.name || u.fullName || "").toLowerCase();
      const email = String(u.email || "").toLowerCase();
      const uRole = String(u.role || "").toLowerCase();
      const uStatus = String(u.status || "").toLowerCase();

      const matchesSearch = !search || name.includes(search) || email.includes(search);
      const matchesRole = !role || uRole === role.toLowerCase();
      const matchesStatus = !status || uStatus === status.toLowerCase();

      return matchesSearch && matchesRole && matchesStatus;
    });

    this.renderList();
    this.renderCounts();

    if (this.state.filtered.length && !this.state.selected) {
      this.selectUser(this.state.filtered[0]._id || this.state.filtered[0].id, true);
    }
  },

  renderList() {
    if (!this.listEl) return;

    if (!this.state.filtered.length) {
      this.listEl.innerHTML = "<p>No users found.</p>";
      return;
    }

    this.listEl.innerHTML = this.state.filtered.map((u) => {
      const id = u._id || u.id;
      const active = this.state.selected && String((this.state.selected._id || this.state.selected.id)) === String(id);
      return `
        <div class="data-row ${active ? "active" : ""}" data-user-id="${this.escape(id)}">
          <div>
            <strong>${this.escape(u.name || "Unnamed User")}</strong>
            <p>${this.escape(u.email || "-")}</p>
            <small>Role: ${this.escape(u.role || "-")} • Status: ${this.escape(u.status || "-")}</small>
          </div>
          <div class="row-actions">
            <button type="button" class="btn btn-ghost" data-action="edit">Edit</button>
            <button type="button" class="btn btn-danger" data-action="delete">Delete</button>
          </div>
        </div>
      `;
    }).join("");
  },

  renderCounts() {
    const total = this.state.users.length;
    const admins = this.state.users.filter((u) => String(u.role || "").toLowerCase() === "admin").length;
    const active = this.state.users.filter((u) => String(u.status || "").toLowerCase() === "active").length;
    const disabled = this.state.users.filter((u) => String(u.status || "").toLowerCase() === "disabled").length;

    this.setText("totalUsersCount", total);
    this.setText("adminUsersCount", admins);
    this.setText("activeUsersCount", active);
    this.setText("disabledUsersCount", disabled);
  },

  selectUser(id, silent = false) {
    const user = this.state.filtered.find((u) => String(u._id || u.id) === String(id));
    if (!user) return;
    this.state.selected = user;

    this.idInput.value = user._id || user.id || "";
    this.nameInput.value = user.name || "";
    this.emailInput.value = user.email || "";
    this.roleInput.value = user.role || "patient";
    this.statusInput.value = user.status || "active";

    this.renderList();
    if (!silent) this.form?.scrollIntoView({ behavior: "smooth", block: "start" });
  },

  clearForm() {
    this.state.selected = null;
    this.form?.reset();
    this.idInput.value = "";
    this.renderList();
  },

  async updateUser(e) {
    e.preventDefault();

    const id = this.idInput.value.trim();
    if (!id) {
      alert("Select a user first.");
      return;
    }

    const payload = {
      name: this.nameInput.value.trim(),
      email: this.emailInput.value.trim(),
      role: this.roleInput.value,
      status: this.statusInput.value
    };

    if (!payload.name || !payload.email) {
      alert("Name and email are required.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to update user");

      await this.loadUsers();
      this.clearForm();
      alert("User updated successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to update user.");
    }
  },

  async deleteUser(id) {
    if (!confirm("Delete this user?")) return;

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!res.ok) throw new Error("Failed to delete user");

      await this.loadUsers();
      if (this.state.selected && String(this.state.selected._id || this.state.selected.id) === String(id)) {
        this.clearForm();
      }
      alert("User deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to delete user.");
    }
  },

  setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  },

  escape(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.AdminUsers.init();
});