export function calculatePoints(prediction, actual) {
  if (!prediction || !actual) return 0;

  const pHome = Number(prediction.homeScore);
  const pAway = Number(prediction.awayScore);
  const aHome = Number(actual.homeScore);
  const aAway = Number(actual.awayScore);

  if (isNaN(pHome) || isNaN(pAway) || isNaN(aHome) || isNaN(aAway)) return 0;

  const exactHome = pHome === aHome;
  const exactAway = pAway === aAway;
  const predDiff = pHome - pAway;
  const actualDiff = aHome - aAway;
  const predWinner = predDiff > 0 ? 'home' : predDiff < 0 ? 'away' : 'draw';
  const actualWinner = actualDiff > 0 ? 'home' : actualDiff < 0 ? 'away' : 'draw';
  const sameWinner = predWinner === actualWinner;
  const sameDiff = predDiff === actualDiff;

  // 15 pts - Placar exato
  if (exactHome && exactAway) return 15;

  // 10 pts - Vencedor correto + diferença de gols correta
  if (sameWinner && sameDiff) return 10;

  // 7 pts - Vencedor correto (ou empate)
  if (sameWinner) return 7;

  // 5 pts - Acertou o placar de um dos times
  if (exactHome || exactAway) return 5;

  // 2 pts - Aproximação (total de gols com diferença <= 2)
  const predTotal = pHome + pAway;
  const actualTotal = aHome + aAway;
  if (Math.abs(predTotal - actualTotal) <= 2) return 2;

  return 0;
}

export function calculateAllPoints(predictions, matches) {
  const userPoints = {};

  Object.entries(predictions).forEach(([userId, userPreds]) => {
    userPoints[userId] = 0;
    userPreds.forEach(pred => {
      const match = matches.find(m => m.id === pred.matchId);
      if (!match) return;
      if (match.homeScore == null || match.awayScore == null) return;
      userPoints[userId] += calculatePoints(pred, match);
    });
  });

  return userPoints;
}

export function getPointsLabel(points) {
  if (points >= 15) return 'Palpite Perfeito!';
  if (points >= 10) return 'Quase Perfeito!';
  if (points >= 7) return 'Bom Palpite!';
  if (points >= 5) return 'Palpite Mediano';
  if (points >= 2) return 'Passou Perto';
  return 'Errou';
}

export function getPointsColor(points) {
  if (points >= 15) return '#FFD700';
  if (points >= 10) return '#4CAF50';
  if (points >= 7) return '#81C784';
  if (points >= 5) return '#FFA726';
  if (points >= 2) return '#78909C';
  return '#EF5350';
}
