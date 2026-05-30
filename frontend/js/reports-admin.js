window.AdminReports = {
  state: {
    summary: null,
    trends: [],
    topDoctors: [],
    departments: [],
    recent: []
  },

  charts: {},

  init() {
    this.cache();
    this.bind();
    this.loadAll();
  },

  cache() {
    this.refreshBtn = document.getElementById("refreshReportsBtn");
    this.form = document.getElementById("reportsFilterForm");
    this.fromDate = document.getElementById("reportFromDate");
    this.toDate = document.getElementById("reportToDate");
    this.departmentFilter = document.getElementById("reportDepartment");
    this.doctorFilter = document.getElementById("reportDoctor");
    this.metrics = {
      totalAppointments: document.getElementById("totalAppointmentsMetric"),
      completed: document.getElementById("completedMetric"),
      cancelled: document.getElementById("cancelledMetric"),
      revenue: document.getElementById("revenueMetric")
    };
    this.topDoctorsTable = document.getElementById("topDoctorsTable");
    this.reportsTable = document.getElementById("reportsTable");
    this.trendCanvas = document.getElementById("appointmentsTrendChart");
    this.statusCanvas = document.getElementById("statusBreakdownChart");
    this.departmentCanvas = document.getElementById("departmentRevenueChart");
  },

  bind() {
    if (this.refreshBtn) this.refreshBtn.addEventListener("click", () => this.loadAll());

    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.loadAll();
      });
      this.form.addEventListener("reset", () => {
        setTimeout(() => this.loadAll(), 0);
      });
    }
  },

  async loadAll() {
    await Promise.all([
      this.loadSummary(),
      this.loadTrends(),
      this.loadDoctors(),
      this.loadDepartments(),
      this.loadRecent()
    ]);
    this.renderAll();
  },

  buildQuery() {
    const params = new URLSearchParams();
    if (this.fromDate?.value) params.set("from", this.fromDate.value);
    if (this.toDate?.value) params.set("to", this.toDate.value);
    if (this.departmentFilter?.value) params.set("department", this.departmentFilter.value);
    if (this.doctorFilter?.value) params.set("doctorId", this.doctorFilter.value);
    return params.toString();
  },

  async apiGet(path) {
    const query = this.buildQuery();
    const url = query ? `${path}?${query}` : path;
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`Request failed: ${path}`);
    return res.json();
  },

  async loadSummary() {
    try {
      this.state.summary = await this.apiGet("/api/admin/reports/summary");
    } catch (err) {
      console.error(err);
      this.state.summary = {
        totalAppointments: 0,
        completed: 0,
        cancelled: 0,
        revenue: 0
      };
    }
  },

  async loadTrends() {
    try {
      const data = await this.apiGet("/api/admin/reports/trends");
      this.state.trends = Array.isArray(data.trends) ? data.trends : [];
    } catch (err) {
      console.error(err);
      this.state.trends = [];
    }
  },

  async loadDoctors() {
    try {
      const data = await this.apiGet("/api/admin/reports/doctors");
      this.state.topDoctors = Array.isArray(data.doctors) ? data.doctors : [];
      if (this.doctorFilter) {
        this.doctorFilter.innerHTML =
          `<option value="">All Doctors</option>` +
          this.state.topDoctors.map((d) => {
            const id = d.doctorId || d.id || d._id || "";
            return `<option value="${this.escape(id)}">${this.escape(d.name || "Doctor")}</option>`;
          }).join("");
      }
    } catch (err) {
      console.error(err);
      this.state.topDoctors = [];
    }
  },

  async loadDepartments() {
    try {
      const data = await this.apiGet("/api/admin/reports/departments");
      this.state.departments = Array.isArray(data.departments) ? data.departments : [];
      if (this.departmentFilter) {
        this.departmentFilter.innerHTML =
          `<option value="">All Departments</option>` +
          this.state.departments.map((d) => {
            const value = d.department || d.name || "";
            return `<option value="${this.escape(value)}">${this.escape(value)}</option>`;
          }).join("");
      }
    } catch (err) {
      console.error(err);
      this.state.departments = [];
    }
  },

  async loadRecent() {
    try {
      const data = await this.apiGet("/api/admin/reports/recent");
      this.state.recent = Array.isArray(data.recent) ? data.recent : [];
    } catch (err) {
      console.error(err);
      this.state.recent = [];
    }
  },

  renderAll() {
    this.renderMetrics();
    this.renderTrendChart();
    this.renderStatusChart();
    this.renderDepartmentChart();
    this.renderTopDoctors();
    this.renderRecentTable();
  },

  renderMetrics() {
    const s = this.state.summary || {};
    this.setText(this.metrics.totalAppointments, s.totalAppointments ?? 0);
    this.setText(this.metrics.completed, s.completed ?? 0);
    this.setText(this.metrics.cancelled, s.cancelled ?? 0);
    this.setText(this.metrics.revenue, `₹${Number(s.revenue ?? 0).toLocaleString("en-IN")}`);
  },

  renderTrendChart() {
    if (!this.trendCanvas) return;
    const labels = this.state.trends.map((x) => x.label || x.date || "");
    const values = this.state.trends.map((x) => Number(x.count ?? x.value ?? 0));

    this.destroyChart("trend");
    this.charts.trend = new Chart(this.trendCanvas, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Appointments",
          data: values,
          borderColor: "#0f4c81",
          backgroundColor: "rgba(15,76,129,0.12)",
          tension: 0.35,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  },

  renderStatusChart() {
    if (!this.statusCanvas) return;
    const s = this.state.summary || {};
    const completed = Number(s.completed ?? 0);
    const cancelled = Number(s.cancelled ?? 0);
    const pending = Number(s.pending ?? 0);
    const scheduled = Number(s.scheduled ?? 0);

    this.destroyChart("status");
    this.charts.status = new Chart(this.statusCanvas, {
      type: "doughnut",
      data: {
        labels: ["Completed", "Cancelled", "Pending", "Scheduled"],
        datasets: [{
          data: [completed, cancelled, pending, scheduled],
          backgroundColor: ["#16a34a", "#dc2626", "#f59e0b", "#0f4c81"]
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } }
      }
    });
  },

  renderDepartmentChart() {
    if (!this.departmentCanvas) return;
    const labels = this.state.departments.map((x) => x.department || x.name || "");
    const values = this.state.departments.map((x) => Number(x.revenue ?? x.value ?? 0));

    this.destroyChart("department");
    this.charts.department = new Chart(this.departmentCanvas, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Revenue",
          data: values,
          backgroundColor: "#2563eb"
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  },

  renderTopDoctors() {
    if (!this.topDoctorsTable) return;

    if (!this.state.topDoctors.length) {
      this.topDoctorsTable.innerHTML = "<p>No doctor performance data available.</p>";
      return;
    }

    this.topDoctorsTable.innerHTML = `
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Appointments</th>
              <th>Completed</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${this.state.topDoctors.map((d) => `
              <tr>
                <td>${this.escape(d.name || "Doctor")}</td>
                <td>${this.escape(d.appointments ?? 0)}</td>
                <td>${this.escape(d.completed ?? 0)}</td>
                <td>₹${this.escape(Number(d.revenue ?? 0).toLocaleString("en-IN"))}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  },

  renderRecentTable() {
    if (!this.reportsTable) return;

    if (!this.state.recent.length) {
      this.reportsTable.innerHTML = "<p>No recent records available.</p>";
      return;
    }

    this.reportsTable.innerHTML = `
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Department</th>
              <th>Doctor</th>
              <th>Appointments</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${this.state.recent.map((r) => `
              <tr>
                <td>${this.escape(String(r.date || "").slice(0, 10))}</td>
                <td>${this.escape(r.department || "-")}</td>
                <td>${this.escape(r.doctorName || "-")}</td>
                <td>${this.escape(r.appointments ?? 0)}</td>
                <td>₹${this.escape(Number(r.revenue ?? 0).toLocaleString("en-IN"))}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  },

  destroyChart(key) {
    if (this.charts[key]) {
      this.charts[key].destroy();
      this.charts[key] = null;
    }
  },

  setText(el, value) {
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
  window.AdminReports.init();
});