// returns true if oldPwd matches the stored one
export function verifyPassword(user, oldPwd, teachers = []) {
  if (user.type === 'hod') return oldPwd === (localStorage.getItem('hodPassword') || 'hod2025');
  if (user.type === 'teacher') {
    const t = teachers.find(x => x.id === user.id);
    return t ? (t.password || user.name) === oldPwd : false; // fallback to name if no password field
  }
  return false;
}

// updates password in localStorage AND in the live teachers array
export function updatePassword(user, newPwd, teachers, setTeachers) {
  if (user.type === 'hod') {
    localStorage.setItem('hodPassword', newPwd);
    return;
  }
  if (user.type === 'teacher') {
    const updated = teachers.map(t =>
      t.id === user.id ? { ...t, password: newPwd } : t
    );
    setTeachers(updated);
    localStorage.setItem('teachers', JSON.stringify(updated));
  }
}