document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const API = 'http://localhost:3000/api';

  const totalMessages = document.getElementById('totalMessages');
  const totalConversations = document.getElementById('totalConversations');
  const unreadCount = document.getElementById('unreadCount');
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const messagesBody = document.getElementById('messagesBody');
  const refreshBtn = document.getElementById('refreshBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  let cache = [];

  function renderRows(rows) {
    messagesBody.innerHTML = rows.map(m => `
      <tr>
        <td>${m.fromName || m.fromEmail || 'Unknown'}</td>
        <td>${m.toName || m.toEmail || 'Unknown'}</td>
        <td>${m.text || ''}</td>
        <td><span class="badge ${m.read ? 'read' : 'unread'}">${m.read ? 'read' : 'unread'}</span></td>
        <td>${m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}</td>
      </tr>
    `).join('');
  }

  function applyFilters() {
    const q = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value;

    const filtered = cache.filter(m => {
      const text = `${m.fromName || ''} ${m.fromEmail || ''} ${m.toName || ''} ${m.toEmail || ''} ${m.text || ''}`.toLowerCase();
      const matchesSearch = text.includes(q);
      const matchesStatus =
        status === 'all' ||
        (status === 'read' && m.read) ||
        (status === 'unread' && !m.read);
      return matchesSearch && matchesStatus;
    });

    renderRows(filtered);
  }

  async function loadMessages() {
    const res = await fetch(`${API}/messages/admin`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    cache = data.messages || [];

    totalMessages.textContent = data.summary?.totalMessages || cache.length;
    totalConversations.textContent = data.summary?.totalConversations || 0;
    unreadCount.textContent = data.summary?.unreadCount || 0;

    applyFilters();
  }

  searchInput.addEventListener('input', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
  refreshBtn.addEventListener('click', loadMessages);

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });

  await loadMessages();
});
