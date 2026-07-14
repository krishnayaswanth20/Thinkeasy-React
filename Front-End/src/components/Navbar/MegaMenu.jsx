import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Watchlist } from '../../utils/watchlist';
import { Activity } from '../../utils/activity';

export default function MegaMenu({ searchData, onClose }) {
  const navigate = useNavigate();
  const cached = searchData.getCached();
  const businesses = cached?.businesses || [];

  const savedIds = Watchlist.getIds().slice(0, 3);
  const saved = savedIds.map((id) => businesses.find((b) => String(b.id) === id)).filter(Boolean);

  const views = Activity.getViews();
  const recentlyViewed = Object.entries(views)
    .sort((a, b) => b[1].last - a[1].last)
    .slice(0, 3)
    .map(([id]) => businesses.find((b) => String(b.id) === id))
    .filter(Boolean);

  function go(path) {
    onClose();
    navigate(path);
  }

  return (
    <motion.div
      className="te-mega-menu"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.16 }}
    >
      <div className="te-mega-col">
        <div className="te-mega-col-title">Browse</div>
        <a onClick={() => go('/#businesses')}><i className="ti ti-building-store" /> Businesses</a>
        <a onClick={() => go('/#products')}><i className="ti ti-package" /> Products</a>
        <a onClick={() => go('/#trending')}><i className="ti ti-flame" /> Trending</a>
      </div>

      <div className="te-mega-col">
        <div className="te-mega-col-title">Your Activity</div>
        {recentlyViewed.length === 0 && saved.length === 0 && (
          <span className="te-mega-empty">Explore a business to see it here.</span>
        )}
        {recentlyViewed.length > 0 && (
          <>
            <span className="te-mega-subtitle"><i className="ti ti-history" /> Recently Viewed</span>
            {recentlyViewed.map((b) => (
              <a key={b.id} onClick={() => go(`/business/${b.id}`)} className="te-mega-item">{b.name}</a>
            ))}
          </>
        )}
        {saved.length > 0 && (
          <>
            <span className="te-mega-subtitle"><i className="ti ti-bookmark-filled" /> Saved</span>
            {saved.map((b) => (
              <a key={b.id} onClick={() => go(`/business/${b.id}`)} className="te-mega-item">{b.name}</a>
            ))}
          </>
        )}
      </div>

      <div className="te-mega-col">
        <div className="te-mega-col-title">Tools</div>
        <a onClick={() => go('/ai-advisor')}><i className="ti ti-robot" /> AI Advisor</a>
        <a onClick={() => go('/feedback')}><i className="ti ti-message-2" /> Feedback</a>
      </div>
    </motion.div>
  );
}
