export function calculateGroupStandings(matches, matchResults) {
  const groups = {};
  const groupMatches = matches.filter(m => m.stage === 'group');

  for (const m of groupMatches) {
    for (const team of [m.homeTeam, m.awayTeam]) {
      if (!groups[m.group]) groups[m.group] = {};
      if (!groups[m.group][team]) {
        groups[m.group][team] = { team, group: m.group, pts: 0, gp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0 };
      }
    }
  }

  for (const m of groupMatches) {
    const result = matchResults[m.id];
    if (!result || result.homeScore == null || result.awayScore == null) continue;

    const home = groups[m.group][m.homeTeam];
    const away = groups[m.group][m.awayTeam];
    const hs = Number(result.homeScore);
    const as = Number(result.awayScore);

    home.gp++; away.gp++;
    home.gf += hs; home.ga += as;
    away.gf += as; away.ga += hs;
    home.gd = home.gf - home.ga;
    away.gd = away.gf - away.ga;

    if (hs > as) { home.w++; home.pts += 3; away.l++; }
    else if (hs < as) { away.w++; away.pts += 3; home.l++; }
    else { home.d++; home.pts += 1; away.d++; away.pts += 1; }
  }

  const sorted = {};
  for (const g of Object.keys(groups).sort()) {
    sorted[g] = Object.values(groups[g]).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.team.localeCompare(b.team);
    });
  }

  return sorted;
}

export function isGroupComplete(matches, matchResults, group) {
  const groupMatches = matches.filter(m => m.stage === 'group' && m.group === group);
  return groupMatches.every(m => matchResults[m.id]?.played);
}

export function getBestThirdPlaced(standings, matches, matchResults) {
  const thirdPlaced = [];
  for (const [group, teams] of Object.entries(standings)) {
    if (teams.length >= 3) {
      const third = teams[2];
      if (third.gp === 3) {
        thirdPlaced.push({ ...third, group });
      }
    }
  }
  return thirdPlaced.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return 0;
  }).slice(0, 8);
}

function resolveTeam(teamPlaceholder, standings, bestThird, matches, matchResults) {
  if (!teamPlaceholder) return null;
  if (teamPlaceholder.startsWith('W') || teamPlaceholder.startsWith('L')) {
    const matchId = parseInt(teamPlaceholder.slice(1));
    const match = matches.find(m => m.id === matchId);
    const r = matchResults[matchId];
    if (!match || !r) return null;
    const hs = Number(r.homeScore);
    const as = Number(r.awayScore);
    if (isNaN(hs) || isNaN(as)) return null;
    if (teamPlaceholder.startsWith('W')) {
      if (hs > as) return match.homeTeam;
      if (as > hs) return match.awayTeam;
      return null;
    } else {
      if (hs < as) return match.homeTeam;
      if (as < hs) return match.awayTeam;
      return null;
    }
  }

  if (/^[12]\w$/.test(teamPlaceholder)) {
    const group = teamPlaceholder.slice(-1);
    const pos = parseInt(teamPlaceholder[0]) - 1;
    const teamsInGroup = standings[group];
    if (!teamsInGroup || teamsInGroup.length <= pos || teamsInGroup[pos].gp < 3) return null;
    return teamsInGroup[pos].team;
  }

  if (/^3\w$/.test(teamPlaceholder)) {
    const group = teamPlaceholder.slice(-1);
    const teamsInGroup = standings[group];
    if (!teamsInGroup || teamsInGroup.length < 3 || teamsInGroup[2].gp < 3) return null;
    const third = teamsInGroup[2];
    const isQualified = bestThird.some(t => t.team === third.team);
    if (!isQualified) return null;
    return third.team;
  }

  return teamPlaceholder;
}

export function resolveAllMatches(matches, matchResults) {
  const allGroups = [...new Set(matches.filter(m => m.stage === 'group').map(m => m.group))];
  const standings = calculateGroupStandings(matches, matchResults);
  const bestThird = getBestThirdPlaced(standings, matches, matchResults);

  const resolved = matches.map(m => {
    const homeTeam = resolveTeam(m.homeTeam, standings, bestThird, matches, matchResults);
    const awayTeam = resolveTeam(m.awayTeam, standings, bestThird, matches, matchResults);
    return { ...m, homeTeam: homeTeam || m.homeTeam, awayTeam: awayTeam || m.awayTeam };
  });

  return { resolvedMatches: resolved, standings, bestThird };
}

export function getGroupQualifiers(standings) {
  const qualifiers = {};
  for (const [group, teams] of Object.entries(standings)) {
    if (teams.length >= 2 && teams[0].gp === 3) {
      qualifiers[group] = {
        first: teams[0].team,
        second: teams[1].team,
        third: teams[2]?.team || null,
      };
    }
  }
  return qualifiers;
}
