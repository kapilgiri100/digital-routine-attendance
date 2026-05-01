const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Ping server on app load to wake it up early
export async function wakeUpServer() {
  try {
    await fetch(`${API_BASE}/health`, { method: 'GET' });
    console.log('Server is awake');
  } catch {
    console.log('Server waking up...');
  }
}

async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {})
    }
  };
  const response = await fetch(`${API_BASE}${endpoint}`, config);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `API error: ${response.status}`);
  }
  return response.json();
}

// Check if system is initialized (HOD exists)
export async function checkStatus() {
  const response = await fetch(`${API_BASE}/auth/status`);
  return response.json();
}

// First-time HOD registration
export async function registerHOD(name, password) {
  const response = await fetch(`${API_BASE}/auth/register-hod`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Registration failed');
  }
  const data = await response.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}

// Login with auto-retry for Render cold start
export async function authenticateUser(type, credentials) {
  const payload = {
    type,
    credentials: {
      ...credentials,
      name: credentials.name ? credentials.name.trim() : undefined,
      roll: credentials.roll !== undefined ? String(credentials.roll).trim() : undefined,
      dob: typeof credentials.dob === 'string' ? credentials.dob.trim() : undefined
    }
  };

  const MAX_ATTEMPTS = 5;
  const RETRY_DELAY = 5000;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        try {
          const err = JSON.parse(text);
          throw new Error(err.error || 'Login failed');
        } catch {
          throw new Error(`Server error (${response.status}): ${text || 'No response body'}`);
        }
      }

      const text = await response.text().catch(() => '');
      if (!text) {
        if (attempt < MAX_ATTEMPTS) {
          console.log(`Server waking up... attempt ${attempt}/${MAX_ATTEMPTS}`);
          await new Promise(r => setTimeout(r, RETRY_DELAY));
          continue;
        }
        throw new Error('Server took too long to respond. Please try again.');
      }

      const data = JSON.parse(text);
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;

    } catch (err) {
      clearTimeout(timeout);

      if (err.name === 'AbortError' || err.message === 'Failed to fetch') {
        if (attempt < MAX_ATTEMPTS) {
          console.log(`Connection failed, retrying... attempt ${attempt}/${MAX_ATTEMPTS}`);
          await new Promise(r => setTimeout(r, RETRY_DELAY));
          continue;
        }
        throw new Error('Server is not responding. Please try again in a minute.');
      }

      throw err;
    }
  }
}

export async function setupUserPassword(userId, password) {
  const response = await fetch(`${API_BASE}/auth/setup-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, password })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Setup failed');
  }
  return response.json();
}

export async function changePassword(currentPassword, newPassword) {
  return apiCall('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword })
  });
}

// Teachers
export async function getTeachers() { return apiCall('/teachers'); }
export async function addTeacher(name, subject, password = 'teacher123') {
  return apiCall('/teachers', { method: 'POST', body: JSON.stringify({ name, subject, password }) });
}
export async function updateTeacher(id, name, subject) {
  return apiCall(`/teachers/${id}`, { method: 'PUT', body: JSON.stringify({ name, subject }) });
}
export async function deleteTeacher(id) {
  await apiCall(`/teachers/${id}`, { method: 'DELETE' });
}

// Students
export async function getStudents() { return apiCall('/students'); }
export async function addStudent(roll, name, dob) {
  return apiCall('/students', { method: 'POST', body: JSON.stringify({ roll, name, dob }) });
}
export async function deleteStudent(roll) {
  await apiCall(`/students/${roll}`, { method: 'DELETE' });
}

// Schedule
export async function getSchedule() { return apiCall('/schedule'); }
export async function updateSchedule(newSchedule) {
  return apiCall('/schedule', { method: 'PUT', body: JSON.stringify({ data: newSchedule }) });
}

// Attendance
export async function getAttendance() { return apiCall('/attendance'); }
export async function markAttendance(day, time_slot, rollsPresent) {
  return apiCall('/attendance', { method: 'POST', body: JSON.stringify({ day, time_slot, rollsPresent }) });
}

// Academic Year
export async function getAcademicYear() { return apiCall('/academic-year'); }
export async function updateAcademicYear({ year, semester }) {
  return apiCall('/academic-year', { method: 'PUT', body: JSON.stringify({ year, semester }) });
}

// Subjects
export async function getSubjects() { return apiCall('/subjects'); }
export async function addSubject(name) {
  return apiCall('/subjects', { method: 'POST', body: JSON.stringify({ name }) });
}
export async function deleteSubject(id) {
  await apiCall(`/subjects/${id}`, { method: 'DELETE' });
}

export async function healthCheck() { return apiCall('/health'); }
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}