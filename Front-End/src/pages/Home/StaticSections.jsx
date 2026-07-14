const JOURNEY_STEPS = [
  { num: 1, label: 'Discover', title: 'Find an idea worth pursuing', body: 'Score and compare business ideas by capital, effort and market readiness — before you commit to one.', tools: [{ icon: 'ti-target-arrow', label: 'Opportunity Matrix' }] },
  { num: 2, label: 'Validate', title: 'Know the demand is real', body: "See market size, seasonality and growth trends so you're not guessing whether people will actually buy.", tools: [{ icon: 'ti-chart-bar', label: 'Market Analysis' }] },
  { num: 3, label: 'Compare', title: "See exactly who you're up against", body: "Know who's already winning in your market, what they charge, and where the gap is for you to fit in.", tools: [{ icon: 'ti-search', label: 'Competitor Intelligence' }] },
  { num: 4, label: 'Plan', title: 'Walk in with a real plan', body: 'A step-by-step roadmap and a verified supplier network — so the first move is obvious, not a guess.', tools: [{ icon: 'ti-map', label: 'Business Roadmap', tag: 'Most Used' }, { icon: 'ti-building-factory-2', label: 'Supplier Network' }] },
  { num: 5, label: 'Launch', title: 'Open with confidence, keep growing', body: 'Get tailored answers on budget, hiring and expansion as real questions come up after launch.', tools: [{ icon: 'ti-robot', label: 'AI Business Advisor', tag: 'New', tagNew: true }] },
];

export function JourneySection() {
  return (
    <section className="journey-section reveal is-visible" id="journey">
      <div className="section-inner">
        <div className="section-eyebrow center">From First Idea to First Sale</div>
        <h2 className="section-title center">Discover → Validate → Compare → Plan → Launch</h2>
        <p className="section-sub center">One guided path instead of six disconnected tools — always clear what stage you're at and what comes next.</p>
        <div className="journey-track">
          {JOURNEY_STEPS.map((step) => (
            <div key={step.num} className="journey-step">
              <div className="journey-step-head">
                <span className="journey-step-num">{step.num}</span>
                <span className="journey-step-label">{step.label}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <div className="journey-tools">
                {step.tools.map((t) => (
                  <div key={t.label} className="journey-tool">
                    <i className={`ti ${t.icon}`} /> {t.label}
                    {t.tag && <span className={`journey-tool-tag${t.tagNew ? ' journey-tool-tag--new' : ''}`}>{t.tag}</span>}
                  </div>
                ))}
              </div>
              {step.num < 5 && <div className="journey-connector"><i className="ti ti-chevron-right" /></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const COMPARE_ROWS = [
  { icon: 'ti-clock', label: 'Research Time', old: '3–6 weeks', now: 'Under 10 minutes' },
  { icon: 'ti-database', label: 'Data Collection', old: 'Manual & unreliable', now: 'Live, verified data' },
  { icon: 'ti-truck', label: 'Supplier Search', old: 'Cold calls & guesswork', now: 'Curated supplier list' },
  { icon: 'ti-chart-bar', label: 'Market Analysis', old: 'Expensive consultants', now: 'Instant visual reports' },
  { icon: 'ti-map', label: 'Business Roadmap', old: 'Not available', now: 'Step-by-step guide' },
  { icon: 'ti-currency-rupee', label: 'Cost', old: '₹50,000+', now: 'Free to start' },
];

export function ComparisonSection() {
  return (
    <section className="comparison-section reveal is-visible">
      <div className="section-inner">
        <div className="section-eyebrow center">Why Switch</div>
        <h2 className="section-title center">Think Easy vs Traditional Research</h2>
        <p className="section-sub center">Stop spending weeks on research that used to take months.</p>
        <div className="compare-table">
          <div className="compare-header">
            <div className="compare-col col-aspect">What You Need</div>
            <div className="compare-col col-old">Traditional Research</div>
            <div className="compare-col col-new">Think Easy</div>
          </div>
          {COMPARE_ROWS.map((row) => (
            <div key={row.label} className="compare-row">
              <div className="compare-col col-aspect"><i className={`ti ${row.icon}`} /> {row.label}</div>
              <div className="compare-col col-old"><span className="badge-bad">{row.old}</span></div>
              <div className="compare-col col-new"><span className="badge-good">{row.now}</span></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="cta-section reveal is-visible">
      <div className="cta-inner">
        <div className="cta-glow" />
        <h2>Ready to find your next business?</h2>
        <p>Join 12,000+ entrepreneurs already using Think Easy.</p>
        <div className="cta-actions">
          <button
            className="btn-cta-primary"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => document.querySelector('.search-box input')?.focus(), 400);
            }}
          >
            Start for Free <i className="ti ti-arrow-right" />
          </button>
          <button className="btn-cta-ghost" onClick={() => document.getElementById('roi')?.scrollIntoView({ behavior: 'smooth' })}>
            View All Businesses
          </button>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="nav-logo-mark small"><span className="bar b1" /><span className="bar b2" /><span className="bar b3" /></div>
            <span>Think<span className="logo-accent">Easy</span></span>
          </div>
          <p>The Screener.in for businesses.<br />Built for Indian entrepreneurs.</p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <span className="footer-col-title">Product</span>
            <a href="#">Categories</a><a href="#">Trending</a><a href="#">Compare</a><a href="#">API</a>
          </div>
          <div className="footer-col">
            <span className="footer-col-title">Company</span>
            <a href="#">About</a><a href="#">Blog</a><a href="#">Careers</a><a href="#">Contact</a>
          </div>
          <div className="footer-col">
            <span className="footer-col-title">Legal</span>
            <a href="#">Privacy Policy</a><a href="#">Terms of Use</a><a href="#">Disclaimer</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Think Easy. All rights reserved.</span>
        <span>Made with ❤️ in India</span>
      </div>
    </footer>
  );
}
