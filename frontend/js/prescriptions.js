// prescriptions.js
const SHIPPrescriptions = (() => {
  function renderPrescriptions(container, prescriptions = []) {
    if (!container) return;
    container.innerHTML = "";

    prescriptions.forEach((item) => {
      const card = document.createElement("article");
      card.className = "prescription-card";
      card.innerHTML = `
        <div class="prescription-head">
          <div>
            <h3>${item.medicine || "Medicine"}</h3>
            <p>${item.dosage || "Dosage details not available"}</p>
          </div>
          <span class="status-badge">${item.status || "Active"}</span>
        </div>

        <div class="prescription-meta">
          <span>Prescribed by ${item.doctor || "Doctor"}</span>
          <span>${item.date || ""}</span>
        </div>

        <div class="prescription-notes">
          <p>${item.notes || "No additional instructions."}</p>
        </div>

        <div class="prescription-actions">
          <button type="button" class="btn btn-ghost" data-action="view">View</button>
          <button type="button" class="btn btn-primary" data-action="refill">Request Refill</button>
        </div>
      `;

      card.querySelector('[data-action="view"]').addEventListener("click", () => {
        alert(`Open prescription: ${item.medicine || "Medicine"}`);
      });

      card.querySelector('[data-action="refill"]').addEventListener("click", () => {
        alert(`Refill requested for ${item.medicine || "Medicine"}`);
      });

      container.appendChild(card);
    });
  }

  function openPrescription(prescriptionId) {
    console.log("Open prescription", prescriptionId);
    alert(`Opening prescription ${prescriptionId}`);
  }

  return {
    renderPrescriptions,
    openPrescription
  };
})();