// notifications.js
const SHIPNotify = (() => {
  let container;

  function ensureContainer() {
    if (container) return container;

    container = document.createElement("div");
    container.className = "toast-container";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");
    document.body.appendChild(container);

    return container;
  }

  function show(message, type = "info", timeout = 3000) {
    const root = ensureContainer();
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-message">${message}</span>
      <button type="button" class="toast-close" aria-label="Close notification">×</button>
    `;

    const close = () => {
      toast.classList.remove("open");
      setTimeout(() => toast.remove(), 180);
    };

    toast.querySelector(".toast-close").addEventListener("click", close);
    root.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("open"));

    if (timeout > 0) {
      setTimeout(close, timeout);
    }
  }

  return {
    show,
    success: (msg, timeout) => show(msg, "success", timeout),
    error: (msg, timeout) => show(msg, "error", timeout),
    info: (msg, timeout) => show(msg, "info", timeout),
    warning: (msg, timeout) => show(msg, "warning", timeout)
  };
})();