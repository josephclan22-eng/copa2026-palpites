function getMatchTimestamp(match) {
  const [day, month] = match.date.split('/')
  const [hour, minute] = match.time.split(':')
  return new Date(2026, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute)).getTime()
}

export function getMatchStatus(match, matchResult) {
  const now = Date.now()
  const start = getMatchTimestamp(match)
  const elapsed = (now - start) / 60000

  if (matchResult?.matchStatus === 0) {
    return { phase: 'finished', label: 'Encerrado', elapsed: null }
  }

  if (matchResult?.matchStatus === 3 && matchResult?.matchTime) {
    const raw = matchResult.matchTime.replace(/'/g, '').trim()
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

  if (elapsed <= 63) {
    return { phase: 'halftime', label: 'Intervalo', elapsed: null }
  }

  if (elapsed <= 120) {
    const secondHalf = Math.floor(elapsed - 15)
    return { phase: 'live_local', label: `${secondHalf}' 2ºT`, elapsed: secondHalf }
  }

  return { phase: 'finished', label: 'Encerrado', elapsed: null }
}
