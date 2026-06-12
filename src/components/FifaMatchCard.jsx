import { useState, useEffect } from 'react';
import teams, { stageLabels } from '../data/teams';
import { isMatchLocked, getLockTimeRemaining } from '../utils/lock';

function getGroupLabel(match) {
  if (match.stage === 'group') return `Grupo ${match.group}`;
  return stageLabels[match.stage] || match.stage || 'Group Stage';
}

function getMatchStatus(match, result) {
  if (!result) return 'scheduled';
  if (result.played) return 'finished';
  if (result.matchStatus === 0) return 'finished';
  if ((result.matchTime || result.matchStatus === 3) && result.homeScore != null && result.awayScore != null) return 'live';
  if (isMatchLocked(match)) return 'live';
  return 'scheduled';
}

function getMatchLabel(result) {
  if (!result) return null;
  if (result.played || result.matchStatus === 0) return 'Encerrado';
  const t = result.matchTime || '';
  const mins = parseInt(t);
  if (isNaN(mins)) return 'Ao Vivo';
  if (mins <= 45) return `1ºT ${mins}'`;
  if (mins <= 60) return `Intervalo`;
  return `2ºT ${mins}'`;
}

function getTeamName(teamKey) {
  const t = teams[teamKey];
  if (!t) return teamKey;
  return t.name;
}

function getBadgeUrl(teamKey) {
  const t = teams[teamKey];
  if (t?.code) {
    return `https://flagcdn.com/h60/${t.code.toLowerCase()}.png`;
  }
  return `https://flagcdn.com/h60/${teamKey}.png`;
}

function getStatusClass(result) {
  if (!result) return '';
  if (result.played) return 'finished';
  if (result.matchTime) return 'live';
  const mins = parseInt(result.matchTime);
  if (!isNaN(mins) && mins <= 45) return 'first-half';
  if (!isNaN(mins) && mins > 45 && mins <= 60) return 'halftime';
  return 'second-half';
}

function CountdownLabel({ match }) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    function tick() {
      const remaining = getLockTimeRemaining(match);
      if (remaining <= 0) {
        setLabel('🔒 Fechado');
      } else if (remaining <= 10) {
        setLabel(`🔒 Fecha em ${remaining}min`);
      } else if (remaining < 60) {
        setLabel(`${remaining}min`);
      } else if (remaining < 1440) {
        setLabel(`${Math.floor(remaining / 60)}h`);
      } else {
        setLabel(`${Math.floor(remaining / 1440)}d`);
      }
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [match]);

  return label ? <span className="fifa-card-countdown">{label}</span> : null;
}

function LiveTimer({ match, result }) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (result?.matchTime) {
      setLabel(result.matchTime);
      return;
    }

    function tick() {
      const remaining = getLockTimeRemaining(match);
      const elapsed = Math.abs(Math.min(remaining, 0));
      if (elapsed < 90) { setLabel(`${elapsed}'`); return; }
      setLabel(`90'+${Math.min(elapsed - 90, 30)}`);
    }

    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [match, result]);

  return label ? <span className="fifa-card-live-tag live">{label}</span> : null;
}

function FifaMatchCard({ match, result, prediction, onClick }) {
  const status = getMatchStatus(match, result);
  const homeScore = result?.homeScore;
  const awayScore = result?.awayScore;
  const homeName = getTeamName(match.homeTeam);
  const awayName = getTeamName(match.awayTeam);
  const locked = !result?.played && isMatchLocked(match);
  const matchLabel = getMatchLabel(result);
  const statusClass = getStatusClass(result);
  const homeGoals = result?.homeGoals || [];
  const awayGoals = result?.awayGoals || [];

  return (
    <div className={`fifa-card ${locked ? 'fifa-card-locked' : ''} ${statusClass}`} onClick={() => !locked && onClick?.(match)} style={{ cursor: onClick && !locked ? 'pointer' : 'default' }}>
      <div className="fifa-card-header">
        <span className="fifa-card-round">{getGroupLabel(match)}</span>
        {status === 'live' && <LiveTimer match={match} result={result} />}
        {status === 'finished' && <span className="fifa-card-finished-tag">Encerrado</span>}
        {locked && !result?.played && <span className="fifa-card-lock-tag">🔒</span>}
      </div>

      <div className="fifa-card-body">
        <div className="fifa-card-match-info">
          <span className="fifa-card-match-num">Match {match.id}</span>
          {!result?.played && !result?.matchTime && <CountdownLabel match={match} />}
          {matchLabel && <span className="fifa-card-status-label">{matchLabel}</span>}
          <span className="fifa-card-date">{match.date}</span>
          <span className="fifa-card-time">{match.time}</span>
        </div>

        <div className="fifa-card-teams">
          <div className="fifa-card-team">
            <div className="fifa-card-team-logo">
              <img src={getBadgeUrl(match.homeTeam)} alt={homeName} loading="lazy" />
            </div>
            <span className="fifa-card-team-name">{homeName}</span>
            <div className={`fifa-card-score ${status === 'live' ? 'fifa-card-score-live' : ''}`}>
              {status !== 'scheduled' ? homeScore : '-'}
            </div>
          </div>
          {homeGoals.length > 0 && (
            <div className="fifa-card-goals home-goals">
              {homeGoals.map((g, i) => (
                <span key={i} className="goal-item" title={`${g.player} ${g.minute}'`}>
                  ⚽ {g.player} {g.minute}'
                </span>
              ))}
            </div>
          )}

          <div className="fifa-card-team">
            <div className="fifa-card-team-logo">
              <img src={getBadgeUrl(match.awayTeam)} alt={awayName} loading="lazy" />
            </div>
            <span className="fifa-card-team-name">{awayName}</span>
            <div className={`fifa-card-score ${status === 'live' ? 'fifa-card-score-live' : ''}`}>
              {status !== 'scheduled' ? awayScore : '-'}
            </div>
          </div>
          {awayGoals.length > 0 && (
            <div className="fifa-card-goals away-goals">
              {awayGoals.map((g, i) => (
                <span key={i} className="goal-item" title={`${g.player} ${g.minute}'`}>
                  ⚽ {g.player} {g.minute}'
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="fifa-card-location">
          <svg className="fifa-card-location-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{match.venue}</span>
        </div>

        {prediction && !result?.played && (
          <div className="fifa-card-prediction">
            Seu palpite: {prediction.homeScore} x {prediction.awayScore}
          </div>
        )}
      </div>

      <div className="fifa-card-footer">
        <span>World Cup 2026</span>
        <span className="fifa-card-footer-id">M{match.id}</span>
      </div>
    </div>
  );
}

export default FifaMatchCard;
