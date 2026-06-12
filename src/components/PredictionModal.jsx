import { useState } from 'react';
import teams, { getFlagUrl } from '../data/teams';
import { isMatchLocked } from '../utils/lock';
import { calculatePoints, getPointsLabel, getPointsColor } from '../data/scoring';

function PredictionModal({ match, currentPrediction, onSave, onClose, matchResult }) {
  const [homeScore, setHomeScore] = useState(currentPrediction?.homeScore ?? '');
  const [awayScore, setAwayScore] = useState(currentPrediction?.awayScore ?? '');

  const home = teams[match.homeTeam];
  const away = teams[match.awayTeam];

  const isPlayed = matchResult?.played;
  const isKnockout = match.stage !== 'group';
  const locked = isMatchLocked(match);

  const predPoints = isPlayed && currentPrediction
    ? calculatePoints(currentPrediction, matchResult)
    : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const h = Number(homeScore);
    const a = Number(awayScore);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return;
    onSave(match.id, h, a);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <span className="modal-round">
            {match.stage === 'group' ? `Grupo ${match.group}` : match.stage === 'round32' ? 'Oitavas (32)' : match.stage === 'round16' ? 'Oitavas (16)' : match.stage === 'quarter' ? 'Quartas' : match.stage === 'semi' ? 'Semifinal' : match.stage === 'third' ? '3º Lugar' : 'Final'}
          </span>
          <span className="modal-date">{match.date} • {match.time}</span>
        </div>

        <div className="modal-teams">
          <div className="modal-team">
            <img src={getFlagUrl(home?.code, 40)} className="flag-img-lg" alt="" />
            <span className="modal-team-name">{home?.name || match.homeTeam}</span>
            {home?.rank && <span className="modal-rank">FIFA {home.rank}º</span>}
          </div>
          <span className="modal-vs">VS</span>
          <div className="modal-team">
            <img src={getFlagUrl(away?.code, 40)} className="flag-img-lg" alt="" />
            <span className="modal-team-name">{away?.name || match.awayTeam}</span>
            {away?.rank && <span className="modal-rank">FIFA {away.rank}º</span>}
          </div>
        </div>

        <div className="modal-venue">{match.venue}</div>

        {isPlayed && (
          <div className="modal-result">
            <strong>Resultado:</strong> {matchResult.homeScore} x {matchResult.awayScore}
          </div>
        )}
        {predPoints !== null && (
          <div className="modal-points" style={{ color: getPointsColor(predPoints) }}>
            <strong>Pontos: {predPoints}</strong> — {getPointsLabel(predPoints)}
          </div>
        )}

        {locked && !isPlayed && (
          <div className="modal-locked">
            🔒 Palpites fechados — a partida já começou ou está prestes a começar
          </div>
        )}

        {!isPlayed && !locked && (
          <form className="modal-form" onSubmit={handleSubmit}>
            <label className="modal-label">Seu Palpite:</label>
            <div className="score-inputs">
              <div className="score-field">
                <span className="score-team-label"><img src={getFlagUrl(home?.code)} className="flag-img-sm" alt="" /> {home?.name || 'Casa'}</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
              <span className="score-x">x</span>
              <div className="score-field">
                <span className="score-team-label"><img src={getFlagUrl(away?.code)} className="flag-img-sm" alt="" /> {away?.name || 'Fora'}</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            </div>
            <button type="submit" className="modal-submit">
              {currentPrediction ? 'Atualizar Palpite' : 'Confirmar Palpite'}
            </button>
          </form>
        )}

        {locked && currentPrediction && (
          <div className="modal-prediction-result">
            <strong>Seu palpite:</strong> {currentPrediction.homeScore} x {currentPrediction.awayScore}
          </div>
        )}

        {locked && !currentPrediction && (
          <div className="modal-prediction-result">
            Você não fez palpite para esta partida
          </div>
        )}
      </div>
    </div>
  );
}

export default PredictionModal;
