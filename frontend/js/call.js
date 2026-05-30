// call.js
const SHIPCalls = (() => {
  function startVoiceCall(appointmentId, userRole) {
    console.log("Starting voice call", { appointmentId, userRole });
    alert(`${userRole} voice call started for appointment ${appointmentId}`);
  }

  function endCall(appointmentId) {
    console.log("Ending call", { appointmentId });
    alert(`Call ended for appointment ${appointmentId}`);
  }

  function attachCallButtons(container, appointmentId, role) {
    if (!container) return;

    const callBtn = container.querySelector('[data-call="voice"]');
    const endBtn = container.querySelector('[data-call="end"]');

    if (callBtn) {
      callBtn.addEventListener("click", () => startVoiceCall(appointmentId, role));
    }

    if (endBtn) {
      endBtn.addEventListener("click", () => endCall(appointmentId));
    }
  }

  return {
    startVoiceCall,
    endCall,
    attachCallButtons
  };
})();