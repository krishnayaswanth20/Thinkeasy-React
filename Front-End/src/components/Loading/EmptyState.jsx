import { motion } from 'framer-motion';

export default function EmptyState({ icon = 'ti-mood-empty', title = 'Nothing here yet', sub = '' }) {
  return (
    <motion.div
      className="te-empty"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <i className={`ti ${icon}`} />
      <span className="te-empty-title">{title}</span>
      {sub && <span className="te-empty-sub">{sub}</span>}
    </motion.div>
  );
}
