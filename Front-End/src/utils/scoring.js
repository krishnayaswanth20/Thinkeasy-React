import { parseNumeric } from './format';
import { Activity } from './activity';

// COMPOSITE SCORING — single source of truth used by Trending, High ROI,
// Popular Searches and Recommended For You. Ported 1:1 from the legacy
// index.html computeScores() implementation.

function normalize(value, min, max) {
  if (!isFinite(value)) return 0.4;
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

// Returns a NEW array of businesses, each annotated with trendScore,
// roiScore, and investmentTier. Pure function — does not mutate input.
export function computeScores(businesses) {
  if (!businesses || businesses.length === 0) return [];

  const growths = businesses.map((b) => parseNumeric(b.growthRate)).filter((n) => !isNaN(n));
  const margins = businesses.map((b) => parseNumeric(b.profitMargin)).filter((n) => !isNaN(n));
  const markets = businesses.map((b) => parseNumeric(b.marketSize)).filter((n) => !isNaN(n));
  const investments = businesses.map((b) => parseNumeric(b.investment)).filter((n) => !isNaN(n));

  const gRange = [Math.min(0, ...growths), Math.max(1, ...growths)];
  const mRange = [Math.min(0, ...margins), Math.max(1, ...margins)];
  const kRange = [Math.min(0, ...markets), Math.max(1, ...markets)];

  const returnRatios = businesses
    .map((b) => {
      const g = parseNumeric(b.growthRate);
      const inv = parseNumeric(b.investment);
      return isNaN(g) || isNaN(inv) || inv <= 0 ? NaN : g / inv;
    })
    .filter((n) => !isNaN(n));
  const rRange = [Math.min(0, ...returnRatios), Math.max(0.0001, ...returnRatios)];

  const sortedInv = [...investments].sort((a, b) => a - b);
  const lowCut = sortedInv[Math.floor(sortedInv.length / 3)] ?? sortedInv[0];
  const medCut = sortedInv[Math.floor((sortedInv.length * 2) / 3)] ?? sortedInv[sortedInv.length - 1];

  return businesses.map((b) => {
    const gVal = parseNumeric(b.growthRate);
    const mVal = parseNumeric(b.profitMargin);
    const kVal = parseNumeric(b.marketSize);
    const invVal = parseNumeric(b.investment);
    const rVal = isNaN(gVal) || isNaN(invVal) || invVal <= 0 ? NaN : gVal / invVal;

    const g = normalize(gVal, gRange[0], gRange[1]);
    const m = normalize(mVal, mRange[0], mRange[1]);
    const k = normalize(kVal, kRange[0], kRange[1]);
    const r = normalize(rVal, rRange[0], rRange[1]);

    const fundamentals = g * 0.45 + m * 0.3 + k * 0.25;
    const engagement = Activity.getEngagement(b.id);

    const trendScore = fundamentals * 10 + engagement;
    const roiScore = m * 0.3 + r * 0.3 + g * 0.2 + k * 0.2;

    let investmentTier = null;
    if (!isNaN(invVal)) {
      investmentTier = invVal <= lowCut ? 'low' : invVal <= medCut ? 'med' : 'high';
    }

    return { ...b, trendScore, roiScore, investmentTier };
  });
}
