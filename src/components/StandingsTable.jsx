import teams, { getFlagUrl } from '../data/teams';

function StandingsTable({ standings, bestThird, matches, matchResults }) {
  if (!standings || Object.keys(standings).length === 0) {
    return (
      <div className="standings-page">
        <div className="standings-header">
          <div className="standings-header-icon">📊</div>
          <div className="standings-header-text">
            <h2>Grupos da <span>Copa 2026</span></h2>
            <p className="standings-subtitle">Atualizados automaticamente conforme o site da FIFA</p>
          </div>
        </div>
        <p className="empty-msg">Nenhum resultado ainda. Insira resultados no Admin para ver a classificação.</p>
      </div>
    );
  }

  return (
    <div className="standings-page">
      <div className="standings-header">
        <div className="standings-header-icon">📊</div>
        <div className="standings-header-text">
          <h2>Grupos da <span>Copa 2026</span></h2>
          <p className="standings-subtitle">
            Atualizados automaticamente conforme o site da FIFA
            {bestThird.length > 0 && (
              <span> — {bestThird.length} melhores terceiros colocados</span>
            )}
          </p>
        </div>
      </div>

      <div className="standings-grid">
        {Object.entries(standings).sort(([a], [b]) => a.localeCompare(b)).map(([group, teamsList]) => {
          const allPlayed = teamsList.every(t => t.gp === 3);
          return (
            <div key={group} className="standings-group">
              <div className="standings-group-header">
                <h3>Grupo {group}</h3>
                {allPlayed && <span className="standings-badge">Completo</span>}
              </div>
              <table className="standings-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Time</th>
                    <th>P</th>
                    <th>J</th>
                    <th>V</th>
                    <th>E</th>
                    <th>D</th>
                    <th>GP</th>
                    <th>GC</th>
                    <th>SG</th>
                  </tr>
                </thead>
                <tbody>
                  {teamsList.map((t, i) => {
                    const teamInfo = teams[t.team];
                    const isQualified = i < 2 && allPlayed;
                    const isThird = i === 2 && allPlayed && bestThird.some(bt => bt.team === t.team);
                    const flagUrl = teamInfo ? getFlagUrl(teamInfo.code) : '';
                    return (
                      <tr key={t.team} className={`standings-row ${isQualified ? 'qualified' : ''} ${isThird ? 'third-qualified' : ''}`}>
                        <td className="standings-pos">{i + 1}</td>
                        <td className="standings-team">
                          {flagUrl && <img src={flagUrl} className="flag-img" alt="" />}
                          {teamInfo?.name || t.team}
                          {isQualified && <span className="standings-check">✓</span>}
                          {isThird && <span className="standings-check third">✓</span>}
                        </td>
                        <td className="standings-pts">{t.pts}</td>
                        <td className="standings-num">{t.gp}</td>
                        <td className="standings-num">{t.w}</td>
                        <td className="standings-num">{t.d}</td>
                        <td className="standings-num">{t.l}</td>
                        <td className="standings-num">{t.gf}</td>
                        <td className="standings-num">{t.ga}</td>
                        <td className="standings-gd">{t.gd > 0 ? `+${t.gd}` : t.gd}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {bestThird.length > 0 && (
        <div className="best-third-section">
          <h3>🏅 Melhores Terceiros Colocados (classificados)</h3>
          <div className="best-third-list">
            {bestThird.sort((a, b) => b.pts - a.pts || b.gd - a.gd).map((t, i) => {
              const teamInfo = teams[t.team];
              return (
                <div key={t.team} className="best-third-card">
                  <span className="best-third-pos">{i + 1}º</span>
                  <img src={getFlagUrl(teamInfo?.code)} className="flag-img" alt="" />
                  <span className="best-third-name">{teamInfo?.name || t.team}</span>
                  <span className="best-third-group">Grupo {t.group}</span>
                  <span className="best-third-stat">{t.pts} pts</span>
                  <span className="best-third-stat">SG: {t.gd > 0 ? `+${t.gd}` : t.gd}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default StandingsTable;
