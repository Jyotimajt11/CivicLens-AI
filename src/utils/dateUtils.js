// dateUtils — lightweight date formatting utilities

/**
 * Returns a human-readable relative time string.
 * e.g. "3 minutes ago", "2 days ago"
 *
 * @param {Date|null} date
 * @returns {string}
 */
export function formatDistanceToNow(date) {
  if (!date) return 'Just now';

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60)   return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

/**
 * Formats a Date to a short readable string.
 * e.g. "27 Apr 2026"
 */
export function formatDate(date) {
  if (!date) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

/**
 * Returns an array of the last N days as formatted date strings.
 * Useful for chart x-axis labels.
 */
export function getLastNDays(n = 7) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  });
}
