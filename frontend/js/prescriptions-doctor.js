window.DoctorPrescriptions = {
  state: {
    prescriptions: [],
    filtered: [],
    selected: null,
    patients: [],
    refillRequests: []
  },

  init() {
    this.cache();
    this.bind();
    this.load();
    this.loadPatients();
    this.loadRefills();
  },

  cache() {
    this.listEl = document.getElementById("doctorPrescriptionsList");
    this.detailsEl = document.getElementById("doctorPrescriptionDetails");
    this.refillListEl = document.getElementById("refillRequestsList");
    this.refreshBtn = document.getElementById("refreshPrescriptionsBtn");
    this.newBtn = document.getElementById("newPrescriptionBtn");
    this.form = document.getElementById("prescriptionForm");
    this.patientSelect = document.getElementById("prescriptionPatient");
    this.medicineInput = document.getElementById("prescriptionMedicine");
    this.dosageInput = document.getElementById("prescriptionDosage");
    this.durationInput = document.getElementById("prescriptionDuration");
    this.instructionsInput = document.getElementById("prescriptionInstructions");
  },

  bind() {
    if (this.refreshBtn) this.refreshBtn.addEventListener("click", () => this.load());
    if (this.newBtn) this.newBtn.addEventListener("click", () => this.form?.scrollIntoView({ behavior: "smooth", block: "start" }));

    if (this.form) {
      this.form.addEventListener("submit", (e) => this.submitPrescription(e));
    }

    if (this.listEl) {
      this.listEl.addEventListener("click", (e) => {
        const row = e.target.closest("[data-id]");
        if (row) this.select(row.getAttribute("data-id"));
      });
    }

    if (this.refillListEl) {
      this.refillListEl.addEventListener("click", (e) => {
        const actionBtn = e.target.closest("[data-refill-action]");
        if (!actionBtn) return;
        const id = actionBtn.getAttribute("data-refill-id");
        this.handleRefillAction(id, actionBtn.getAttribute("data-refill-action"));
      });
    }
  },

  async load() {
    if (this.listEl) this.listEl.innerHTML = "<p>Loading prescriptions...</p>";

    try {
      const res = await fetch("/api/doctor/prescriptions");
      if (!res.ok) throw new Error("Failed to load prescriptions");
      const data = await res.json();
      this.state.prescriptions = Array.isArray(data.prescriptions) ? data.prescriptions : [];
    } catch (error) {
      this.state.prescriptions = this.sampleData();
      console.error(error);
    }

    this.state.filtered = [...this.state.prescriptions];
    this.renderList();
    this.updateCounts();

    if (this.state.filtered.length && !this.state.selected) this.select(this.state.filtered[0].id);
  },

  async loadPatients() {
    if (!this.patientSelect) return;

    try {
      const res = await fetch("/api/doctor/patients");
      if (!res.ok) throw new Error("Failed to load patients");
      const data = await res.json();
      this.state.patients = Array.isArray(data.patients) ? data.patients : [];
    } catch (error) {
      this.state.patients = [
        { id: "P-1001", name: "Aman Kumar" },
        { id: "P-1002", name: "Riya Singh" },
        { id: "P-1003", name: "Neha Verma" }
      ];
      console.error(error);
    }

    this.patientSelect.innerHTML = `<option value="">Select patient</option>` + this.state.patients.map((p) => `
      <option value="${this.escape(p.id)}">${this.escape(p.name)} (${this.escape(p.id)})</option>
    `).join("");
  },

  async loadRefills() {
    if (this.refillListEl) this.refillListEl.innerHTML = "<p>Loading refill requests...</p>";

    try {
      const res = await fetch("/api/doctor/refill-requests");
      if (!res.ok) throw new Error("Failed to load refill requests");
      const data = await res.json();
      this.state.refillRequests = Array.isArray(data.requests) ? data.requests : [];
    } catch (error) {
      this.state.refillRequests = this.sampleRefills();
      console.error(error);
    }

    this.renderRefills();
    this.updateCounts();
  },

  renderList() {
    if (!this.listEl) return;

    if (!this.state.filtered.length) {
      this.listEl.innerHTML = "<p>No prescriptions found.</p>";
      return;
    }

    this.listEl.innerHTML = this.state.filtered.map((item) => `
      <button type="button" class="data-row ${this.state.selected?.id === item.id ? "active" : ""}" data-id="${item.id}">
        <div>
          <strong>${this.escape(item.patientName)}</strong>
          <p>${this.escape(item.medicine)}</p>
        </div>
        <div class="row-meta">
          <span>${this.escape(item.date)}</span>
          <small>${this.escape(item.status)}</small>
        </div>
      </button>
    `).join("");
  },

  renderRefills() {
    if (!this.refillListEl) return;

    if (!this.state.refillRequests.length) {
      this.refillListEl.innerHTML = "<p>No refill requests found.</p>";
      return;
    }

    this.refillListEl.innerHTML = this.state.refillRequests.map((item) => `
      <div class="detail-card">
        <h3>${this.escape(item.patientName)}</h3>
        <p><strong>Medication:</strong> ${this.escape(item.medicine)}</p>
        <p><strong>Reason:</strong> ${this.escape(item.reason || "-")}</p>
        <p><strong>Status:</strong> ${this.escape(item.status)}</p>
        <div class="action-grid">
          <button class="btn btn-primary" type="button" data-refill-action="approve" data-refill-id="${item.id}">Approve</button>
          <button class="btn btn-ghost" type="button" data-refill-action="reject" data-refill-id="${item.id}">Reject</button>
        </div>
      </div>
    `).join("");
  },

  updateCounts() {
    const active = this.state.prescriptions.filter((x) => x.status === "active").length;
    const pendingReview = this.state.prescriptions.filter((x) => x.status === "pending").length;
    const completed = this.state.prescriptions.filter((x) => x.status === "completed").length;
    const refillRequests = this.state.refillRequests.filter((x) => x.status === "pending").length;

    this.setText("activePrescriptionsCount", active);
    this.setText("pendingReviewCount", pendingReview);
    this.setText("completedPrescriptionsCount", completed);
    this.setText("refillRequestsCount", refillRequests);
  },

  select(id) {
    const item = this.state.filtered.find((x) => String(x.id) === String(id));
    if (!item) return;
    this.state.selected = item;
    this.renderList();
    if (this.detailsEl) {
      this.detailsEl.innerHTML = `
        <div class="detail-card">
          <h3>${this.escape(item.patientName)}</h3>
          <p><strong>Prescription ID:</strong> ${this.escape(item.id)}</p>
          <p><strong>Medicine:</strong> ${this.escape(item.medicine)}</p>
          <p><strong>Dosage:</strong> ${this.escape(item.dosage)}</p>
          <p><strong>Duration:</strong> ${this.escape(item.duration)}</p>
          <p><strong>Instructions:</strong> ${this.escape(item.instructions || "-")}</p>
          <p><strong>Date:</strong> ${this.escape(item.date)}</p>
          <p><strong>Status:</strong> ${this.escape(item.status)}</p>
        </div>
      `;
    }
  },

  async submitPrescription(e) {
    e.preventDefault();
    const payload = {
      patientId: this.patientSelect?.value || "",
      medicine: this.medicineInput?.value.trim(),
      dosage: this.dosageInput?.value.trim(),
      duration: this.durationInput?.value.trim(),
      instructions: this.instructionsInput?.value.trim()
    };

    if (!payload.patientId || !payload.medicine || !payload.dosage || !payload.duration) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const res = await fetch("/api/doctor/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save prescription");

      const data = await res.json();
      const newItem = data.prescription || {
        id: Date.now(),
        patientId: payload.patientId,
        patientName: this.state.patients.find((p) => p.id === payload.patientId)?.name || "Unknown",
        medicine: payload.medicine,
        dosage: payload.dosage,
        duration: payload.duration,
        instructions: payload.instructions,
        status: "active",
        date: new Date().toISOString().slice(0, 10)
      };

      this.state.prescriptions.unshift(newItem);
      this.state.filtered = [...this.state.prescriptions];
      this.renderList();
      this.updateCounts();
      this.select(newItem.id);
      this.form?.reset();
      alert("Prescription saved.");
    } catch (error) {
      console.error(error);
      alert("Unable to save prescription.");
    }
  },

  handleRefillAction(id, action) {
    const item = this.state.refillRequests.find((x) => String(x.id) === String(id));
    if (!item) return;
    item.status = action === "approve" ? "approved" : "rejected";
    this.renderRefills();
    this.updateCounts();
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
  window.DoctorPrescriptions.init();
});