// messages.js
const SHIPMessages = (() => {
  function renderMessageList(container, messages = []) {
    if (!container) return;
    container.innerHTML = "";

    messages.forEach((message) => {
      const item = document.createElement("div");
      item.className = `message-item ${message.sender === "me" ? "me" : "them"}`;
      item.innerHTML = `
        <strong>${message.senderName || "User"}</strong>
        <p>${message.text || ""}</p>
        <span>${message.time || ""}</span>
      `;
      container.appendChild(item);
    });
  }

  function sendMessage(threadId, text) {
    if (!text.trim()) return false;
    console.log("Send message", { threadId, text });
    return true;
  }

  function attachComposer(form, input, threadId, listContainer) {
    if (!form || !input || !listContainer) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      const sent = sendMessage(threadId, text);
      if (!sent) return;

      const msg = {
        sender: "me",
        senderName: "You",
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      const item = document.createElement("div");
      item.className = "message-item me";
      item.innerHTML = `
        <strong>${msg.senderName}</strong>
        <p>${msg.text}</p>
        <span>${msg.time}</span>
      `;
      listContainer.appendChild(item);
      input.value = "";
      input.focus();
    });
  }

  return {
    renderMessageList,
    sendMessage,
    attachComposer
  };
})();