function getMatchTimestamp(match) {
  const [day, month] = match.date.split('/')
  const [hour, minute] = match.time.split(':')
  return new Date(2026, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute)).getTime()
}

export function getMatchStatus(match, matchResult) {
  const now = Date.now()
  const start = getMatchTimestamp(match)
  const elapsed = (now - start) / 60000

  if (matchResult?.match_status === 0) {
    return { phase: 'finished', label: 'Encerrado', elapsed: null }
  }

  if (matchResult?.match_status === 3 && matchResult?.match_time) {
    const raw = matchResult.match_time.replace(/'/g, '').trim()
    const mins = parseInt(raw)
    if (!isNaN(mins)) {
      const half = mins <= 45 ? '1ºT' : '2ºT'
      return { phase: 'live', label: `${mins}' ${half}`, elapsed: mins }
    }
  }

  if (matchResult?.played) {
    return { phase: 'finished', label: 'Encerrado', elapsed: null }
  }

  if (elapsed < 0) {
    return { phase: 'scheduled', label: 'Não iniciado', elapsed: null }
  }

  if (elapsed <= 48) {
    return { phase: 'live_local', label: `${Math.floor(elapsed)}' 1ºT`, elapsed: Math.floor(elapsed) }
  }

  if (elapsed <= 60) {
    return { phase: 'halftime', label: 'Intervalo', elapsed: null }
  }

  if (elapsed <= 110) {
    return { phase: 'live_local', label: `${Math.floor(elapsed - 12)}' 2ºT`, elapsed: Math.floor(elapsed - 12) }
  }

  return { phase: 'finished', label: 'Encerrado', elapsed: null }
}
