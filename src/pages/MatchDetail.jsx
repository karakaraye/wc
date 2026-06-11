import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMatch, formatDate } from '../data/matches';
import { useApp } from '../context/AppContext';

export default function MatchDetail() {
  const { id } = useParams();
  const match = getMatch(id);
  const { currentUser, purchaseTicket } = useApp();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!match) {
    return (
      <div className="page">
        <p className="empty-state">Match not found. <Link to="/matches">Back to matches</Link></p>
      </div>
    );
  }

  const handlePurchase = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/matches/${id}` } });
      return;
    }
    setLoading(true);
    setStatus(null);
    let success = 0;
    for (let i = 0; i < quantity; i++) {
      const result = purchaseTicket(match.id, match.category);
      if (result.ok) success++;
    }
    setLoading(false);
    if (success > 0) {
      setStatus({ type: 'success', message: `${success} ticket${success > 1 ? 's' : ''} purchased successfully!` });
    } else {
      setStatus({ type: 'error', message: 'Purchase failed. Please try again.' });
    }
  };

  const total = match.price * quantity;

  return (
    <div className="page match-detail-page">
      <Link to="/matches" className="back-link">← Back to matches</Link>

      <div className="match-detail">
        <div
          className="match-detail-hero"
          style={{ backgroundImage: `url(${match.image})` }}
        >
          <span className="match-stage">{match.stage}</span>
        </div>

        <div className="match-detail-content">
          <div className="match-detail-info">
            <div className="match-teams large">
              <span>{match.homeFlag} {match.home}</span>
              <span className="vs">vs</span>
              <span>{match.away} {match.awayFlag}</span>
            </div>
            <p className="match-meta">{formatDate(match.date)} · {match.time} local</p>
            <p className="match-venue">{match.venue}</p>
            <p className="match-city">{match.city}, {match.country}</p>

            <div className="info-pills">
              <span>{match.category}</span>
              <span>{match.available.toLocaleString()} tickets left</span>
            </div>
          </div>

          <aside className="purchase-panel">
            <h2>Get tickets</h2>
            <p className="price-display">${match.price} <span>per ticket</span></p>

            <label className="form-field">
              Quantity
              <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>

            <div className="total-row">
              <span>Total</span>
              <strong>${total.toLocaleString()}</strong>
            </div>

            {status && (
              <div className={`alert alert-${status.type}`}>{status.message}</div>
            )}

            <button
              type="button"
              className="btn btn-gold btn-block"
              onClick={handlePurchase}
              disabled={loading}
            >
              {loading ? 'Processing…' : currentUser ? 'Purchase tickets' : 'Sign in to purchase'}
            </button>

            {status?.type === 'success' && (
              <Link to="/my-tickets" className="btn btn-outline btn-block">
                View my tickets
              </Link>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}