import { Link } from 'react-router-dom';
import { matches } from '../data/matches';
import MatchCard from '../components/MatchCard';
import { useApp } from '../context/AppContext';

export default function Home() {
  const { currentUser } = useApp();
  const featured = matches.slice(0, 3);

  return (
    <div className="page home-page">
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <span className="hero-badge">FIFA World Cup 2026™</span>
          <h1>The world&apos;s greatest tournament awaits</h1>
          <p>
            Secure your seat across 16 host cities in the USA, Mexico, and Canada.
            Buy tickets, manage your bookings, and transfer them to friends and family.
          </p>
          <div className="hero-actions">
            <Link to="/matches" className="btn btn-gold btn-lg">Browse matches</Link>
            {currentUser ? (
              <Link to="/transfer" className="btn btn-outline-light btn-lg">Transfer a ticket</Link>
            ) : (
              <Link to="/login" className="btn btn-outline-light btn-lg">Sign in to transfer</Link>
            )}
          </div>
        </div>
        <div className="hero-stats">
          <div><strong>48</strong><span>Teams</span></div>
          <div><strong>104</strong><span>Matches</span></div>
          <div><strong>16</strong><span>Host cities</span></div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Featured matches</h2>
          <Link to="/matches" className="link-arrow">View all matches →</Link>
        </div>
        <div className="match-grid">
          {featured.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      </section>

      <section className="section features-section">
        <h2>How ticket transfer works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-num">01</span>
            <h3>Sign in</h3>
            <p>Log in to your FIFA account to access tickets you own.</p>
          </div>
          <div className="feature-card">
            <span className="feature-num">02</span>
            <h3>Select ticket</h3>
            <p>Choose the match ticket you want to transfer from My Tickets.</p>
          </div>
          <div className="feature-card">
            <span className="feature-num">03</span>
            <h3>Enter recipient</h3>
            <p>Provide the recipient&apos;s full name and email address.</p>
          </div>
          <div className="feature-card">
            <span className="feature-num">04</span>
            <h3>Confirm transfer</h3>
            <p>The ticket moves instantly to the recipient&apos;s account.</p>
          </div>
        </div>
      </section>
    </div>
  );
}