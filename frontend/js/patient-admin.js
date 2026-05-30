document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const patientGreeting = document.getElementById('patientGreeting');
  const patientCount = document.getElementById('patientCount');
  const patientBillsCount = document.getElementById('patientBillsCount');
  const patientChatsCount = document.getElementById('patientChatsCount');
  const patientTableBody = document.getElementById('patientTableBody');
  const patientSearch = document.getElementById('patientSearch');
  const logoutBtn = document.getElementById('logoutBtn');

  if (patientGreeting) patientGreeting.textContent = `Welcome, ${user.name || 'Patient'}`;

  const API = 'http://localhost:3000/api';

  async function loadPatients() {
    const res = await fetch(`${API}/doctor/patients?search=${encodeURIComponent(patientSearch.value || '')}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    const patients = data.patients || [];

    patientCount.textContent = patients.length;
    patientBillsCount.textContent = data.billsCount || 0;
    patientChatsCount.textContent = data.chatsCount || 0;

    patientTableBody.innerHTML = patients.map(p => `
      <tr>
        <td>${p.name || ''}</td>
        <td>${p.email || ''}</td>
        <td>${p.phone || ''}</td>
        <td>${p.dob ? new Date(p.dob).toLocaleDateString() : ''}</td>
        <td>${p.address || ''}</td>
      </tr>
    `).join('');
  }

  patientSearch.addEventListener('input', loadPatients);

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });

  await loadPatients();
});