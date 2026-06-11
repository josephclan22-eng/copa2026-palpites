import { useState } from 'react';
import { groups, stageLabels } from '../data/teams';
import PredictionModal from './PredictionModal';
import FifaMatchCard from './FifaMatchCard';
import { isMatchLocked } from '../utils/lock';

function Matches({ matches, predictions, currentUser, addPrediction, getPrediction, matchResults }) {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  const userPreds = currentUser ? predictions[currentUser.name] || [] : [];

  const filtered = matches.filter(m => {
    if (statusFilter === 'pending' && matchResults[m.id]?.played) return false;
    if (statusFilter === 'played' && !matchResults[m.id]?.played) return false;
    if (statusFilter === 'predicted' && !userPreds.some(p => p.matchId === m.id)) return false;
    if (statusFilter === 'unpredicted' && (matchResults[m.id]?.played || userPreds.some(p => p.matchId === m.id))) return false;
    if (stageFilter && m.stage !== stageFilter) return false;
    if (selectedGroup && m.group !== selectedGroup) return false;
    return true;
  });

  const handlePredict = (match) => {
    if (isMatchLocked(match)) return;
    setSelectedMatch(match);
  };

  const handleSave = (matchId, h, a) => {
    addPrediction(currentUser.name, matchId, h, a);
  };

  const stages = ['group', 'round32', 'round16', 'quarter', 'semi', 'third', 'final'];

  return (
    <div className="matches-page">
      <div className="matches-header">
        <h2>⚽ Jogos da <span>Copa 2026</span></h2>
        <div className="match-filters">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Todos</option>
            <option value="pending">Pendentes</option>
            <option value="played">Realizados</option>
            <option value="predicted">Meus palpites</option>
            <option value="unpredicted">Sem palpite</option>
          </select>
          <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
            <option value="">Todos os grupos</option>
            {groups.map(g => <option key={g} value={g}>Grupo {g}</option>)}
          </select>
        </div>
      </div>

      <div className="stage-tabs">
        <button
          className={`stage-tab ${!stageFilter ? 'active' : ''}`}
          onClick={() => { setStageFilter(''); setSelectedGroup(''); }}
        >
          Todas as fases
        </button>
        {stages.map(s => (
          <button
            key={s}
            className={`stage-tab ${stageFilter === s ? 'active' : ''}`}
            onClick={() => { setStageFilter(s); setSelectedGroup(''); }}
          >
            {stageLabels[s]}
          </button>
        ))}
      </div>

      <div className="fifa-cards-grid">
        {filtered.map(m => (
          <FifaMatchCard
            key={m.id}
            match={m}
            result={matchResults[m.id]}
            prediction={getPrediction(currentUser?.name, m.id)}
            onClick={handlePredict}
          />
        ))}
        {filtered.length === 0 && <p className="empty-msg">Nenhum jogo encontrado.</p>}
      </div>

      {selectedMatch && (
        <PredictionModal
          match={selectedMatch}
          currentPrediction={getPrediction(currentUser?.name, selectedMatch.id)}
          matchResult={matchResults[selectedMatch.id]}
          onSave={handleSave}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
}

export default Matches;
