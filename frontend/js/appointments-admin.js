window.AdminAppointments = {
  state: {
    appointments: [],
    filtered: [],
    selected: null,
    patients: [],
    doctors: []
  },

  init() {
    this.cache();
    this.bind();
    this.loadAll();
  },

  cache() {
    this.listEl = document.getElementById("adminAppointmentsList");
    this.detailsEl = document.getElementById("adminAppointmentDetails");
    this.refreshBtn = document.getElementById("refreshAppointmentsBtn");
    this.filterForm = document.getElementById("appointmentFilterForm");
    this.dateFilter = document.getElementById("appointmentDateFilter");
    this.statusFilter = document.getElementById("appointmentStatusFilter");
    this.doctorFilter = document.getElementById("appointmentDoctorFilter");
    this.patientFilter = document.getElementById("appointmentPatientFilter");
    this.form = document.getElementById("appointmentForm");
    this.patientSelect = document.getElementById("appointmentPatient");
    this.doctorSelect = document.getElementById("appointmentDoctor");
    this.dateInput = document.getElementById("appointmentDate");
    this.timeInput = document.getElementById("appointmentTime");
    this.typeInput = document.getElementById("appointmentType");
    this.statusInput = document.getElementById("appointmentStatus");
    this.notesInput = document.getElementById("appointmentNotes");
  },

  bind() {
    if (this.refreshBtn) this.refreshBtn.addEventListener("click", () => this.loadAll());

    if (this.filterForm) {
      this.filterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.applyFilters();
      });
      this.filterForm.addEventListener("reset", () => {
        setTimeout(() => this.applyFilters(true), 0);
      });
    }

    [this.dateFilter, this.statusFilter, this.doctorFilter, this.patientFilter].forEach((el) => {
      if (el) {
        el.addEventListener("input", () => this.applyFilters());
        el.addEventListener("change", () => this.applyFilters());
      }
    });

    if (this.listEl) {
      this.listEl.addEventListener("click", (e) => {
        const row = e.target.closest("[data-id]");
        if (row) this.select(row.getAttribute("data-id"));
      });
    }

    if (this.form) {
      this.form.addEventListener("submit", (e) => this.submitAppointment(e));
    }
  },

  async loadAll() {
    if (this.listEl) this.listEl.innerHTML = "<p>Loading appointments...</p>";
    await Promise.all([this.loadPatients(), this.loadDoctors(), this.loadAppointments()]);
    this.applyFilters(true);
  },

  async loadAppointments() {
    try {
      const res = await fetch("/api/admin/appointments", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load appointments");
      const data = await res.json();
      this.state.appointments = Array.isArray(data.appointments) ? data.appointments : [];
    } catch (error) {
      console.error(error);
      this.state.appointments = [];
      if (this.listEl) this.listEl.innerHTML = "<p>Unable to load appointments.</p>";
    }
  },

  async loadPatients() {
    try {
      const res = await fetch("/api/admin/patients", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load patients");
      const data = await res.json();
      this.state.patients = Array.isArray(data.patients) ? data.patients : [];
    } catch (error) {
      console.error(error);
      this.state.patients = [];
    }

    if (this.patientSelect) {
      this.patientSelect.innerHTML =
        `<option value="">Select patient</option>` +
        this.state.patients.map((p) => {
          const id = p._id || p.id;
          return `<option value="${this.escape(id)}">${this.escape(p.name)} (${this.escape(p.patientId || id)})</option>`;
        }).join("");
    }
  },

  async loadDoctors() {
    try {
      const res = await fetch("/api/admin/doctors", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load doctors");
      const data = await res.json();
      this.state.doctors = Array.isArray(data.doctors) ? data.doctors : [];
    } catch (error) {
      console.error(error);
      this.state.doctors = [];
    }

    const options =
      `<option value="">Select doctor</option>` +
      this.state.doctors.map((d) => {
        const id = d._id || d.id;
        return `<option value="${this.escape(id)}">${this.escape(d.name)}${d.specialization ? ` - ${this.escape(d.specialization)}` : ""}</option>`;
      }).join("");

    if (this.doctorSelect) this.doctorSelect.innerHTML = options;
    if (this.doctorFilter) this.doctorFilter.innerHTML = `<option value="">All Doctors</option>` + this.state.doctors.map((d) => {
      const id = d._id || d.id;
      return `<option value="${this.escape(id)}">${this.escape(d.name)}</option>`;
    }).join("");
  },

  applyFilters(skipInputs = false) {
    const dateVal = skipInputs ? "" : (this.dateFilter?.value || "");
    const statusVal = skipInputs ? "" : (this.statusFilter?.value || "");
    const doctorVal = skipInputs ? "" : (this.doctorFilter?.value || "");
    const patientVal = skipInputs ? "" : (this.patientFilter?.value || "").toLowerCase().trim();

    this.state.filtered = this.state.appointments.filter((a) => {
      const itemDate = String(a.date || a.appointmentDate || "").slice(0, 10);
      const matchesDate = !dateVal || itemDate === dateVal;
      const matchesStatus = !statusVal || String(a.status || "").toLowerCase() === statusVal.toLowerCase();
      const matchesDoctor = !doctorVal || String(a.doctorId || a.doctor?._id || a.doctor?.id || "") === String(doctorVal);
      const blob = `${a.patientName || ""} ${a.patientId || ""}`.toLowerCase();
      const matchesPatient = !patientVal || blob.includes(patientVal);
      return matchesDate && matchesStatus && matchesDoctor && matchesPatient;
    });

    this.renderList();
    this.renderCounts();

    if (this.state.filtered.length) {
      const current = this.state.selected && this.state.filtered.find((x) => String(x._id || x.id) === String(this.state.selected._id || this.state.selected.id));
      if (current) this.select(current._id || current.id, true);
      else this.select(this.state.filtered[0]._id || this.state.filtered[0].id, true);
    } else {
      this.clearDetails();
    }
  },

  renderList() {
    if (!this.listEl) return;

    if (!this.state.filtered.length) {
      this.listEl.innerHTML = "<p>No appointments found.</p>";
      return;
    }

    this.listEl.innerHTML = this.state.filtered.map((a) => {
      const id = a._id || a.id;
      const active = this.state.selected && String(this.state.selected._id || this.state.selected.id) === String(id);
      return `
        <button type="button" class="data-row ${active ? "active" : ""}" data-id="${this.escape(id)}">
          <div>
            <strong>${this.escape(a.patientName || "Unknown Patient")}</strong>
            <p>${this.escape(a.doctorName || "Unknown Doctor")} • ${this.escape(a.type || "appointment")}</p>
          </div>
          <div class="row-meta">
            <span>${this.escape(String(a.date || a.appointmentDate || "").slice(0, 10))}</span>
            <small>${this.escape(a.status || "scheduled")}</small>
          </div>
        </button>
      `;
    }).join("");
  },

  renderCounts() {
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = this.state.appointments.filter((a) => String(a.date || a.appointmentDate || "").slice(0, 10) === today).length;
    const upcomingCount = this.state.appointments.filter((a) => {
      const d = String(a.date || a.appointmentDate || "").slice(0, 10);
      return d > today && String(a.status || "").toLowerCase() === "scheduled";
    }).length;
    const completedCount = this.state.appointments.filter((a) => String(a.status || "").toLowerCase() === "completed").length;
    const cancelledCount = this.state.appointments.filter((a) => String(a.status || "").toLowerCase() === "cancelled").length;

    this.setText("todayAppointmentsCount", todayCount);
    this.setText("upcomingAppointmentsCount", upcomingCount);
    this.setText("completedAppointmentsCount", completedCount);
    this.setText("cancelledAppointmentsCount", cancelledCount);
  },

  select(id, silent = false) {
    const item = this.state.filtered.find((a) => String(a._id || a.id) === String(id));
    if (!item) return;
    this.state.selected = item;
    this.renderList();
    this.renderDetails(item);
    if (!silent) this.scrollToDetails();
  },

  renderDetails(a) {
    if (!this.detailsEl) return;

    this.detailsEl.innerHTML = `
      <div class="detail-card">
        <h3>${this.escape(a.type || "Appointment")}</h3>
        <p><strong>Patient:</strong> ${this.escape(a.patientName || "-")}</p>
        <p><strong>Doctor:</strong> ${this.escape(a.doctorName || "-")}</p>
        <p><strong>Date:</strong> ${this.escape(String(a.date || a.appointmentDate || "").slice(0, 10))}</p>
        <p><strong>Time:</strong> ${this.escape(a.time || "-")}</p>
        <p><strong>Status:</strong> ${this.escape(a.status || "-")}</p>
        <p><strong>Notes:</strong> ${this.escape(a.notes || "-")}</p>
      </div>
    `;
  },

  clearDetails() {
    if (this.detailsEl) this.detailsEl.innerHTML = "<p>Select an appointment to view details.</p>";
    this.state.selected = null;
    this.renderList();
  },

  async submitAppointment(e) {
    e.preventDefault();

    const payload = {
      patientId: this.patientSelect?.value || "",
      doctorId: this.doctorSelect?.value || "",
      date: this.dateInput?.value || "",
      time: this.timeInput?.value || "",
      type: this.typeInput?.value || "consultation",
      status: this.statusInput?.value || "scheduled",
      notes: this.notesInput?.value?.trim() || ""
    };

    if (!payload.patientId || !payload.doctorId || !payload.date || !payload.time) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const res = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to create appointment");

      this.form.reset();
      await this.loadAppointments();
      this.applyFilters(true);
      alert("Appointment saved successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to save appointment.");
    }
  },

  scrollToDetails() {
    this.detailsEl?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  window.AdminAppointments.init();
});