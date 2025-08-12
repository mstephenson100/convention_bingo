const API_BASE = 'http://127.0.0.1:5500/api';

function authHeaders(extra = {}) {
  const token = localStorage.getItem('auth_token');
  return {
    ...extra,
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/users`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function fetchCard(userId) {
  const res = await fetch(`${API_BASE}/card/${userId}`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function generateCard(userId) {
  const res = await fetch(`${API_BASE}/card/${userId}`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return res.json();
}

export async function uploadImage(userId, row, col, file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/card/${userId}/${row}/${col}/upload`, {
    method: "POST",
    headers: authHeaders(), // only adds Authorization — FormData handles content-type
    body: formData,
  });

  return res.json();
}
