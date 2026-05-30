// reports.js
const SHIPReports = (() => {
  function renderReports(container, reports = []) {
    if (!container) return;
    container.innerHTML = "";

    reports.forEach((report) => {
      const card = document.createElement("article");
      card.className = "report-card";
      card.innerHTML = `
        <div>
          <h3>${report.title || "Medical Report"}</h3>
          <p>${report.summary || "No summary available."}</p>
        </div>
        <div class="report-meta">
          <span>${report.date || ""}</span>
          <button type="button" class="btn btn-ghost">View</button>
        </div>
      `;

      card.querySelector("button").addEventListener("click", () => {
        alert(`Open report: ${report.title || "Medical Report"}`);
      });

      container.appendChild(card);
    });
  }

  function openReport(reportId) {
    console.log("Open report", reportId);
    alert(`Opening report ${reportId}`);
  }

  return {
    renderReports,
    openReport
  };
})();