import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import Button from '../components/Buttons/Button';
import SEO from '../components/SEO/SEO';

export default function ServerError() {
  return (
    <>
      <SEO title="Server Error" noIndex />
      <Navbar active="" showBack />
      <motion.div
        style={{ maxWidth: 480, margin: '120px auto', textAlign: 'center', padding: '0 20px' }}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      >
        <div style={{ fontSize: 56, marginBottom: 6 }}>🛠️</div>
        <div style={{ fontSize: 44, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.03em' }}>500</div>
        <h2 style={{ color: 'var(--text)', margin: '8px 0 6px' }}>Something broke on our end</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
          The server hit an unexpected error. It's not you — try again in a moment.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Button variant="ghost" icon="ti-refresh" onClick={() => window.location.reload()}>Try Again</Button>
          <Link to="/"><Button variant="primary" icon="ti-home">Back to Home</Button></Link>
        </div>
      </motion.div>
      <Footer />
    </>
  );
}
