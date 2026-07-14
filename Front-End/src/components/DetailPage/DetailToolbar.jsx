import { useState } from 'react';
import { motion } from 'framer-motion';
import { Watchlist } from '../../utils/watchlist';
import { useToast } from '../../contexts/ToastContext';

export default function DetailToolbar({ id, name }) {
  const toast = useToast();
  const [saved, setSaved] = useState(() => Watchlist.has(id));
  const [pulse, setPulse] = useState(false);

  function toggleBookmark() {
    const nowSaved = Watchlist.toggle(id);
    setSaved(nowSaved);
    if (nowSaved) {
      setPulse(true);
      setTimeout(() => setPulse(false), 500);
      toast.success(`Saved "${name}" to your watchlist.`);
    } else {
      toast.info(`Removed "${name}" from your watchlist.`);
    }
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: name, url }); } catch { /* user cancelled */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard.');
    } catch {
      toast.error('Could not copy the link.');
    }
  }

  function printReport() {
    window.print();
  }

  return (
    <div className="detail-toolbar" data-no-print="true">
      <motion.button
        type="button"
        className={`detail-toolbar-btn${saved ? ' active' : ''}`}
        onClick={toggleBookmark}
        whileTap={{ scale: 0.92 }}
        animate={pulse ? { scale: [1, 1.25, 1] } : {}}
        transition={{ duration: 0.4 }}
        aria-label={saved ? 'Remove from saved' : 'Save this opportunity'}
      >
        <i className={`ti ${saved ? 'ti-bookmark-filled' : 'ti-bookmark'}`} /> {saved ? 'Saved' : 'Save'}
      </motion.button>
      <button type="button" className="detail-toolbar-btn" onClick={share} aria-label="Share">
        <i className="ti ti-share-3" /> Share
      </button>
      <button type="button" className="detail-toolbar-btn" onClick={printReport} aria-label="Print report">
        <i className="ti ti-printer" /> Print
      </button>
      <button type="button" className="detail-toolbar-btn" onClick={printReport} aria-label="Export as PDF" title="Uses your browser's Print → Save as PDF">
        <i className="ti ti-file-type-pdf" /> Export PDF
      </button>
    </div>
  );
}
