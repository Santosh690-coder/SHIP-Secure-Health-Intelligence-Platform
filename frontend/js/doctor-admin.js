document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const doctorGreeting = document.getElementById('doctorGreeting');
  const doctorPatientsCount = document.getElementById('doctorPatientsCount');
  const doctorAppointmentsCount = document.getElementById('doctorAppointmentsCount');
  const doctorChatsCount = document.getElementById('doctorChatsCount');
  const doctorPatientsBody = document.getElementById('doctorPatientsBody');
  const doctorSearch = document.getElementById('doctorSearch');
  const logoutBtn = document.getElementById('logoutBtn');

  if (doctorGreeting) doctorGreeting.textContent = `Welcome, Dr. ${user.name || 'Doctor'}`;

  const API = 'http://localhost:3000/api';

  async function loadPatients() {
    const res = await fetch(`${API}/doctor/patients?search=${encodeURIComponent(doctorSearch.value || '')}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    const patients = data.patients || [];

    doctorPatientsCount.textContent = patients.length;
    doctorAppointmentsCount.textContent = data.appointmentsCount || 0;
    doctorChatsCount.textContent = data.chatsCount || 0;

    doctorPatientsBody.innerHTML = patients.map(p => `
      <tr>
        <td>${p.name || ''}</td>
        <td>${p.email || ''}</td>
        <td>${p.phone || ''}</td>
        <td>${p.dob ? new Date(p.dob).toLocaleDateString() : ''}</td>
        <td>${p.address || ''}</td>
      </tr>
    `).join('');
  }

  doctorSearch.addEventListener('input', loadPatients);

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });

  await loadPatients();
});