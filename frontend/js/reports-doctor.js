window.DoctorReports = {
  state: {
    reports: [],
    filtered: [],
    selected: null,
    patients: []
  },

  init() {
    this.cache();
    this.bind();
    this.loadReports();
    this.loadPatients();
  },

  cache() {
    this.listEl = document.getElementById("doctorReportsList");
    this.detailsEl = document.getElementById("doctorReportDetails");
    this.refreshBtn = document.getElementById("refreshReportsBtn");
    this.filterForm = document.getElementById("reportFilterForm");
    this.dateFilter = document.getElementById("reportDateFilter");
    this.statusFilter = document.getElementById("reportStatusFilter");
    this.patientFilter = document.getElementById("reportPatientFilter");
    this.uploadForm = document.getElementById("doctorReportUploadForm");
    this.patientSelect = document.getElementById("reportPatient");
    this.titleInput = document.getElementById("doctorReportTitle");
    this.typeInput = document.getElementById("doctorReportType");
    this.fileInput = document.getElementById("doctorReportFile");
    this.notesInput = document.getElementById("doctorReportNotes");
  },

  bind() {
    if (this.refreshBtn) this.refreshBtn.addEventListener("click", () => this.loadReports());

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

    if (this.uploadForm) {
      this.uploadForm.addEventListener("submit", (e) => this.submitReport(e));
    }
  },

  async loadReports() {
    if (this.listEl) this.listEl.innerHTML = "<p>Loading reports...</p>";

    try {
      const res = await fetch("/api/doctor/reports", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load reports");
      const data = await res.json();
      this.state.reports = Array.isArray(data.reports) ? data.reports : [];
    } catch (error) {
      console.error(error);
      this.state.reports = [];
      if (this.listEl) this.listEl.innerHTML = "<p>Unable to load reports.</p>";
      return;
    }

    this.applyFilters(true);
  },

  async loadPatients() {
    if (!this.patientSelect) return;

    try {
      const res = await fetch("/api/doctor/patients", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load patients");
      const data = await res.json();
      this.state.patients = Array.isArray(data.patients) ? data.patients : [];
    } catch (error) {
      console.error(error);
      this.state.patients = [];
      this.patientSelect.innerHTML = `<option value="">Unable to load patients</option>`;
      return;
    }

    this.patientSelect.innerHTML =
      `<option value="">Select patient</option>` +
      this.state.patients
        .map((p) => `<option value="${this.escape(p._id || p.id)}">${this.escape(p.name)} (${this.escape(p.patientId || p._id || p.id)})</option>`)
        .join("");
  },

  applyFilters(skipInputs = false) {
    const dateVal = skipInputs ? "" : (this.dateFilter?.value || "");
    const statusVal = skipInputs ? "" : (this.statusFilter?.value || "");
    const patientVal = skipInputs ? "" : (this.patientFilter?.value || "").toLowerCase().trim();

    this.state.filtered = this.state.reports.filter((item) => {
      const itemDate = (item.date || item.createdAt || "").slice(0, 10);
      const matchesDate = !dateVal || itemDate === dateVal;
      const matchesStatus = !statusVal || String(item.status || "").toLowerCase() === statusVal.toLowerCase();
      const matchesPatient =
        !patientVal ||
        `${item.patientName || ""} ${item.patientId || ""}`.toLowerCase().includes(patientVal);

      return matchesDate && matchesStatus && matchesPatient;
    });

    this.renderList();
    this.renderCounts();

    if (this.state.filtered.length) {
      const selectedStillExists = this.state.selected && this.state.filtered.find((x) => String(x._id || x.id) === String(this.state.selected._id || this.state.selected.id));
      if (selectedStillExists) {
        this.select(selectedStillExists._id || selectedStillExists.id, true);
      } else {
        this.select(this.state.filtered[0]._id || this.state.filtered[0].id, true);
      }
    } else {
      this.clearDetails();
    }
  },

  renderList() {
    if (!this.listEl) return;

    if (!this.state.filtered.length) {
      this.listEl.innerHTML = "<p>No reports found.</p>";
      return;
    }

    this.listEl.innerHTML = this.state.filtered.map((item) => {
      const id = item._id || item.id;
      const isActive = this.state.selected && String((this.state.selected._id || this.state.selected.id)) === String(id);
      return `
        <button type="button" class="data-row ${isActive ? "active" : ""}" data-id="${this.escape(id)}">
          <div>
            <strong>${this.escape(item.patientName || "Unknown Patient")}</strong>
            <p>${this.escape(item.title || item.reportTitle || "Report")}</p>
          </div>
          <div class="row-meta">
            <span>${this.escape((item.date || item.createdAt || "").slice(0, 10))}</span>
            <small>${this.escape(item.status || "pending")}</small>
          </div>
        </button>
      `;
    }).join("");
  },

  renderCounts() {
    const total = this.state.reports.length;
    const pending = this.state.reports.filter((x) => String(x.status || "").toLowerCase() === "pending").length;
    const reviewed = this.state.reports.filter((x) => String(x.status || "").toLowerCase() === "reviewed").length;
    const flagged = this.state.reports.filter((x) => String(x.status || "").toLowerCase() === "flagged").length;

    this.setText("totalReportsCount", total);
    this.setText("pendingReviewCount", pending);
    this.setText("reviewedCount", reviewed);
    this.setText("flaggedCount", flagged);
  },

  select(id, silent = false) {
    const item = this.state.filtered.find((x) => String(x._id || x.id) === String(id));
    if (!item) return;
    this.state.selected = item;
    this.renderList();
    this.renderDetails(item);
    if (!silent) this.flashSelected(item);
  },

  renderDetails(item) {
    if (!this.detailsEl) return;

    const fileUrl = item.fileUrl || item.filePath || "";
    this.detailsEl.innerHTML = `
      <div class="detail-card">
        <h3>${this.escape(item.title || item.reportTitle || "Report")}</h3>
        <p><strong>Patient:</strong> ${this.escape(item.patientName || "-")}</p>
        <p><strong>Patient ID:</strong> ${this.escape(item.patientId || "-")}</p>
        <p><strong>Type:</strong> ${this.escape(item.type || "-")}</p>
        <p><strong>Date:</strong> ${this.escape((item.date || item.createdAt || "").slice(0, 10))}</p>
        <p><strong>Status:</strong> ${this.escape(item.status || "-")}</p>
        <p><strong>Notes:</strong> ${this.escape(item.notes || "-")}</p>
        <p><strong>File:</strong> ${fileUrl ? `<a href="${this.escape(fileUrl)}" target="_blank" rel="noopener">Open file</a>` : "-"}</p>
      </div>
    `;
  },

  clearDetails() {
    if (this.detailsEl) this.detailsEl.innerHTML = "<p>Select a report to view details.</p>";
    this.state.selected = null;
    this.renderList();
  },

  async submitReport(e) {
    e.preventDefault();

    if (!this.patientSelect?.value || !this.titleInput?.value.trim() || !this.fileInput?.files?.[0]) {
      alert("Please fill patient, title, and file.");
      return;
    }

    const formData = new FormData();
    formData.append("patientId", this.patientSelect.value);
    formData.append("title", this.titleInput.value.trim());
    formData.append("type", this.typeInput.value);
    formData.append("notes", this.notesInput?.value.trim() || "");
    formData.append("reportFile", this.fileInput.files[0]);

    try {
      const res = await fetch("/api/doctor/reports", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (!res.ok) throw new Error("Failed to upload report");

      await res.json();
      this.uploadForm.reset();
      await this.loadReports();
      await this.loadPatients();
      alert("Report uploaded successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to upload report.");
    }
  },

  setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
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
  window.DoctorReports.init();
});