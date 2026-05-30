window.SHIPPatientDashboard = {
  state: {
    patient: null,
    appointments: [],
    prescriptions: [],
    reports: [],
    messages: [],
    healthMonitor: null
  },

  async init() {
    const user = window.SHIPSession?.requireAuth?.(["patient"]);
    if (!user) return;

    window.SHIPSession?.hydrateUser?.("#patientName", "#patientRole");

    const logoutBtn = document.getElementById("patientLogoutBtn");
    const logoutLink = document.getElementById("patientLogoutLink");
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
      const response = await fetch("data/patient-dashboard.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load patient dashboard data");
      const data = await response.json();
      this.state = data;
      this.render();
    } catch (error) {
      this.renderError(error);
    }
  },

  render() {
    this.setText("upcomingAppointmentsCount", this.state.appointments?.filter(a => a.status !== "cancelled").length ?? 0);
    this.setText("activePrescriptionsCount", this.state.prescriptions?.filter(p => p.status === "active").length ?? 0);
    this.setText("unreadMessagesCount", this.state.messages?.filter(m => !m.read).length ?? 0);
    this.setText("newReportsCount", this.state.reports?.filter(r => r.status === "new").length ?? 0);

    this.renderAppointments();
    this.renderPrescriptions();
    this.renderReports();
    this.renderMonitor();
    this.renderMessages();
    this.renderSettings();
  },

  renderAppointments() {
    const el = document.getElementById("appointmentsPanelBody");
    if (!el) return;

    const items = this.state.appointments || [];
    if (!items.length) {
      el.innerHTML = "<p>No appointments found.</p>";
      return;
    }

    el.innerHTML = `
      <div class="data-list">
        ${items.map(item => `
          <article class="data-row">
            <div>
              <strong>${this.escape(item.doctor || "Doctor")}</strong>
              <p>${this.escape(item.date || "")} ${this.escape(item.time || "")}</p>
            </div>
            <span class="status ${this.escape(item.status || "scheduled")}">${this.escape(item.status || "scheduled")}</span>
          </article>
        `).join("")}
      </div>
    `;
  },

  renderPrescriptions() {
    const el = document.getElementById("prescriptionsPanelBody");
    if (!el) return;

    const items = this.state.prescriptions || [];
    if (!items.length) {
      el.innerHTML = "<p>No prescriptions available.</p>";
      return;
    }

    el.innerHTML = `
      <div class="data-list">
        ${items.map(item => `
          <article class="data-row">
            <div>
              <strong>${this.escape(item.medicine || "Medicine")}</strong>
              <p>${this.escape(item.dosage || "")} • ${this.escape(item.frequency || "")}</p>
            </div>
            <span class="status ${this.escape(item.status || "active")}">${this.escape(item.status || "active")}</span>
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
        ${items.map(item => `
          <article class="data-row">
            <div>
              <strong>${this.escape(item.title || "Report")}</strong>
              <p>${this.escape(item.date || "")}</p>
            </div>
            <button class="btn btn-ghost" type="button" data-report-id="${this.escape(item.id || "")}">Open</button>
          </article>
        `).join("")}
      </div>
    `;

    el.querySelectorAll("[data-report-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-report-id");
        window.location.href = `reports.html?id=${encodeURIComponent(id)}`;
      });
    });
  },

  renderMonitor() {
    const el = document.getElementById("monitorPanelBody");
    if (!el) return;

    const monitor = this.state.healthMonitor;
    if (!monitor) {
      el.innerHTML = "<p>No health data available.</p>";
      return;
    }

    el.innerHTML = `
      <div class="monitor-grid">
        <div class="monitor-item"><span>BP</span><strong>${this.escape(monitor.bp || "--")}</strong></div>
        <div class="monitor-item"><span>Pulse</span><strong>${this.escape(monitor.pulse || "--")}</strong></div>
        <div class="monitor-item"><span>SpO2</span><strong>${this.escape(monitor.spo2 || "--")}</strong></div>
        <div class="monitor-item"><span>Weight</span><strong>${this.escape(monitor.weight || "--")}</strong></div>
      </div>
    `;
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
        ${items.map(item => `
          <article class="data-row">
            <div>
              <strong>${this.escape(item.sender || "Care Team")}</strong>
              <p>${this.escape(item.preview || "")}</p>
            </div>
            <span class="status ${item.read ? "read" : "unread"}">${item.read ? "Read" : "Unread"}</span>
          </article>
        `).join("")}
      </div>
    `;
  },

  renderSettings() {
    const el = document.getElementById("settingsPanelBody");
    if (!el) return;

    el.innerHTML = `
      <div class="settings-summary">
        <p><strong>Name:</strong> ${this.escape(this.state.patient?.name || "Patient")}</p>
        <p><strong>Email:</strong> ${this.escape(this.state.patient?.email || "")}</p>
        <p><strong>Phone:</strong> ${this.escape(this.state.patient?.phone || "")}</p>
      </div>
    `;
  },

  bindActions() {
    const bookBtn = document.getElementById("bookAppointmentBtn");
    const uploadBtn = document.getElementById("uploadReportBtn");
    const messageBtn = document.getElementById("newMessageBtn");
    const viewPrescriptionsBtn = document.getElementById("viewPrescriptionsBtn");

    if (bookBtn) bookBtn.addEventListener("click", () => window.location.href = "appointments.html");
    if (uploadBtn) uploadBtn.addEventListener("click", () => window.location.href = "reports.html");
    if (messageBtn) messageBtn.addEventListener("click", () => window.location.href = "messages.html");
    if (viewPrescriptionsBtn) viewPrescriptionsBtn.addEventListener("click", () => window.location.href = "prescriptions.html");
  },

  renderError(error) {
    const targets = [
      "upcomingAppointmentsCount",
      "activePrescriptionsCount",
      "unreadMessagesCount",
      "newReportsCount"
    ];

    targets.forEach((id) => this.setText(id, "--"));

    ["appointmentsPanelBody", "prescriptionsPanelBody", "reportsPanelBody", "monitorPanelBody", "messagesPanelBody", "settingsPanelBody"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = `<p>Unable to load data.</p>`;
      }
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
  window.SHIPPatientDashboard.init();
});