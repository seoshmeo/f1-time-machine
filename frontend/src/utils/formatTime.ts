export function formatLapTime(milliseconds?: number | null): string {
  if (!milliseconds) return '-';

  const totalSeconds = milliseconds / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}:${seconds.toFixed(3).padStart(6, '0')}`;
  }

  return `${seconds.toFixed(3)}s`;
}

export function formatGap(gap?: string | number | null): string {
  if (!gap) return '-';

  if (typeof gap === 'number') {
    const seconds = gap / 1000;
    return `+${seconds.toFixed(3)}s`;
  }

  return gap.startsWith('+') ? gap : `+${gap}`;
}

export function formatPosition(position: number | string): string {
  const pos = typeof position === 'string' ? parseInt(position) : position;

  if (isNaN(pos)) return String(position);

  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = pos % 100;

  return pos + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

export function formatPoints(points: number): string {
  return points === 1 ? '1 pt' : `${points} pts`;
}

export function formatSpeed(speed?: string | number): string {
  if (!speed) return '-';

  if (typeof speed === 'number') {
    return `${speed.toFixed(2)} km/h`;
  }

  return speed;
}

export function parseTimeString(timeStr?: string): number | null {
  if (!timeStr) return null;

  try {
    // Format: "1:24.123" or "84.123"
    const parts = timeStr.split(':');

    if (parts.length === 2) {
      const minutes = parseInt(parts[0]);
      const seconds = parseFloat(parts[1]);
      return (minutes * 60 + seconds) * 1000;
    } else {
      return parseFloat(timeStr) * 1000;
    }
  } catch {
    return null;
  }
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }

  return `${secs}s`;
}
