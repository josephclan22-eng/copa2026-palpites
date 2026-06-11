import { FIFA_API, mapFifaMatch } from './fifa.js';
import matches from '../src/data/matches.js';

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const fifaRes = await fetch(FIFA_API);
    if (!fifaRes.ok) throw new Error(`FIFA API returned ${fifaRes.status}`);
    const fifaData = await fifaRes.json();
    const results = {};
    let mappedCount = 0;
    for (const fifaMatch of fifaData.Results) {
      const mapped = mapFifaMatch(fifaMatch, matches);
      if (mapped) {
        results[mapped.matchId] = { homeScore: mapped.homeScore, awayScore: mapped.awayScore, played: true };
        mappedCount++;
      }
    }
    res.json({ success: true, results, totalMapped: mappedCount, lastSync: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, results: {} });
  }
};
