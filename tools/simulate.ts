/**
 * Balance simulation CLI (docs/14 "Équilibrage").
 * Usage: npm run simulate -- [gamesPerProfile]
 */
import { simulate } from '../src/sim/simulate';

const n = Number(process.argv[2] ?? 500);
const reports = simulate(Number.isFinite(n) && n > 0 ? n : 500);
console.table(
  reports.map((r) => ({
    profil: r.profile,
    'pièces moy.': r.coinsMean,
    'pièces p10–p90': `${r.coinsP10}–${r.coinsP90}`,
    faillites: `${(r.bankruptRate * 100).toFixed(1)} %`,
    'année méd.': r.yearMedian,
    'année p10–p90': `${r.yearP10}–${r.yearP90}`,
    'Q moy.': r.qualityMean,
    'durée moy.': `${r.minutesMean} min`,
    'durée max': `${r.minutesMax} min`,
    scènes: r.scenesMean,
  })),
);
for (const r of reports) console.log(r.profile, JSON.stringify(r.endings));
