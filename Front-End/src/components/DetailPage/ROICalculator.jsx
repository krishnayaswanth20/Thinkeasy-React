import { useMemo, useState } from 'react';
import { parseNumeric } from '../../utils/format';
import { fmtIndian } from '../../utils/bizFormat';

export default function ROICalculator({ biz }) {
  const defaultInvestment = parseNumeric(biz.min_investment || biz.minInvestment) || parseNumeric(biz.investment) || 100000;
  const [amount, setAmount] = useState(String(Math.round(defaultInvestment)));

  const margin = parseNumeric(biz.profit_margin || biz.profitMargin);
  const growth = parseNumeric(biz.growth_rate || biz.growthRate);
  const breakevenMonths = parseNumeric(biz.breakeven_value || biz.breakevenValue)
    || (parseNumeric(biz.breakeven) || null);

  const result = useMemo(() => {
    const inv = parseNumeric(amount);
    if (isNaN(inv) || inv <= 0) return null;
    const marginPct = isNaN(margin) ? 20 : margin; // reasonable fallback if data is missing
    const growthPct = isNaN(growth) ? 0 : growth;

    const annualProfit = inv * (marginPct / 100);
    const year2 = annualProfit * (1 + growthPct / 100);
    const year3 = year2 * (1 + growthPct / 100);
    const threeYearTotal = annualProfit + year2 + year3;
    const roiPct = (threeYearTotal / inv) * 100;
    const breakevenEstimate = annualProfit > 0 ? (inv / annualProfit) * 12 : null;

    return {
      annualProfit, year2, year3, threeYearTotal, roiPct,
      breakevenEstimate: breakevenEstimate ? Math.round(breakevenEstimate) : null,
      usedFallbackMargin: isNaN(margin),
    };
  }, [amount, margin, growth]);

  return (
    <div className="roi-calc">
      <div className="roi-calc-input-row">
        <label htmlFor="roiAmount">Your investment amount (₹)</label>
        <input
          id="roiAmount"
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
          placeholder="e.g. 500000"
        />
      </div>

      {result ? (
        <>
          <div className="roi-calc-grid">
            <div className="roi-calc-stat">
              <span className="roi-calc-label">Est. Year 1 Profit</span>
              <span className="roi-calc-value">{fmtIndian(result.annualProfit) || `₹${Math.round(result.annualProfit).toLocaleString('en-IN')}`}</span>
            </div>
            <div className="roi-calc-stat">
              <span className="roi-calc-label">Est. 3-Year Total Return</span>
              <span className="roi-calc-value">{fmtIndian(result.threeYearTotal) || `₹${Math.round(result.threeYearTotal).toLocaleString('en-IN')}`}</span>
            </div>
            <div className="roi-calc-stat">
              <span className="roi-calc-label">3-Year ROI</span>
              <span className="roi-calc-value roi-calc-value--accent">{result.roiPct.toFixed(0)}%</span>
            </div>
            <div className="roi-calc-stat">
              <span className="roi-calc-label">Est. Break-even</span>
              <span className="roi-calc-value">{result.breakevenEstimate ? `${result.breakevenEstimate} months` : (breakevenMonths ? `${breakevenMonths} months` : '—')}</span>
            </div>
          </div>
          <p className="roi-calc-note">
            {result.usedFallbackMargin
              ? 'This business has no listed profit margin, so a conservative 20% estimate was used.'
              : `Based on this business's listed profit margin (${margin}%) and growth rate (${isNaN(growth) ? '0' : growth}%).`}{' '}
            These are simplified projections, not a guarantee — actual results depend on execution, location, and market conditions.
          </p>
        </>
      ) : (
        <p className="roi-calc-note">Enter an investment amount to see projected returns.</p>
      )}
    </div>
  );
}
