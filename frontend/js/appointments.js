// appointments.js
const SHIPAppointments = (() => {
  function openChat(appointmentId, role) {
    alert(`${role} chat opened for appointment ${appointmentId}`);
  }

  function startVoiceCall(appointmentId, role) {
    alert(`${role} voice call started for appointment ${appointmentId}`);
  }

  function startVideoCall(appointmentId, role) {
    alert(`${role} video call started for appointment ${appointmentId}`);
  }

  function renderAppointmentActions(container, appointment, role) {
    if (!container || !appointment) return;

    const actions = document.createElement("div");
    actions.className = "appointment-actions";

    const chatBtn = document.createElement("button");
    chatBtn.type = "button";
    chatBtn.className = "btn btn-ghost";
    chatBtn.textContent = "Chat";
    chatBtn.addEventListener("click", () => openChat(appointment.id, role));

    const callBtn = document.createElement("button");
    callBtn.type = "button";
    callBtn.className = "btn btn-ghost";
    callBtn.textContent = "Call";
    callBtn.addEventListener("click", () => startVoiceCall(appointment.id, role));

    const videoBtn = document.createElement("button");
    videoBtn.type = "button";
    videoBtn.className = "btn btn-primary";
    videoBtn.textContent = "Video";
    videoBtn.addEventListener("click", () => startVideoCall(appointment.id, role));

    actions.append(chatBtn, callBtn, videoBtn);
    container.appendChild(actions);
  }

  return {
    openChat,
    startVoiceCall,
    startVideoCall,
    renderAppointmentActions
  };
})();