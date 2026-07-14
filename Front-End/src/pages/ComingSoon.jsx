import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

// Placeholder for pages not yet migrated in this pass (BusinessDetails,
// ProductDetails, Feedback Center, Login, Admin, etc.). Home.jsx is the
// fully working reference migration — use it as the template for these.
export default function ComingSoon({ title }) {
  const navigate = useNavigate();
  return (
    <>
      <Navbar active="" showBack />
      <div style={{ maxWidth: 640, margin: '120px auto', textAlign: 'center', color: 'var(--muted)' }}>
        <h2 style={{ color: 'var(--text)', marginBottom: 12 }}>{title}</h2>
        <p>This page hasn't been migrated to React yet — Home is the working reference template.</p>
        <button className="btn-cta-ghost" style={{ marginTop: 20 }} onClick={() => navigate('/')}>Back to Home</button>
      </div>
      <Footer />
    </>
  );
}
