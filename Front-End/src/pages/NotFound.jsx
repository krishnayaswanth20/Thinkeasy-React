import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import Button from '../components/Buttons/Button';

export default function NotFound() {
  return (
    <>
      <Navbar active="" showBack />
      <motion.div
        style={{ maxWidth: 480, margin: '120px auto', textAlign: 'center', padding: '0 20px' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div style={{ fontSize: 64, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.03em' }}>404</div>
        <h2 style={{ color: 'var(--text)', margin: '8px 0 6px' }}>Page not found</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link to="/"><Button variant="primary" icon="ti-home">Back to Home</Button></Link>
      </motion.div>
      <Footer />
    </>
  );
}
