// health-monitor.js
const SHIPHealthMonitor = (() => {
  function renderVitals(container, vitals = []) {
    if (!container) return;
    container.innerHTML = "";

    vitals.forEach((item) => {
      const card = document.createElement("article");
      card.className = "vital-card";
      card.innerHTML = `
        <span>${item.label || "Vital"}</span>
        <strong>${item.value || "-"}</strong>
        <small>${item.change || ""}</small>
      `;
      container.appendChild(card);
    });
  }

  function renderSymptoms(container, symptoms = []) {
    if (!container) return;
    container.innerHTML = "";

    symptoms.forEach((symptom) => {
      const row = document.createElement("div");
      row.className = "symptom-row";
      row.innerHTML = `
        <div>
          <strong>${symptom.name || "Symptom"}</strong>
          <p>${symptom.note || "No notes."}</p>
        </div>
        <span>${symptom.status || "Tracked"}</span>
      `;
      container.appendChild(row);
    });
  }

  function addSymptom(container, symptom) {
    if (!container || !symptom) return;

    const row = document.createElement("div");
    row.className = "symptom-row";
    row.innerHTML = `
      <div>
        <strong>${symptom.name || "Symptom"}</strong>
        <p>${symptom.note || ""}</p>
      </div>
      <span>${symptom.status || "Tracked"}</span>
    `;
    container.prepend(row);
  }

  return {
    renderVitals,
    renderSymptoms,
    addSymptom
  };
})();