// appointment-detail.js
const SHIPAppointmentDetail = (() => {
  function createDetail(appointment, role) {
    const wrapper = document.createElement("div");
    wrapper.className = "appointment-detail";

    wrapper.innerHTML = `
      <div class="appointment-detail-header">
        <div>
          <p class="eyebrow">Appointment details</p>
          <h3>${appointment.title || "Consultation"}</h3>
        </div>
        <span class="status-badge">${appointment.status || "Scheduled"}</span>
      </div>

      <div class="appointment-detail-grid">
        <div class="detail-block">
          <span>Patient</span>
          <strong>${appointment.patientName || "Patient"}</strong>
        </div>
        <div class="detail-block">
          <span>Doctor</span>
          <strong>${appointment.doctorName || "Doctor"}</strong>
        </div>
        <div class="detail-block">
          <span>Date</span>
          <strong>${appointment.date || "-"}</strong>
        </div>
        <div class="detail-block">
          <span>Time</span>
          <strong>${appointment.time || "-"}</strong>
        </div>
        <div class="detail-block">
          <span>Mode</span>
          <strong>${appointment.mode || "In-person"}</strong>
        </div>
        <div class="detail-block">
          <span>Reason</span>
          <strong>${appointment.reason || "General consultation"}</strong>
        </div>
      </div>

      <div class="appointment-history-block">
        <h4>Previous content</h4>
        <p>${appointment.history || "No previous appointment history available yet."}</p>
      </div>

      <div class="appointment-notes-block">
        <h4>Notes</h4>
        <p>${appointment.notes || "No notes added yet."}</p>
      </div>

      <div class="appointment-detail-actions">
        <button type="button" class="btn btn-ghost" data-action="chat">Chat</button>
        <button type="button" class="btn btn-ghost" data-action="call">Call</button>
        <button type="button" class="btn btn-primary" data-action="video">Video</button>
      </div>
    `;

    const chatBtn = wrapper.querySelector('[data-action="chat"]');
    const callBtn = wrapper.querySelector('[data-action="call"]');
    const videoBtn = wrapper.querySelector('[data-action="video"]');

    chatBtn.addEventListener("click", () => SHIPAppointments.openChat(appointment.id, role));
    callBtn.addEventListener("click", () => SHIPAppointments.startVoiceCall(appointment.id, role));
    videoBtn.addEventListener("click", () => SHIPAppointments.startVideoCall(appointment.id, role));

    return wrapper;
  }

  return {
    createDetail
  };
})();