window.SHIPDoctorDashboard = {
  state: {
    doctor: null,
    patients: [],
    appointments: [],
    prescriptions: [],
    reports: [],
    messages: [],
    settings: null
  },

  async init() {
    const user = window.SHIPSession?.requireAuth?.(["doctor"]);
    if (!user) return;

    window.SHIPSession?.hydrateUser?.("#doctorName", "#doctorRole");

    const logoutBtn = document.getElementById("doctorLogoutBtn");
    const logoutLink = document.getElementById("doctorLogoutLink");
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
      const response = await fetch("data/doctor-dashboard.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load doctor dashboard data");
      const data = await response.json();
      this.state = data;
      this.render();
    } catch (error) {
      this.renderError(error);
    }
  },

  render() {
    this.setText("assignedPatientsCount", this.state.patients?.length ?? 0);
    this.setText(
      "todaysConsultationsCount",
      this.state.appointments?.filter(a => a.date === this.today()).length ?? 0
    );
    this.setText("pendingReportsCount", this.state.reports?.filter(r => r.status === "pending").length ?? 0);
    this.setText("unreadMessagesCount", this.state.messages?.filter(m => !m.read).length ?? 0);

    this.renderPatients();
    this.renderAppointments();
    this.renderPrescriptions();
    this.renderReports();
    this.renderMessages();
    this.renderSettings();
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
        ${items.map(item => `
          <article class="data-row">
            <div>
              <strong>${this.escape(item.name || "Patient")}</strong>
              <p>${this.escape(item.condition || "")}</p>
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
              <strong>${this.escape(item.patient || "Patient")}</strong>
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
      el.innerHTML = "<p>No prescriptions pending.</p>";
      return;
    }

    el.innerHTML = `
      <div class="data-list">
        ${items.map(item => `
          <article class="data-row">
            <div>
              <strong>${this.escape(item.patient || "Patient")}</strong>
              <p>${this.escape(item.medicine || "")}</p>
            </div>
            <button class="btn btn-ghost" type="button" data-prescription-id="${this.escape(item.id || "")}">Review</button>
          </article>
        `).join("")}
      </div>
    `;

    el.querySelectorAll("[data-prescription-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-prescription-id");
        window.location.href = `prescriptions-doctor.html?id=${encodeURIComponent(id)}`;
      });
    });
  },

  renderReports() {
    const el = document.getElementById("reportsPanelBody");
    if (!el) return;

    const items = this.state.reports || [];
    if (!items.length) {
      el.innerHTML = "<p>No reports pending review.</p>";
      return;
    }

    el.innerHTML = `
      <div class="data-list">
        ${items.map(item => `
          <article class="data-row">
            <div>
              <strong>${this.escape(item.title || "Report")}</strong>
              <p>${this.escape(item.patient || "")} • ${this.escape(item.date || "")}</p>
            </div>
            <button class="btn btn-ghost" type="button" data-report-id="${this.escape(item.id || "")}">Open</button>
          </article>
        `).join("")}
      </div>
    `;

    el.querySelectorAll("[data-report-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-report-id");
        window.location.href = `reports-doctor.html?id=${encodeURIComponent(id)}`;
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
        ${items.map(item => `
          <article class="data-row">
            <div>
              <strong>${this.escape(item.sender || "Patient")}</strong>
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
        <p><strong>Name:</strong> ${this.escape(this.state.doctor?.name || "Doctor")}</p>
        <p><strong>Specialty:</strong> ${this.escape(this.state.doctor?.specialty || "")}</p>
        <p><strong>Email:</strong> ${this.escape(this.state.doctor?.email || "")}</p>
      </div>
    `;
  },

  bindActions() {
    const addNoteBtn = document.getElementById("addNoteBtn");
    const scheduleBtn = document.getElementById("viewScheduleBtn");
    const prescriptionBtn = document.getElementById("writePrescriptionBtn");
    const reviewReportsBtn = document.getElementById("reviewReportsBtn");
    const replyMessageBtn = document.getElementById("replyMessageBtn");

    if (addNoteBtn) addNoteBtn.addEventListener("click", () => window.location.href = "patients.html");
    if (scheduleBtn) scheduleBtn.addEventListener("click", () => window.location.href = "appointments-doctor.html");
    if (prescriptionBtn) prescriptionBtn.addEventListener("click", () => window.location.href = "prescriptions-doctor.html");
    if (reviewReportsBtn) reviewReportsBtn.addEventListener("click", () => window.location.href = "reports-doctor.html");
    if (replyMessageBtn) replyMessageBtn.addEventListener("click", () => window.location.href = "messages-doctor.html");
  },

  renderError(error) {
    ["assignedPatientsCount", "todaysConsultationsCount", "pendingReportsCount", "unreadMessagesCount"].forEach((id) => {
      this.setText(id, "--");
    });

    ["patientsPanelBody", "appointmentsPanelBody", "prescriptionsPanelBody", "reportsPanelBody", "messagesPanelBody", "settingsPanelBody"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = "<p>Unable to load data.</p>";
    });

    console.error(error);
  },

  today() {
    return new Date().toISOString().slice(0, 10);
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
  window.SHIPDoctorDashboard.init();
});