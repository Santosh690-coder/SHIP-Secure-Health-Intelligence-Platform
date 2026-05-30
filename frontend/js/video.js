// video.js
const SHIPVideo = (() => {
  function startVideoCall(appointmentId, userRole) {
    console.log("Starting video call", { appointmentId, userRole });
    alert(`${userRole} video consultation started for appointment ${appointmentId}`);
  }

  function endVideoCall(appointmentId) {
    console.log("Ending video call", { appointmentId });
    alert(`Video call ended for appointment ${appointmentId}`);
  }

  function attachVideoButtons(container, appointmentId, role) {
    if (!container) return;

    const videoBtn = container.querySelector('[data-video="start"]');
    const endBtn = container.querySelector('[data-video="end"]');

    if (videoBtn) {
      videoBtn.addEventListener("click", () => startVideoCall(appointmentId, role));
    }

    if (endBtn) {
      endBtn.addEventListener("click", () => endVideoCall(appointmentId));
    }
  }

  return {
    startVideoCall,
    endVideoCall,
    attachVideoButtons
  };
})();