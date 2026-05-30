window.DoctorAppointments = {
  state: {
    appointments: [],
    filtered: [],
    selected: null
  },

  init() {
    this.cache();
    this.bind();
    this.load();
  },

  cache() {
    this.listEl = document.getElementById("doctorAppointmentsList");
    this.detailsEl = document.getElementById("doctorAppointmentDetails");
    this.refreshBtn = document.getElementById("refreshAppointmentsBtn");
    this.filterForm = document.getElementById("appointmentFilterForm");
    this.dateFilter = document.getElementById("appointmentDateFilter");
    this.statusFilter = document.getElementById("appointmentStatusFilter");
    this.patientFilter = document.getElementById("appointmentPatientFilter");
    this.todayCount = document.getElementById("todayAppointmentsCount");
    this.upcomingCount = document.getElementById("upcomingAppointmentsCount");
    this.completedCount = document.getElementById("completedAppointmentsCount");
    this.cancelledCount = document.getElementById("cancelledAppointmentsCount");
    this.markCompleteBtn = document.getElementById("markCompleteBtn");
    this.rescheduleBtn = document.getElementById("rescheduleBtn");
    this.cancelBtn = document.getElementById("cancelAppointmentBtn");
    this.reminderBtn = document.getElementById("sendReminderBtn");
  },

  bind() {
    if (this.refreshBtn) this.refreshBtn.addEventListener("click", () => this.load());
    if (this.filterForm) {
      this.filterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.applyFilters();
      });
      this.filterForm.addEventListener("reset", () => {
        setTimeout(() => this.applyFilters(true), 0);
      });
    }

    [this.dateFilter, this.statusFilter, this.patientFilter].forEach((el) => {
      if (el) el.addEventListener("input", () => this.applyFilters());
      if (el) el.addEventListener("change", () => this.applyFilters());
    });

    if (this.markCompleteBtn) this.markCompleteBtn.addEventListener("click", () => this.updateSelectedStatus("completed"));
    if (this.rescheduleBtn) this.rescheduleBtn.addEventListener("click", () => this.quickAction("reschedule"));
    if (this.cancelBtn) this.cancelBtn.addEventListener("click", () => this.updateSelectedStatus("cancelled"));
    if (this.reminderBtn) this.reminderBtn.addEventListener("click", () => this.quickAction("reminder"));
  },

  async load() {
    if (this.listEl) this.listEl.innerHTML = "<p>Loading appointments...</p>";

    try {
      const res = await fetch("/api/doctor/appointments");
      if (!res.ok) throw new Error("Failed to load appointments");
      const data = await res.json();
      this.state.appointments = Array.isArray(data.appointments) ? data.appointments : [];
    } catch (error) {
      this.state.appointments = this.sampleData();
      console.error(error);
    }

    this.applyFilters(true);
  },

  applyFilters(skipInputs = false) {
    const dateVal = skipInputs ? "" : (this.dateFilter?.value || "");
    const statusVal = skipInputs ? "" : (this.statusFilter?.value || "");
    const patientVal = skipInputs ? "" : (this.patientFilter?.value || "").toLowerCase().trim();

    this.state.filtered = this.state.appointments.filter((item) => {
      const matchesDate = !dateVal || item.date === dateVal;
      const matchesStatus = !statusVal || item.status === statusVal;
      const matchesPatient = !patientVal || `${item.patientName} ${item.patientId}`.toLowerCase().includes(patientVal);
      return matchesDate && matchesStatus && matchesPatient;
    });

    this.renderList();
    this.updateCounts();
    if (!this.state.selected && this.state.filtered.length) {
      this.select(this.state.filtered[0].id);
    } else if (this.state.selected) {
      const stillExists = this.state.filtered.find((x) => x.id === this.state.selected.id);
      if (stillExists) this.select(stillExists.id, true);
      else this.clearDetails();
    }
  },

  renderList() {
    if (!this.listEl) return;

    if (!this.state.filtered.length) {
      this.listEl.innerHTML = "<p>No appointments found.</p>";
      return;
    }

    this.listEl.innerHTML = this.state.filtered.map((item) => `
      <button class="data-row ${this.state.selected?.id === item.id ? "active" : ""}" data-id="${item.id}" type="button">
        <div>
          <strong>${this.escape(item.patientName)}</strong>
          <p>${this.escape(item.reason || "General consultation")}</p>
        </div>
        <div class="row-meta">
          <span>${this.escape(item.date)} ${this.escape(item.time)}</span>
          <small>${this.escape(item.status)}</small>
        </div>
      </button>
    `).join("");

    this.listEl.querySelectorAll("[data-id]").forEach((btn) => {
      btn.addEventListener("click", () => this.select(btn.getAttribute("data-id")));
    });
  },

  updateCounts() {
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = this.state.appointments.filter((x) => x.status === "scheduled" && x.date >= today).length;
    const completed = this.state.appointments.filter((x) => x.status === "completed").length;
    const cancelled = this.state.appointments.filter((x) => x.status === "cancelled").length;
    const todayCount = this.state.appointments.filter((x) => x.date === today).length;

    if (this.todayCount) this.todayCount.textContent = todayCount;
    if (this.upcomingCount) this.upcomingCount.textContent = upcoming;
    if (this.completedCount) this.completedCount.textContent = completed;
    if (this.cancelledCount) this.cancelledCount.textContent = cancelled;
  },

  select(id, silent = false) {
    const item = this.state.filtered.find((x) => String(x.id) === String(id));
    if (!item) return;
    this.state.selected = item;
    this.renderList();
    this.renderDetails(item);
    if (!silent) this.flashSelected(item);
  },

  renderDetails(item) {
    if (!this.detailsEl) return;

    this.detailsEl.innerHTML = `
      <div class="detail-card">
        <h3>${this.escape(item.patientName)}</h3>
        <p><strong>Patient ID:</strong> ${this.escape(item.patientId || "-")}</p>
        <p><strong>Date:</strong> ${this.escape(item.date)}</p>
        <p><strong>Time:</strong> ${this.escape(item.time)}</p>
        <p><strong>Status:</strong> ${this.escape(item.status)}</p>
        <p><strong>Type:</strong> ${this.escape(item.type || "-")}</p>
        <p><strong>Reason:</strong> ${this.escape(item.reason || "-")}</p>
        <p><strong>Notes:</strong> ${this.escape(item.notes || "-")}</p>
        <p><strong>Location:</strong> ${this.escape(item.location || "-")}</p>
      </div>
    `;
  },

  clearDetails() {
    if (this.detailsEl) this.detailsEl.innerHTML = "<p>Select an appointment to view details.</p>";
    this.state.selected = null;
    this.renderList();
  },

  async updateSelectedStatus(status) {
    if (!this.state.selected) return alert("Select an appointment first.");
    this.state.selected.status = status;
    this.syncLocalSelection();
    this.renderList();
    this.renderDetails(this.state.selected);

    try {
      await fetch(`/api/doctor/appointments/${this.state.selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error(error);
    }
  },

  quickAction(action) {
    if (!this.state.selected) return alert("Select an appointment first.");
    if (action === "reschedule") alert("Open reschedule modal or page here.");
    if (action === "reminder") alert("Send reminder workflow here.");
  },

  syncLocalSelection() {
    const idx = this.state.appointments.findIndex((x) => String(x.id) === String(this.state.selected?.id));
    if (idx >= 0) this.state.appointments[idx] = { ...this.state.selected };
  },

  flashSelected() {},

  

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
  window.DoctorAppointments.init();
});