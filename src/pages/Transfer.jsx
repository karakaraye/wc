import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import TicketCard from '../components/TicketCard';
import { formatDate } from '../data/matches';

export default function Transfer() {
  const { currentUser, transferTicket, getUserTransfers, matches } = useApp();
  const getMatch = (id) => matches.find((m) => m.id === id);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  if (!currentUser) return <Navigate to="/login" replace />;

  const tickets = currentUser.tickets;
  const transfers = getUserTransfers().sort(
    (a, b) => new Date(b.transferredAt) - new Date(a.transferredAt)
  );

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setStep(2);
    setStatus(null);
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setLoading(true);
    const result = transferTicket(selectedTicket.id, recipientEmail, recipientName);
    setLoading(false);

    if (result.ok) {
      setStatus({ type: 'success', message: `Ticket successfully transferred to ${recipientName}!` });
      setSelectedTicket(null);
      setRecipientName('');
      setRecipientEmail('');
      setStep(1);
    } else {
      setStatus({ type: 'error', message: result.error });
    }
  };

  return (
    <div className="page transfer-page">
      <div className="page-header">
        <h1>Transfer ticket</h1>
        <p>Send a ticket to another person instantly. They&apos;ll receive it in their FIFA account.</p>
      </div>

      <div className="transfer-layout">
        <div className="transfer-main">
          <div className="step-indicator">
            <span className={step >= 1 ? 'active' : ''}>1. Select ticket</span>
            <span className={step >= 2 ? 'active' : ''}>2. Recipient details</span>
            <span>3. Confirm</span>
          </div>

          {step === 1 && (
            <section className="transfer-section">
              <h2>Choose a ticket to transfer</h2>
              {tickets.length === 0 ? (
                <div className="empty-state-card">
                  <p>You don&apos;t have any tickets to transfer.</p>
                  <Link to="/matches" className="btn btn-primary">Buy tickets</Link>
                </div>
              ) : (
                <div className="ticket-grid compact">
                  {tickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      showTransfer
                      onTransfer={handleSelectTicket}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {step === 2 && selectedTicket && (
            <section className="transfer-section">
              <button type="button" className="back-link" onClick={() => setStep(1)}>
                ← Choose different ticket
              </button>

              <div className="selected-ticket-preview">
                <TicketCard ticket={selectedTicket} />
              </div>

              <form className="transfer-form" onSubmit={handleTransfer}>
                <h2>Recipient information</h2>
                <p className="form-hint">
                  Enter the full name and email of the person receiving this ticket.
                  If they don&apos;t have an account, one will be created for them.
                </p>

                <label className="form-field">
                  Full name
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Jordan Lee"
                    required
                  />
                </label>

                <label className="form-field">
                  Email address
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="e.g. friend@fifa.com"
                    required
                  />
                </label>

                <div className="transfer-summary">
                  <h3>Transfer summary</h3>
                  <ul>
                    <li><span>From</span><strong>{currentUser.name} ({currentUser.email})</strong></li>
                    <li><span>To</span><strong>{recipientName || '—'} ({recipientEmail || '—'})</strong></li>
                    <li><span>Match</span><strong>{getMatch(selectedTicket.matchId)?.home} vs {getMatch(selectedTicket.matchId)?.away}</strong></li>
                    <li><span>Seat</span><strong>{selectedTicket.seat}</strong></li>
                  </ul>
                </div>

                {status && (
                  <div className={`alert alert-${status.type}`}>{status.message}</div>
                )}

                <button type="submit" className="btn btn-gold btn-block" disabled={loading}>
                  {loading ? 'Transferring…' : 'Confirm transfer'}
                </button>
              </form>
            </section>
          )}
        </div>

        <aside className="transfer-sidebar">
          <h3>Transfer history</h3>
          {transfers.length === 0 ? (
            <p className="muted">No transfers yet.</p>
          ) : (
            <ul className="transfer-history">
              {transfers.map((t) => {
                const match = getMatch(t.matchId);
                const isSent = t.fromUserId === currentUser.id;
                return (
                  <li key={t.id} className={isSent ? 'sent' : 'received'}>
                    <span className="transfer-direction">{isSent ? 'Sent' : 'Received'}</span>
                    <strong>{match?.home} vs {match?.away}</strong>
                    <span className="transfer-party">
                      {isSent ? `To ${t.toName}` : `From ${t.fromName}`}
                    </span>
                    <span className="transfer-date">
                      {new Date(t.transferredAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}