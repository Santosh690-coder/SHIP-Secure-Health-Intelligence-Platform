window.SHIPAdminDashboard = {
  state: {
    admin: null,
    patients: [],
    doctors: [],
    appointments: [],
    reports: [],
    messages: [],
    alerts: []
  },

  async init() {
    const user = window.SHIPSession?.requireAuth?.(["admin"]);
    if (!user) return;

    window.SHIPSession?.hydrateUser?.("#adminName", "#adminRole");

    const logoutBtn = document.getElementById("adminLogoutBtn");
    const logoutLink = document.getElementById("adminLogoutLink");
    if (logoutBtn) logoutBtn.addEventListener("click", () => window.SHIPSession.logout());
    if (logoutLink) {
      logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        window.SHIPSession.logout();
      });
    }

    this.bindActions();
    await this.loadData();
  },

  async loadData() {
    try {
      const response = await fetch("data/admin-dashboard.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load admin dashboard data");
      const data = await response.json();
      this.state = data;
      this.render();
    } catch (error) {
      this.renderError(error);
    }
  },

  render() {
    this.setText("totalPatientsCount", this.state.patients?.length ?? 0);
    this.setText("totalDoctorsCount", this.state.doctors?.length ?? 0);
    this.setText(
      "pendingAppointmentsCount",
      this.state.appointments?.filter(a => a.status === "pending").length ?? 0
    );
    this.setText("openAlertsCount", this.state.alerts?.filter(a => a.status !== "resolved").length ?? 0);

    this.renderPatients();
    this.renderDoctors();
    this.renderAppointments();
    this.renderReports();
    this.renderMessages();
    this.renderAlerts();
  },

  renderPatients() {
    const el = document.getElementById("patientsPanelBody");
    if (!el) return;

    const items = this.state.patients || [];
    if (!items.length) {
      el.innerHTML = "<p>No patients found.</p>";
      return;
    }

    el.innerHTML = `
      <div class="data-list">
        ${items.slice(0, 8).map(item => `
          <article class="data-row">
            <div>
              <strong>${this.escape(item.name || "Patient")}</strong>
              <p>${this.escape(item.department || "")} • ${this.escape(item.status || "")}</p>
            </div>
            <button class="btn btn-ghost" type="button" data-patient-id="${this.escape(item.id || "")}">Open</button>
          </article>
        `).join("")}
      </div>
    `;

    el.querySelectorAll("[data-patient-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-patient-id");
        window.location.href = `patients.html?id=${encodeURIComponent(id)}`;
      });
    });
  },

  renderDoctors() {
    const el = document.getElementById("doctorsPanelBody");
    if (!el) return;

    const items = this.state.doctors || [];
    if (!items.length) {
      el.innerHTML = "<p>No doctors found.</p>";
      return;
    }

    el.innerHTML = `
      <div class="data-list">
        ${items.slice(0, 8).map(item => `
          <article class="data-row">
            <div>
              <strong>${this.escape(item.name || "Doctor")}</strong>
              <p>${this.escape(item.specialty || "")} • ${this.escape(item.availability || "")}</p>
            </div>
            <button class="btn btn-ghost" type="button" data-doctor-id="${this.escape(item.id || "")}">Open</button>
          </article>
        `).join("")}
      </div>
    `;

    el.querySelectorAll("[data-doctor-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-doctor-id");
        window.location.href = `doctor_dashboard.html?id=${encodeURIComponent(id)}`;
      });
    });
  },

  renderAppointments() {
    const el = document.getElementById("appointmentsPanelBody");
    if (!el) return;

    const items = this.state.appointments || [];
    if (!items.length) {
      el.innerHTML = "<p>No appointments available.</p>";
      return;
    }

    el.innerHTML = `
      <div class="data-list">
        ${items.slice(0, 8).map(item => `
          <article class="data-row">
            <div>
              <strong>${this.escape(item.patient || "Patient")}</strong>
              <p>${this.escape(item.date || "")} ${this.escape(item.time || "")}</p>
            </div>
            <span class="status ${this.escape(item.status || "pending")}">${this.escape(item.status || "pending")}</span>
          </article>
        `).join("")}
      </div>
    `;
  },

  renderReports() {
    const el = document.getElementById("reportsPanelBody");
    if (!el) return;

    const items = this.state.reports || [];
    if (!items.length) {
      el.innerHTML = "<p>No reports available.</p>";
      return;
    }

    el.innerHTML = `
      <div class="data-list">
        ${items.slice(0, 8).map(item => `
          <article class="data-row">
            <div>
              <strong>${this.escape(item.title || "Report")}</strong>
              <p>${this.escape(item.patient || "")} • ${this.escape(item.date || "")}</p>
            </div>
            <button class="btn btn-ghost" type="button" data-report-id="${this.escape(item.id || "")}">Review</button>
          </article>
        `).join("")}
      </div>
    `;

    el.querySelectorAll("[data-report-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-report-id");
        window.location.href = `reports-admin.html?id=${encodeURIComponent(id)}`;
      });
    });
  },

  renderMessages() {
    const el = document.getElementById("messagesPanelBody");
    if (!el) return;

    const items = this.state.messages || [];
    if (!items.length) {
      el.innerHTML = "<p>No messages available.</p>";
      return;
    }

    el.innerHTML = `
      <div class="data-list">
        ${items.slice(0, 8).map(item => `
          <article class="data-row">
            <div>
              <strong>${this.escape(item.sender || "User")}</strong>
              <p>${this.escape(item.preview || "")}</p>
            </div>
            <span class="status ${item.read ? "read" : "unread"}">${item.read ? "Read" : "Unread"}</span>
          </article>
        `).join("")}
      </div>
    `;
  },

  renderAlerts() {
    const el = document.getElementById("alertsPanelBody");
    if (!el) return;

    const items = this.state.alerts || [];
    if (!items.length) {
      el.innerHTML = "<p>No alerts at the moment.</p>";
      return;
    }

    el.innerHTML = `
      <div class="data-list">
        ${items.slice(0, 8).map(item => `
          <article class="data-row">
            <div>
              <strong>${this.escape(item.title || "Alert")}</strong>
              <p>${this.escape(item.message || "")}</p>
            </div>
            <span class="status ${this.escape(item.status || "open")}">${this.escape(item.status || "open")}</span>
          </article>
        `).join("")}
      </div>
    `;
  },

  bindActions() {
    const patientsBtn = document.getElementById("managePatientsBtn");
    const doctorsBtn = document.getElementById("manageDoctorsBtn");
    const appointmentsBtn = document.getElementById("viewAppointmentsBtn");
    const reportsBtn = document.getElementById("reviewReportsBtn");
    const messagesBtn = document.getElementById("openMessagesBtn");

    if (patientsBtn) patientsBtn.addEventListener("click", () => window.location.href = "patients.html");
    if (doctorsBtn) doctorsBtn.addEventListener("click", () => window.location.href = "doctor_dashboard.html");
    if (appointmentsBtn) appointmentsBtn.addEventListener("click", () => window.location.href = "appointments-admin.html");
    if (reportsBtn) reportsBtn.addEventListener("click", () => window.location.href = "reports-admin.html");
    if (messagesBtn) messagesBtn.addEventListener("click", () => window.location.href = "messages-admin.html");
  },

  renderError(error) {
    ["totalPatientsCount", "totalDoctorsCount", "pendingAppointmentsCount", "openAlertsCount"].forEach((id) => {
      this.setText(id, "--");
    });

    ["patientsPanelBody", "doctorsPanelBody", "appointmentsPanelBody", "reportsPanelBody", "messagesPanelBody", "alertsPanelBody"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = "<p>Unable to load data.</p>";
    });

    console.error(error);
  },

  setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  },

  escape(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.SHIPAdminDashboard.init();
});