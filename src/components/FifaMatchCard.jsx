import { useState, useEffect } from 'react';
import teams, { stageLabels } from '../data/teams';
import { isMatchLocked, getLockTimeRemaining } from '../utils/lock';
import { getMatchStatus } from '../utils/matchStatus';

function getGroupLabel(match) {
  if (match.stage === 'group') return `Grupo ${match.group}`;
  return stageLabels[match.stage] || match.stage || 'Group Stage';
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
      if (elapsed <= 48) { setLabel(`${elapsed}'`); return; }
      if (elapsed <= 63) { setLabel('Intervalo'); return; }
      setLabel(`${elapsed - 15}'`);
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
  const isLive = status.phase === 'live' || status.phase === 'live_local' || status.phase === 'first_half' || status.phase === 'second_half' || status.phase === 'halftime';
  const showScore = result?.matchStatus === 0 || result?.matchStatus === 3 || result?.played;
  const homeGoals = result?.homeGoals || [];
  const awayGoals = result?.awayGoals || [];
  const statusClass = getStatusClass(result);

  return (
    <div className={`fifa-card ${locked ? 'fifa-card-locked' : ''} ${isLive ? 'fifa-card-live' : ''} ${statusClass}`} onClick={() => !locked && !isLive && onClick?.(match)} style={{ cursor: onClick && !locked && !isLive ? 'pointer' : 'default' }}>
      <div className="fifa-card-header">
        <span className="fifa-card-round">{getGroupLabel(match)}</span>
        {isLive && <LiveTimer match={match} result={result} />}
        {status.phase === 'finished' && <span className="fifa-card-finished-tag">Encerrado</span>}
        {locked && !result?.played && <span className="fifa-card-lock-tag">🔒</span>}
      </div>

      <div className="fifa-card-body">
        <div className="fifa-card-match-info">
          <span className="fifa-card-match-num">Match {match.id}</span>
          {!result?.played && !isLive && <CountdownLabel match={match} />}
          {!isLive && <span className="fifa-card-date">{match.date}</span>}
          {!isLive && <span className="fifa-card-time">{match.time}</span>}
        </div>

        <div className="fifa-card-teams">
          <div className="fifa-card-team">
            <div className="fifa-card-team-row">
              <div className="fifa-card-team-logo">
                <img src={getBadgeUrl(match.homeTeam)} alt={homeName} loading="lazy" />
              </div>
              <span className="fifa-card-team-name">{homeName}</span>
              <div className={`fifa-card-score ${isLive ? 'fifa-card-score-live' : ''}`}>
                {showScore ? homeScore : '-'}
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
          </div>

          <div className="fifa-card-team">
            <div className="fifa-card-team-row">
              <div className="fifa-card-team-logo">
                <img src={getBadgeUrl(match.awayTeam)} alt={awayName} loading="lazy" />
              </div>
              <span className="fifa-card-team-name">{awayName}</span>
              <div className={`fifa-card-score ${isLive ? 'fifa-card-score-live' : ''}`}>
                {showScore ? awayScore : '-'}
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
        </div>

        <div className="fifa-card-location">
          <svg className="fifa-card-location-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{match.venue}</span>
        </div>

        {prediction && !result?.played && !isLive && (
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
