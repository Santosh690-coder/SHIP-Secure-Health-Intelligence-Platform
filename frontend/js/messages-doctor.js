window.DoctorMessages = {
  state: {
    threads: [],
    filtered: [],
    selectedThread: null,
    recipients: []
  },

  init() {
    this.cache();
    this.bind();
    this.loadThreads();
    this.loadRecipients();
  },

  cache() {
    this.threadsListEl = document.getElementById("doctorThreadsList");
    this.threadDetailsEl = document.getElementById("doctorThreadDetails");
    this.refreshBtn = document.getElementById("refreshMessagesBtn");
    this.searchForm = document.getElementById("messageSearchForm");
    this.searchInput = document.getElementById("messageSearchInput");
    this.newMessageBtn = document.getElementById("newMessageBtn");
    this.messageForm = document.getElementById("doctorMessageForm");
    this.recipientType = document.getElementById("messageRecipientType");
    this.recipientSelect = document.getElementById("messageRecipient");
    this.subjectInput = document.getElementById("messageSubject");
    this.bodyInput = document.getElementById("messageBody");
    this.unreadCountEl = document.getElementById("unreadMessagesCount");
    this.todayCountEl = document.getElementById("todayMessagesCount");
    this.patientThreadsCountEl = document.getElementById("patientThreadsCount");
    this.staffThreadsCountEl = document.getElementById("staffThreadsCount");
  },

  bind() {
    if (this.refreshBtn) this.refreshBtn.addEventListener("click", () => this.loadThreads());
    if (this.newMessageBtn) this.newMessageBtn.addEventListener("click", () => this.messageForm?.scrollIntoView({ behavior: "smooth", block: "start" }));

    if (this.searchForm) {
      this.searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.applySearch();
      });
      this.searchForm.addEventListener("reset", () => {
        setTimeout(() => this.applySearch(true), 0);
      });
    }

    if (this.searchInput) {
      this.searchInput.addEventListener("input", () => this.applySearch());
    }

    if (this.threadsListEl) {
      this.threadsListEl.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-thread-id]");
        if (btn) this.selectThread(btn.getAttribute("data-thread-id"));
      });
    }

    if (this.recipientType) {
      this.recipientType.addEventListener("change", () => this.loadRecipients());
    }

    if (this.messageForm) {
      this.messageForm.addEventListener("submit", (e) => this.sendMessage(e));
    }
  },

  async loadThreads() {
    if (this.threadsListEl) this.threadsListEl.innerHTML = "<p>Loading conversations...</p>";

    try {
      const res = await fetch("/api/doctor/messages/threads", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load threads");
      const data = await res.json();
      this.state.threads = Array.isArray(data.threads) ? data.threads : [];
    } catch (error) {
      console.error(error);
      this.state.threads = [];
      if (this.threadsListEl) this.threadsListEl.innerHTML = "<p>Unable to load conversations.</p>";
      return;
    }

    this.applySearch(true);
    this.renderCounts();
  },

  async loadRecipients() {
    if (!this.recipientSelect) return;

    const type = this.recipientType?.value || "patient";
    const endpoint = type === "staff" ? "/api/doctor/messages/recipients/staff" : "/api/doctor/messages/recipients/patients";

    try {
      const res = await fetch(endpoint, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load recipients");
      const data = await res.json();
      this.state.recipients = Array.isArray(data.recipients) ? data.recipients : [];
    } catch (error) {
      console.error(error);
      this.state.recipients = [];
      this.recipientSelect.innerHTML = `<option value="">Unable to load recipients</option>`;
      return;
    }

    this.recipientSelect.innerHTML =
      `<option value="">Select recipient</option>` +
      this.state.recipients
        .map((r) => `<option value="${this.escape(r._id || r.id)}">${this.escape(r.name)} (${this.escape(r.role || type)})</option>`)
        .join("");
  },

  applySearch(skipInput = false) {
    const query = skipInput ? "" : (this.searchInput?.value || "").toLowerCase().trim();

    this.state.filtered = this.state.threads.filter((thread) => {
      if (!query) return true;
      const blob = [
        thread.subject,
        thread.patientName,
        thread.staffName,
        thread.lastMessage,
        thread.threadName
      ].join(" ").toLowerCase();
      return blob.includes(query);
    });

    this.renderThreads();
    if (this.state.filtered.length) {
      const existing = this.state.selectedThread && this.state.filtered.find((t) => String(t._id || t.id) === String(this.state.selectedThread._id || this.state.selectedThread.id));
      if (existing) this.selectThread(existing._id || existing.id, true);
      else this.selectThread(this.state.filtered[0]._id || this.state.filtered[0].id, true);
    } else {
      this.clearDetails();
    }
  },

  renderThreads() {
    if (!this.threadsListEl) return;

    if (!this.state.filtered.length) {
      this.threadsListEl.innerHTML = "<p>No conversations found.</p>";
      return;
    }

    this.threadsListEl.innerHTML = this.state.filtered.map((thread) => {
      const id = thread._id || thread.id;
      const active = this.state.selectedThread && String(this.state.selectedThread._id || this.state.selectedThread.id) === String(id);
      return `
        <button type="button" class="data-row ${active ? "active" : ""}" data-thread-id="${this.escape(id)}">
          <div>
            <strong>${this.escape(thread.threadName || thread.patientName || thread.subject || "Conversation")}</strong>
            <p>${this.escape(thread.lastMessage || "No messages yet")}</p>
          </div>
          <div class="row-meta">
            <span>${this.escape((thread.updatedAt || thread.createdAt || "").toString().slice(0, 10))}</span>
            <small>${thread.unreadCount ? `${thread.unreadCount} unread` : "read"}</small>
          </div>
        </button>
      `;
    }).join("");
  },

  renderCounts() {
    const unread = this.state.threads.reduce((sum, t) => sum + (Number(t.unreadCount) || 0), 0);
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = this.state.threads.filter((t) => String((t.updatedAt || t.createdAt || "")).slice(0, 10) === today).length;
    const patientCount = this.state.threads.filter((t) => (t.type || "patient") === "patient").length;
    const staffCount = this.state.threads.filter((t) => (t.type || "patient") === "staff").length;

    this.setText("unreadMessagesCount", unread);
    this.setText("todayMessagesCount", todayCount);
    this.setText("patientThreadsCount", patientCount);
    this.setText("staffThreadsCount", staffCount);
  },

  async selectThread(id, silent = false) {
    const thread = this.state.filtered.find((t) => String(t._id || t.id) === String(id));
    if (!thread) return;

    this.state.selectedThread = thread;
    this.renderThreads();
    this.threadDetailsEl.innerHTML = "<p>Loading conversation...</p>";

    try {
      const res = await fetch(`/api/doctor/messages/threads/${encodeURIComponent(id)}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load thread");
      const data = await res.json();
      const fullThread = data.thread || thread;
      this.state.selectedThread = fullThread;
      this.renderThreadDetails(fullThread);
    } catch (error) {
      console.error(error);
      this.renderThreadDetails(thread);
    }

    if (!silent) this.markAsRead(id);
  },

  renderThreadDetails(thread) {
    if (!this.threadDetailsEl) return;

    const messages = Array.isArray(thread.messages) ? thread.messages : [];
    this.threadDetailsEl.innerHTML = `
      <div class="detail-card">
        <h3>${this.escape(thread.threadName || thread.patientName || thread.subject || "Conversation")}</h3>
        <p><strong>Type:</strong> ${this.escape(thread.type || "patient")}</p>
        <p><strong>Subject:</strong> ${this.escape(thread.subject || "-")}</p>
        <p><strong>Participants:</strong> ${this.escape(thread.patientName || thread.staffName || "-")}</p>
      </div>
      <div class="message-thread">
        ${messages.length ? messages.map((msg) => `
          <div class="message-bubble ${msg.senderRole === "doctor" ? "outgoing" : "incoming"}">
            <div class="message-meta">
              <strong>${this.escape(msg.senderName || msg.senderRole || "User")}</strong>
              <span>${this.escape((msg.createdAt || "").toString().slice(0, 19).replace("T", " "))}</span>
            </div>
            <p>${this.escape(msg.text || msg.body || "")}</p>
          </div>
        `).join("") : "<p>No messages yet.</p>"}
      </div>
    `;
  },

  clearDetails() {
    if (this.threadDetailsEl) this.threadDetailsEl.innerHTML = "<p>Select a conversation to view messages.</p>";
    this.state.selectedThread = null;
    this.renderThreads();
  },

  async markAsRead(id) {
    try {
      await fetch(`/api/doctor/messages/threads/${encodeURIComponent(id)}/read`, {
        method: "PATCH",
        credentials: "include"
      });
      await this.loadThreads();
    } catch (error) {
      console.error(error);
    }
  },

  async sendMessage(e) {
    e.preventDefault();

    const payload = {
      recipientType: this.recipientType?.value || "patient",
      recipientId: this.recipientSelect?.value || "",
      subject: this.subjectInput?.value.trim() || "",
      body: this.bodyInput?.value.trim() || ""
    };

    if (!payload.recipientId || !payload.subject || !payload.body) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const res = await fetch("/api/doctor/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to send message");

      this.messageForm.reset();
      await this.loadThreads();
      alert("Message sent successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to send message.");
    }
  },

  setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  },

  escape(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.DoctorMessages.init();
});