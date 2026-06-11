import { useState } from 'react';
import { calculateAllPoints, calculatePoints, getPointsLabel, getPointsColor } from '../data/scoring';
import teams, { getFlagUrl } from '../data/teams';
import Avatar from './Avatar';

function Leaderboard({ users, predictions, matches, matchResults, currentUser }) {
  const [expandedUser, setExpandedUser] = useState(null);

  const userPoints = calculateAllPoints(predictions, matches.map(m => ({
    ...m,
    ...(matchResults[m.id] || {}),
  })));

  const allWithPoints = users.map(u => [u.id, userPoints[u.id] || 0]);
  const sorted = allWithPoints
    .sort(([, a], [, b]) => b - a);

  const maxPoints = sorted.length > 0 ? sorted[0][1] : 0;

  const getMedal = (i) => {
    if (i === 0) return '🥇';
    if (i === 1) return '🥈';
    if (i === 2) return '🥉';
    return null;
  };

  const getUserStats = (userId) => {
    const userPreds = predictions[userId] || [];
    const total = userPreds.length;
    const completed = userPreds.filter(p => {
      const m = matches.find(m => m.id === p.matchId);
      return m && matchResults[m.id]?.played;
    });
    const correct = completed.filter(p => {
      const r = matchResults[p.matchId];
      return r && p.homeScore === r.homeScore && p.awayScore === r.awayScore;
    });
    return {
      total,
      completed: completed.length,
      correct: correct.length,
      accuracy: completed.length > 0 ? Math.round((correct.length / completed.length) * 100) : 0,
    };
  };

  return (
    <div className="leaderboard-page">
      <div className="lb-header">
        <div className="lb-header-icon">🏅</div>
        <div className="lb-header-text">
          <h2>Ranking de Palpites</h2>
          <p className="lb-subtitle">Clique no participante para ver os detalhes dos palpites</p>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="lb-empty">
          <span className="lb-empty-icon">🏆</span>
          <p>Ninguém pontuou ainda.</p>
          <p>Faça seus palpites e volte aqui para ver o ranking!</p>
        </div>
      ) : (
        <div className="lb-table-wrapper">
          <table className="lb-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Participante</th>
                <th>Pontos</th>
                <th>Palpites</th>
                <th>Acertos</th>
                <th>Precisão</th>
                <th>Progresso</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(([userId, pts], i) => {
                const u = users.find(user => user.id === userId);
                if (!u) return null;
                const stats = getUserStats(userId);
                const isMe = currentUser?.id === userId;
                const barWidth = maxPoints > 0 ? (pts / maxPoints) * 100 : 0;
                const isExpanded = expandedUser === userId;

                return (
                  <>
                    <tr key={userId} className={`lb-row ${isMe ? 'is-me' : ''} ${i < 3 ? 'top-three' : ''} ${isExpanded ? 'lb-row-expanded' : ''}`}
                      onClick={() => setExpandedUser(isExpanded ? null : userId)}
                    >
                      <td className="lb-pos">
                        {getMedal(i) || `${i + 1}º`}
                      </td>
                      <td className="lb-name">
                        <Avatar user={u} size={32} className="lb-avatar" />
                        {u.name}
                        {isMe && <span className="lb-badge">Você</span>}
                        <span className="lb-expand-icon">{isExpanded ? '▲' : '▼'}</span>
                      </td>
                      <td className="lb-points">{pts}</td>
                      <td className="lb-total">{stats.completed}/{stats.total}</td>
                      <td className="lb-correct">{stats.correct}</td>
                      <td className="lb-accuracy">{stats.accuracy}%</td>
                      <td className="lb-bar">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${barWidth}%` }} />
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${userId}-detail`} className="lb-detail-row">
                        <td colSpan={7}>
                          <UserPredictionDetail
                            userId={userId}
                            predictions={predictions[userId] || []}
                            matches={matches}
                            matchResults={matchResults}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="lb-rules">
        <h4>📋 Como funciona a pontuação?</h4>
        <div className="rules-grid">
          <div className="rule-item"><span className="rule-points gold">15</span>Placar exato</div>
          <div className="rule-item"><span className="rule-points green">10</span>Vencedor + diferença de gols</div>
          <div className="rule-item"><span className="rule-points light-green">7</span>Vencedor correto</div>
          <div className="rule-item"><span className="rule-points orange">5</span>Acertar placar de um time</div>
          <div className="rule-item"><span className="rule-points gray">2</span>Aproximação (diferença ≤ 2 gols)</div>
        </div>
      </div>
    </div>
  );
}

function UserPredictionDetail({ userId, predictions, matches, matchResults }) {
  const sortedPreds = [...predictions].sort((a, b) => a.matchId - b.matchId);

  return (
    <div className="lb-user-detail">
      <table className="lb-detail-table">
        <thead>
          <tr>
            <th>Jogo</th>
            <th>Time Casa</th>
            <th>Placar</th>
            <th>Time Fora</th>
            <th>Resultado</th>
            <th>Seu Palpite</th>
            <th>Pontos</th>
          </tr>
        </thead>
        <tbody>
          {sortedPreds.map(pred => {
            const match = matches.find(m => m.id === pred.matchId);
            if (!match) return null;
            const result = matchResults[match.id];
            const home = teams[match.homeTeam];
            const away = teams[match.awayTeam];
            const played = result?.played;
            const pts = played ? calculatePoints(pred, result) : 0;

            return (
              <tr key={pred.matchId}>
                <td className="lb-detail-id">M{pred.matchId}</td>
                <td className="lb-detail-team">
                  <img src={getFlagUrl(home?.code)} className="flag-img-sm" alt="" />
                  {home?.name || match.homeTeam}
                </td>
                <td className="lb-detail-score">
                  {played ? (
                    <span className="lb-detail-real-score">{result.homeScore} x {result.awayScore}</span>
                  ) : (
                    <span className="lb-detail-pend">—</span>
                  )}
                </td>
                <td className="lb-detail-team">
                  <img src={getFlagUrl(away?.code)} className="flag-img-sm" alt="" />
                  {away?.name || match.awayTeam}
                </td>
                <td className="lb-detail-status">
                  {played ? (
                    pred.homeScore === result.homeScore && pred.awayScore === result.awayScore
                      ? <span className="lb-detail-correct">✅</span>
                      : <span className="lb-detail-wrong">❌</span>
                  ) : (
                    <span className="lb-detail-pend">⏳</span>
                  )}
                </td>
                <td className="lb-detail-pred">
                  {pred.homeScore} x {pred.awayScore}
                </td>
                <td className="lb-detail-pts" style={{ color: played ? getPointsColor(pts) : 'var(--text-muted)' }}>
                  {played ? `+${pts}` : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;
