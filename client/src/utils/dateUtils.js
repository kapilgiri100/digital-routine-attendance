// Date utilities for Nepal time zone handling
const NEPAL_TIMEZONE = 'Asia/Kathmandu';

/**
 * Get current date in Nepal time zone (YYYY-MM-DD format)
 */
export function getCurrentNepalDate() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: NEPAL_TIMEZONE });
  return formatter.format(now);
}

/**
 * Format a date/timestamp for display in Nepal time zone
 */
export function formatNepalDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    timeZone: NEPAL_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Get day of week for a date in Nepal time zone
 */
export function getNepalDayOfWeek(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: NEPAL_TIMEZONE,
    weekday: 'long'
  });
  return formatter.format(date);
}

/**
 * Get date string (YYYY-MM-DD) from timestamp in Nepal time zone
 */
export function getNepalDateFromTimestamp(timestamp) {
  const date = new Date(timestamp);
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: NEPAL_TIMEZONE });
  return formatter.format(date);
}