document.addEventListener('DOMContentLoaded', () => {
  const billingBody = document.getElementById('billingBody');
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const totalBills = document.getElementById('totalBills');
  const totalPaid = document.getElementById('totalPaid');
  const totalPending = document.getElementById('totalPending');
  const refreshBtn = document.getElementById('refreshBtn');

  async function loadBills() {
    const search = searchInput.value.trim();
    const status = statusFilter.value;
    const res = await fetch(`http://localhost:3000/api/billing?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`);
    const data = await res.json();

    billingBody.innerHTML = '';

    (data.bills || []).forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.billId}</td>
        <td>${item.patient}</td>
        <td>${item.doctor}</td>
        <td>${item.service}</td>
        <td>₹${item.amount.toLocaleString()}</td>
        <td>₹${item.paid.toLocaleString()}</td>
        <td><span class="badge ${item.status}">${item.status}</span></td>
        <td>${new Date(item.date).toLocaleDateString()}</td>
      `;
      billingBody.appendChild(tr);
    });

    totalBills.textContent = data.summary?.totalBills || 0;
    totalPaid.textContent = `₹${(data.summary?.totalPaid || 0).toLocaleString()}`;
    totalPending.textContent = `₹${(data.summary?.totalPending || 0).toLocaleString()}`;
  }

  searchInput.addEventListener('input', loadBills);
  statusFilter.addEventListener('change', loadBills);
  refreshBtn.addEventListener('click', () => {
    searchInput.value = '';
    statusFilter.value = 'all';
    loadBills();
  });

  loadBills();
});