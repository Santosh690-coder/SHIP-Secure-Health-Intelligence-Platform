window.SHIPAI = {
  state: {
    patientMessages: [],
    doctorMessages: [],
    patientXrayResult: null
  },

  init() {
    this.bindPatientChat();
    this.bindDoctorChat();
    this.bindXrayAnalysis();
  },

  bindPatientChat() {
    const form = document.getElementById("patientAiForm");
    const input = document.getElementById("patientAiInput");
    const messages = document.getElementById("patientAiMessages");
    const openBtn = document.getElementById("openPatientAiBtn");

    if (openBtn) {
      openBtn.addEventListener("click", () => {
        const shell = document.getElementById("patientAiChatShell");
        if (shell) shell.scrollIntoView({ behavior: "smooth", block: "start" });
        if (input) input.focus();
      });
    }

    if (!form || !input || !messages) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      this.addChatMessage(messages, "You", text, "user");
      input.value = "";
      this.addTypingIndicator(messages, "Assistant is typing...");

      try {
        const reply = await this.sendChatMessage({
          role: "patient",
          message: text
        });
        this.removeTypingIndicator(messages);
        this.addChatMessage(messages, "AI Assistant", reply, "assistant");
      } catch (error) {
        this.removeTypingIndicator(messages);
        this.addChatMessage(messages, "System", "Unable to get AI response right now.", "system");
        console.error(error);
      }
    });
  },

  bindDoctorChat() {
    const form = document.getElementById("doctorAiForm");
    const input = document.getElementById("doctorAiInput");
    const messages = document.getElementById("doctorAiMessages");
    const openBtn = document.getElementById("openDoctorAiBtn");

    if (openBtn) {
      openBtn.addEventListener("click", () => {
        const shell = document.getElementById("doctorAiChatShell");
        if (shell) shell.scrollIntoView({ behavior: "smooth", block: "start" });
        if (input) input.focus();
      });
    }

    if (!form || !input || !messages) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      this.addChatMessage(messages, "You", text, "user");
      input.value = "";
      this.addTypingIndicator(messages, "Assistant is typing...");

      try {
        const reply = await this.sendChatMessage({
          role: "doctor",
          message: text
        });
        this.removeTypingIndicator(messages);
        this.addChatMessage(messages, "AI Assistant", reply, "assistant");
      } catch (error) {
        this.removeTypingIndicator(messages);
        this.addChatMessage(messages, "System", "Unable to get AI response right now.", "system");
        console.error(error);
      }
    });
  },

  bindXrayAnalysis() {
    const form = document.getElementById("xrayUploadForm");
    const fileInput = document.getElementById("xrayFile");
    const notesInput = document.getElementById("xrayNotes");
    const resultBox = document.getElementById("xrayResultBox");
    const analyzeBtn = document.getElementById("analyzeXrayBtn");

    if (analyzeBtn) {
      analyzeBtn.addEventListener("click", () => {
        const shell = document.getElementById("xray-analysis");
        if (shell) shell.scrollIntoView({ behavior: "smooth", block: "start" });
        if (fileInput) fileInput.focus();
      });
    }

    if (!form || !fileInput || !resultBox) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!fileInput.files || !fileInput.files[0]) {
        resultBox.innerHTML = "<p>Please select an X-ray image first.</p>";
        return;
      }

      const file = fileInput.files[0];
      const notes = notesInput ? notesInput.value.trim() : "";
      const formData = new FormData();
      formData.append("xrayFile", file);
      formData.append("notes", notes);

      resultBox.innerHTML = "<p>Analyzing X-ray...</p>";

      try {
        const response = await fetch("/api/patient/xray/analyze", {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          throw new Error("X-ray analysis request failed");
        }

        const data = await response.json();
        this.state.patientXrayResult = data;
        this.renderXrayResult(resultBox, data);
      } catch (error) {
        resultBox.innerHTML = "<p>Unable to analyze X-ray right now.</p>";
        console.error(error);
      }
    });
  },

  async sendChatMessage(payload) {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("AI chat request failed");
    }

    const data = await response.json();
    return data.reply || "No response received.";
  },

  addChatMessage(container, sender, text, type) {
    const item = document.createElement("div");
    item.className = `ai-message ai-message-${type}`;
    item.innerHTML = `
      <strong>${this.escape(sender)}</strong>
      <p>${this.escape(text)}</p>
    `;
    container.appendChild(item);
    container.scrollTop = container.scrollHeight;
  },

  addTypingIndicator(container, text) {
    this.removeTypingIndicator(container);
    const item = document.createElement("div");
    item.className = "ai-message ai-message-typing";
    item.id = "aiTypingIndicator";
    item.innerHTML = `<p>${this.escape(text)}</p>`;
    container.appendChild(item);
    container.scrollTop = container.scrollHeight;
  },

  removeTypingIndicator(container) {
    const existing = document.getElementById("aiTypingIndicator");
    if (existing) existing.remove();
  },

  renderXrayResult(container, data) {
    const interpretation = data.interpretation || "No interpretation available.";
    const urgency = data.urgency || "unknown";
    const summary = data.summary || "";

    container.innerHTML = `
      <div class="xray-result">
        <p><strong>Urgency:</strong> ${this.escape(urgency)}</p>
        <p><strong>Interpretation:</strong> ${this.escape(interpretation)}</p>
        ${summary ? `<p><strong>Summary:</strong> ${this.escape(summary)}</p>` : ""}
      </div>
    `;
  },

  escape(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.SHIPAI.init();
});