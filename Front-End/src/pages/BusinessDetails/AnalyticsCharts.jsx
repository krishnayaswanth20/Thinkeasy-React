import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import {
  safeJSON, calcCAGR, fmtProfit, parseGrowthChart, parseProfitProjection, parseInvestmentChart, DONUT_COLORS,
} from '../../utils/bizFormat';

function useChart(canvasRef, buildConfig, deps) {
  const instRef = useRef(null);
  useEffect(() => {
    if (instRef.current) { instRef.current.destroy(); instRef.current = null; }
    const config = buildConfig();
    if (config && canvasRef.current) instRef.current = new Chart(canvasRef.current, config);
    return () => { if (instRef.current) { instRef.current.destroy(); instRef.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

const TOOLTIP_STYLE = { backgroundColor: '#062b61', titleColor: '#93c5fd', bodyColor: '#fff', cornerRadius: 8, padding: 10 };

function NoDataBlock() {
  return <div className="chart-no-data"><i className="ti ti-file-off" />No analytics data available</div>;
}

export default function AnalyticsCharts({ biz }) {
  const growthCanvas = useRef(null);
  const investCanvas = useRef(null);
  const profitCanvas = useRef(null);
  const revSegCanvas = useRef(null);

  const gp = parseGrowthChart(biz.growth_chart || biz.growthChart);
  const pp = parseProfitProjection(biz.profit_projection || biz.profitProjection);
  const ip = parseInvestmentChart(biz.investment_chart || biz.investmentChart);
  const segs = safeJSON(biz.revenue_segments || biz.revenueSegments);

  useChart(growthCanvas, () => {
    if (!gp.data.length) return null;
    return {
      type: 'line',
      data: {
        labels: gp.labels,
        datasets: [{
          label: 'Market Growth', data: gp.data, borderColor: '#2563eb', borderWidth: 2.5,
          pointBackgroundColor: '#fff', pointBorderColor: '#2563eb', pointBorderWidth: 2,
          pointRadius: 4, pointHoverRadius: 6, tension: 0.4, fill: true,
          backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 180);
            g.addColorStop(0, 'rgba(37,99,235,.17)'); g.addColorStop(1, 'rgba(37,99,235,.01)');
            return g;
          },
        }],
      },
      options: {
        responsive: true, animation: { duration: 600 },
        plugins: { legend: { display: false }, tooltip: TOOLTIP_STYLE },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8' } },
          y: { grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8' } },
        },
      },
    };
  }, [biz.id, biz.growth_chart, biz.growthChart]);

  useChart(investCanvas, () => {
    if (!ip.data.length) return null;
    return {
      type: 'doughnut',
      data: { labels: ip.labels, datasets: [{ data: ip.data, backgroundColor: DONUT_COLORS, borderColor: '#fff', borderWidth: 3, hoverOffset: 8 }] },
      options: {
        responsive: true, cutout: '68%', animation: { duration: 700 },
        plugins: { legend: { display: false }, tooltip: { ...TOOLTIP_STYLE, callbacks: { label: (ctx) => `  ${ctx.label}: ${ctx.parsed}%` } } },
      },
    };
  }, [biz.id, biz.investment_chart, biz.investmentChart]);

  useChart(profitCanvas, () => {
    if (!pp.data.length) return null;
    return {
      type: 'bar',
      data: {
        labels: pp.labels,
        datasets: [{
          label: 'Projected Profit', data: pp.data,
          backgroundColor: pp.data.map((_, i) => `rgba(37,99,235,${(0.45 + i * 0.11).toFixed(2)})`),
          borderRadius: { topLeft: 6, topRight: 6 }, borderSkipped: false, hoverBackgroundColor: '#1d4ed8',
        }],
      },
      options: {
        responsive: true, animation: { duration: 600 },
        plugins: { legend: { display: false }, tooltip: TOOLTIP_STYLE },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 12, weight: '500' }, color: '#64748b' } },
          y: { grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8' } },
        },
      },
    };
  }, [biz.id, biz.profit_projection, biz.profitProjection]);

  useChart(revSegCanvas, () => {
    if (!segs || !segs.length) return null;
    return {
      type: 'bar',
      data: {
        labels: segs.map((s) => s.label || s.name || '—'),
        datasets: [{ data: segs.map((s) => parseFloat(s.value || s.percent || 0)), backgroundColor: DONUT_COLORS, borderRadius: { topLeft: 5, topRight: 5 }, borderSkipped: false }],
      },
      options: {
        responsive: true, indexAxis: 'y',
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#062b61', bodyColor: '#fff', cornerRadius: 8 } },
        scales: {
          x: { grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8' } },
          y: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 12, weight: '500' }, color: '#64748b' } },
        },
      },
    };
  }, [biz.id, biz.revenue_segments, biz.revenueSegments]);

  // Mini stats
  let peakYear = '—', peakVal = '—', growthCAGR = '—', growthInsight = '—';
  if (gp.data.length) {
    const mv = Math.max(...gp.data);
    const mi = gp.data.indexOf(mv);
    peakYear = gp.labels[mi] || '—';
    peakVal = `▲ ${mv}`;
    const c = calcCAGR(gp.data);
    growthCAGR = c || '—';
    growthInsight = <>Market grew from <strong>{gp.data[0]}</strong> to <strong>{mv}</strong>{c ? ` — ${c}` : ''}.</>;
  }
  let totalProfit = '—', profitCAGR = '—', profitInsight = '—';
  if (pp.data.length) {
    totalProfit = fmtProfit(pp.data);
    const c = calcCAGR(pp.data);
    profitCAGR = c || '—';
    const last = pp.data[pp.data.length - 1];
    profitInsight = last ? <>Year {pp.data.length}: <strong>{last}</strong>. Total: <strong>{fmtProfit(pp.data)}</strong>.</> : '—';
  }
  const bv = biz.breakeven_value || biz.breakevenValue || '';
  const bu = biz.breakeven_unit || biz.breakevenUnit || '';
  const bf = biz.breakeven || '';
  const breakeven = (bv && bu) ? `${bv} ${bu}` : (bf || '—');

  let investInsight = '—';
  if (ip.data.length && ip.labels.length) {
    const mp = Math.max(...ip.data);
    const ml = ip.labels[ip.data.indexOf(mp)];
    investInsight = <>Largest spend: <strong>{ml}</strong> at <strong>{mp}%</strong> of capital.</>;
  }

  return (
    <div className="section" id="section-analytics">
      <div className="analytics-header">
        <div className="analytics-title"><i className="ti ti-chart-line" /> Market Analytics Dashboard</div>
        <div className="live-badge">Live Data</div>
      </div>
      <div className="mini-stat-row">
        <div className="mini-stat-card">
          <div className="msc-icon blue"><i className="ti ti-trending-up" /></div>
          <div><div className="msc-label">Peak Market Year</div><div className="msc-value">{peakYear}</div><div className="msc-sub">{peakVal}</div></div>
        </div>
        <div className="mini-stat-card">
          <div className="msc-icon green"><i className="ti ti-currency-rupee" /></div>
          <div><div className="msc-label">5-Year Total Profit</div><div className="msc-value">{totalProfit}</div><div className="msc-sub">▲ Cumulative</div></div>
        </div>
        <div className="mini-stat-card">
          <div className="msc-icon amber"><i className="ti ti-clock" /></div>
          <div><div className="msc-label">Break-even</div><div className="msc-value">{breakeven}</div><div className="msc-sub">▲ From Launch</div></div>
        </div>
      </div>
      <div className="charts-two-col">
        <div className="chart-card">
          <div className="cc-header">
            <div className="cc-title"><i className="ti ti-trending-up" /> Market Growth Trend</div>
            <div className="cc-meta"><span><span className="cc-dot" style={{ background: '#2563eb' }} />Value</span><span className="cc-cagr">{growthCAGR}</span></div>
          </div>
          <div className="cc-body">
            {gp.data.length ? <div className="cc-canvas-box"><canvas ref={growthCanvas} /></div> : <NoDataBlock />}
          </div>
          <div className="cc-insight"><i className="ti ti-info-circle" /><span>{growthInsight}</span></div>
        </div>
        <div className="chart-card">
          <div className="cc-header">
            <div className="cc-title"><i className="ti ti-chart-donut" /> Investment Breakdown</div>
            <div className="cc-meta">% of Total Capital</div>
          </div>
          <div className="cc-body">
            {ip.data.length
              ? <div className="cc-donut-layout"><canvas ref={investCanvas} /><div className="cc-legend">
                  {ip.labels.map((l, i) => (
                    <div key={l + i}>
                      <div className="cc-legend-row">
                        <div className="cc-legend-dot" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                        <span className="cc-legend-name">{l}</span><span className="cc-legend-pct">{ip.data[i]}%</span>
                      </div>
                      <div className="cc-legend-bar" style={{ width: `${ip.data[i]}%`, background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                    </div>
                  ))}
                </div></div>
              : <NoDataBlock />}
          </div>
          <div className="cc-insight"><i className="ti ti-info-circle" /><span>{investInsight}</span></div>
        </div>
      </div>
      <div className="chart-card-full">
        <div className="cc-header">
          <div className="cc-title"><i className="ti ti-chart-bar" /> Profit Projection — Multi-Year Forecast</div>
          <div className="cc-meta"><span><span className="cc-dot" style={{ background: '#2563eb' }} />Value</span><span className="cc-cagr">{profitCAGR}</span></div>
        </div>
        <div className="cc-body">
          {pp.data.length ? <div className="cc-canvas-box"><canvas ref={profitCanvas} /></div> : <NoDataBlock />}
        </div>
        <div className="cc-insight"><i className="ti ti-info-circle" /><span>{profitInsight}</span></div>
      </div>
      {segs && segs.length > 0 && (
        <div className="section" id="section-revenue-chart" style={{ marginTop: 20 }}>
          <canvas ref={revSegCanvas} style={{ maxHeight: 160 }} />
        </div>
      )}
    </div>
  );
}
