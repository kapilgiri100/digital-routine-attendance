export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Generate flexible time slots based on from/to/duration
export function generateSlots(fromTime, toTime, durationMin) {
  const fromMinutes = timeToMinutes(fromTime);
  const toMinutes = timeToMinutes(toTime);

  if (fromMinutes >= toMinutes || durationMin <= 0) {
    return [];
  }

  const slots = [];
  let current = fromMinutes;

  while (current + durationMin <= toMinutes) {
    const end = Math.min(current + durationMin, toMinutes);
    const label = `${minutesToTime12(current)} - ${minutesToTime12(end)}`;
    slots.push({
      label,
      from: minutesToTime24(current),
      to: minutesToTime24(end),
      from12: minutesToTime12(current),
      to12: minutesToTime12(end)
    });
    current = end;
  }

  return slots;
}

// Convert HH:MM (24hr) to minutes since midnight
export function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Minutes to HH:MM 24hr
export function minutesToTime24(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Minutes to h:mm AM/PM
export function minutesToTime12(minutes) {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const hours12 = hours24 % 12 || 12;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  return `${hours12}:${mins.toString().padStart(2, '0')} ${ampm}`;
}

// Time options every 15 minutes 6AM-8PM
export function getTimeOptions() {
  const options = [];
  for (let hour = 6; hour <= 20; hour++) {
    for (let min = 0; min < 60; min += 15) {
      const time24 = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      options.push({
        value: time24,
        label: minutesToTime12(hour * 60 + min)
      });
    }
  }
  return options;
}

// Empty schedule (no pre-fill for flexible slots)
export function buildEmptySchedule() {
  const empty = {};
  days.forEach(d => {
    empty[d] = {};
  });
  return empty;
}

// Validate schedule against existing teachers and subjects
export function validateSchedule(schedule, teachers, subjects) {
  const errors = [];
  const teacherIds = new Set(teachers?.map(t => t.id) || []);
  const subjectNames = new Set(subjects?.map(s => s.name) || []);

  for (const day in schedule) {
    const daySchedule = schedule[day];
    if (typeof daySchedule === 'object') {
      for (const slot in daySchedule) {
        const entry = daySchedule[slot];
        if (entry) {
          if (entry.teacherId && !teacherIds.has(entry.teacherId)) {
            errors.push(`Day ${day}, Slot ${slot}: Teacher ID ${entry.teacherId} does not exist`);
          }
          if (entry.subject && !subjectNames.has(entry.subject)) {
            errors.push(`Day ${day}, Slot ${slot}: Subject "${entry.subject}" does not exist`);
          }
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Clean schedule by removing orphaned references
export function cleanSchedule(schedule, teachers, subjects) {
  const cleanedSchedule = {};
  const teacherIds = new Set(teachers?.map(t => t.id) || []);
  const subjectNames = new Set(subjects?.map(s => s.name) || []);

  for (const day in schedule) {
    cleanedSchedule[day] = {};
    const daySchedule = schedule[day];
    if (typeof daySchedule === 'object') {
      for (const slot in daySchedule) {
        const entry = daySchedule[slot];
        if (entry && entry.teacherId && entry.subject &&
          teacherIds.has(entry.teacherId) && subjectNames.has(entry.subject)) {
          cleanedSchedule[day][slot] = entry;
        }
      }
    }
  }

  return cleanedSchedule;
}

// Backward compat - empty slots array
export const slots = [];
export const defaultSlots = [];

// Format functions (legacy)
export function parseTime12(time12) {
  const [time, ampm] = time12.split(' ');
  if (!time || !ampm) return NaN;
  let [hours, minutes] = time.split(':').map(Number);
  if (typeof hours !== 'number' || typeof minutes !== 'number' || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return NaN;
  }
  if (ampm === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (ampm === 'AM' && hours === 12) {
    hours = 0;
  }
  return hours * 60 + minutes;
}

export function formatTime12(time24) {
  return minutesToTime12(timeToMinutes(time24));
}

export function formatTimeSpan(from, to) {
  return `${minutesToTime12(timeToMinutes(from))} - ${minutesToTime12(timeToMinutes(to))}`;
}
