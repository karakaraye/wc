import { getMatch, formatDate } from '../data/matches';

export default function TicketCard({ ticket, onTransfer, showTransfer = false, variant = 'card', onEdit }) {
  const match = getMatch(ticket.matchId);
  if (!match) return null;

  if (variant === 'row') {
    return (
      <div className="ticket-row-item">
        <div className="ticket-row-details">
          <div className="ticket-row-subtitle">Ticket Price</div>
          <div className="ticket-row-seat-text">{ticket.seat}</div>
          <div className="ticket-row-status-msg">
            <span className="status-dot-amber"></span>
            This ticket is not printable
          </div>
        </div>
        <div className="ticket-row-right-panel">
          <div className="ticket-row-barcode-container">
            <div className="barcode-stripes">
              {[1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 2].map((w, idx) => (
                <span 
                  key={idx} 
                  className="barcode-stripe" 
                  style={{ width: `${w}px`, marginRight: idx % 2 === 0 ? '2px' : '1px' }}
                />
              ))}
            </div>
            <span className="barcode-text-id">#{ticket.id.toUpperCase()}</span>
          </div>
          {onEdit && (
            <button 
              type="button" 
              className="btn-ticket-edit" 
              onClick={() => onEdit(ticket)}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <article className="ticket-card">
      <div className="ticket-card-top">
        <span className="ticket-id">#{ticket.id.toUpperCase()}</span>
        <span className="ticket-category">{ticket.category}</span>
      </div>
      <div className="ticket-match">
        <span className="ticket-flags">{match.homeFlag} vs {match.awayFlag}</span>
        <h3>{match.home} vs {match.away}</h3>
        <p>{formatDate(match.date)} · {match.time}</p>
        <p className="ticket-venue">{match.venue}, {match.city}</p>
      </div>
      <div className="ticket-details">
        <div>
          <span className="label">Seat</span>
          <span>{ticket.seat}</span>
        </div>
        <div>
          <span className="label">Price paid</span>
          <span>${ticket.price}</span>
        </div>
      </div>
      {showTransfer && onTransfer && (
        <button type="button" className="btn btn-outline btn-sm" onClick={() => onTransfer(ticket)}>
          Transfer ticket
        </button>
      )}
    </article>
  );
}