document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth();
  if (!user) return;

  const form = document.getElementById('settings-form');
  const logoutBtn = document.getElementById('settings-logout');
  const notifToggle = document.getElementById('notif-toggle');
  const themeToggle = document.getElementById('theme-preference');

  if (form) {
    form.name.value = user.name || '';
    form.email.value = user.email || '';
    form.phone.value = user.phone || '';
    form.address.value = user.address || '';
  }

  if (notifToggle) notifToggle.checked = !!user.notificationsEnabled;
  if (themeToggle) themeToggle.checked = user.theme === 'light';

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        address: form.address.value.trim(),
        notificationsEnabled: notifToggle ? notifToggle.checked : true,
        theme: themeToggle && themeToggle.checked ? 'light' : 'dark',
        currentPassword: document.getElementById('current-password').value.trim()
      };

      try {
        const data = await apiFetch('/settings/me', {
          method: 'PUT',
          body: JSON.stringify(payload)
        });

        if (data.user?.theme) {
          localStorage.setItem('ship-theme', data.user.theme);
        }

        alert('Settings saved');
      } catch (err) {
        alert(err.message);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
});