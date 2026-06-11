import { useState, useEffect } from 'react';

function getMatchTimestamp(match) {
  const [day, month] = match.date.split('/');
  const [hour, minute] = match.time.split(':');
  return new Date(2026, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute)).getTime();
}

const LOCK_MINUTES = 10;

export function useCountdown(match) {
  const matchTime = getMatchTimestamp(match);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [matchTime]);

  const diffMs = matchTime - now;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffSeconds = Math.floor(diffMs / 1000);
  const locked = diffMinutes <= LOCK_MINUTES;

  let label = '';
  if (diffMinutes <= 0) {
    if (diffSeconds <= 0) label = 'Fechado';
    else label = `${diffSeconds}s`;
  } else if (diffMinutes <= LOCK_MINUTES) {
    label = `Fecha em ${diffMinutes}min`;
  } else if (diffMinutes < 60) {
    label = `${diffMinutes}min`;
  } else if (diffMinutes < 1440) {
    const h = Math.floor(diffMinutes / 60);
    label = `${h}h`;
  } else {
    const d = Math.floor(diffMinutes / 1440);
    label = `${d}d`;
  }

  return { locked, label, diffMinutes, diffMs };
}
