import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import TicketCard from '../components/TicketCard';
import { formatDate } from '../data/matches';

export default function MyTickets() {
  const { currentUser, matches, updateMatch, updateTicket, transferTicket } = useApp();
  
  // State for the edit match modal
  const [editingMatchId, setEditingMatchId] = useState(null);
  
  // Form state for match details
  const [matchHome, setMatchHome] = useState('');
  const [matchAway, setMatchAway] = useState('');
  const [matchStage, setMatchStage] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchVenue, setMatchVenue] = useState('');
  const [matchCity, setMatchCity] = useState('');
  const [ticketEdits, setTicketEdits] = useState({});

  // Ticket selection and action state
  const [selectedTickets, setSelectedTickets] = useState({});
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferMatchId, setTransferMatchId] = useState(null);
  const [transferEmail, setTransferEmail] = useState('');
  const [transferStatus, setTransferStatus] = useState(null);

  // Resale flow success modal state
  const [resaleSuccessOpen, setResaleSuccessOpen] = useState(false);
  const [resaleCount, setResaleCount] = useState(0);

  if (!currentUser) return <Navigate to="/login" replace />;

  const tickets = currentUser.tickets;

  // Group tickets by matchId using context matches state
  const ticketsByMatch = tickets.reduce((groups, ticket) => {
    const matchId = ticket.matchId;
    if (!groups[matchId]) {
      groups[matchId] = [];
    }
    groups[matchId].push(ticket);
    return groups;
  }, {});

  const getMatch = (id) => matches.find((m) => m.id === id);

  const toggleSelectTicket = (ticketId) => {
    setSelectedTickets((prev) => ({
      ...prev,
      [ticketId]: prev[ticketId] === false ? true : false,
    }));
  };

  const handleEditClick = (matchId) => {
    const match = getMatch(matchId);
    if (!match) return;

    setEditingMatchId(matchId);
    setMatchHome(match.home || '');
    setMatchAway(match.away || '');
    setMatchStage(match.stage || 'Group Stage');
    setMatchDate(match.date || '');
    setMatchVenue(match.venue || '');
    setMatchCity(match.city || '');

    // Initialize ticket edits
    const groupTickets = ticketsByMatch[matchId] || [];
    const edits = {};
    groupTickets.forEach((t) => {
      edits[t.id] = {
        seat: t.seat || '',
        category: t.category || 'Category 1',
        price: t.price || 0,
      };
    });
    setTicketEdits(edits);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingMatchId) return;

    // Save match changes
    updateMatch(editingMatchId, {
      home: matchHome,
      away: matchAway,
      stage: matchStage,
      date: matchDate,
      venue: matchVenue,
      city: matchCity,
    });

    // Save ticket changes
    const groupTickets = ticketsByMatch[editingMatchId] || [];
    groupTickets.forEach((t) => {
      const edit = ticketEdits[t.id];
      if (edit) {
        updateTicket(t.id, {
          seat: edit.seat,
          category: edit.category,
          price: parseFloat(edit.price) || 0,
        });
      }
    });

    setEditingMatchId(null);
  };

  const handleTicketEditChange = (ticketId, field, value) => {
    setTicketEdits((prev) => ({
      ...prev,
      [ticketId]: {
        ...prev[ticketId],
        [field]: value,
      },
    }));
  };

  const handleOpenTransferModal = (matchId) => {
    setTransferMatchId(matchId);
    setTransferEmail('');
    setTransferStatus(null);
    setTransferModalOpen(true);
  };

  const handleExecuteTransfer = (e) => {
    e.preventDefault();
    if (!transferMatchId || !transferEmail) return;

    const groupTickets = ticketsByMatch[transferMatchId] || [];
    // Only transfer selected, non-resold tickets
    const selectedGroupTickets = groupTickets.filter(
      (t) => selectedTickets[t.id] !== false && t.status !== 'resale'
    );

    if (selectedGroupTickets.length === 0) {
      setTransferStatus({ type: 'error', message: 'No active tickets selected for transfer.' });
      return;
    }

    let successCount = 0;
    let lastError = '';

    selectedGroupTickets.forEach((t) => {
      const recipientName = transferEmail.split('@')[0];
      const result = transferTicket(t.id, transferEmail, recipientName);
      if (result.ok) {
        successCount++;
      } else {
        lastError = result.error;
      }
    });

    if (successCount > 0) {
      setTransferStatus({
        type: 'success',
        message: `Successfully transferred ${successCount} ticket(s) to ${transferEmail}!`,
      });

      // Reset selection state for these tickets
      const cleared = { ...selectedTickets };
      selectedGroupTickets.forEach((t) => {
        cleared[t.id] = false;
      });
      setSelectedTickets(cleared);

      setTimeout(() => {
        setTransferModalOpen(false);
        setTransferStatus(null);
      }, 1500);
    } else {
      setTransferStatus({ type: 'error', message: lastError || 'Failed to transfer tickets.' });
    }
  };

  const handleResellClick = (matchId) => {
    const groupTickets = ticketsByMatch[matchId] || [];
    const selectedGroupTickets = groupTickets.filter(
      (t) => selectedTickets[t.id] !== false && t.status !== 'resale'
    );

    if (selectedGroupTickets.length === 0) return;

    selectedGroupTickets.forEach((t) => {
      updateTicket(t.id, { status: 'resale' });
    });

    setResaleCount(selectedGroupTickets.length);
    setResaleSuccessOpen(true);
  };

  return (
    <div className="page my-tickets-page-redesign">
      {/* Purple Alert Banner */}
      <div className="purple-alert">
        <span className="purple-alert-icon">i</span>
        <span>
          Please find below the list of all your tickets. For more information, please check your{' '}
          <Link to="/transfer">ticket resale history</Link>.
        </span>
      </div>

      <div className="tickets-layout">
        {/* Left Column: Grouped Tickets */}
        <div className="tickets-main">
          {tickets.length === 0 ? (
            <div className="empty-state-card">
              <h2>No tickets yet</h2>
              <p>Browse matches and purchase tickets, or receive a transfer from a friend.</p>
              <Link to="/matches" className="btn btn-primary">Browse matches</Link>
            </div>
          ) : (
            Object.keys(ticketsByMatch).map((matchId) => {
              const match = getMatch(matchId);
              if (!match) return null;
              const groupTickets = ticketsByMatch[matchId];
              const mainCategory = groupTickets[0].category || 'Category 1';

              // Count selected active tickets in this group
              const activeGroupTickets = groupTickets.filter((t) => t.status !== 'resale');
              const selectedCount = activeGroupTickets.filter(
                (t) => selectedTickets[t.id] !== false
              ).length;

              return (
                <div key={matchId} className="match-group-card">
                  {/* Match Group Header Card */}
                  <div className="match-group-header-block">
                    <div className="match-group-info">
                      <h2 className="match-group-title">
                        FIFA World Cup 2026™ - {match.stage || 'Group Stage'} - {match.home} vs {match.away}
                      </h2>
                      <div className="match-group-meta-row">
                        <div className="match-group-meta-item">
                          <span className="match-group-meta-icon">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </span>
                          <span>{formatDate(match.date)}</span>
                        </div>
                        <div className="match-group-meta-item">
                          <span className="match-group-meta-icon">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </span>
                          <span>{match.venue}, {match.city}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="btn-add-calendar"
                      onClick={() => handleEditClick(matchId)}
                    >
                      Add to calendar
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Tickets Rows List Container */}
                  <div className="match-group-tickets-container" style={{ paddingBottom: '0px' }}>
                    <div className="match-group-tickets-title">
                      {groupTickets.length} ticket{groupTickets.length !== 1 ? 's' : ''} - {mainCategory} - USD
                    </div>
                    <div className="ticket-rows-list" style={{ paddingBottom: '24px' }}>
                      {groupTickets.map((ticket) => (
                        <TicketCard 
                          key={ticket.id} 
                          ticket={ticket} 
                          variant="row"
                          selected={selectedTickets[ticket.id] !== false}
                          onSelect={() => toggleSelectTicket(ticket.id)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Match Group Card Actions Footer Bar */}
                  <div className="match-group-footer-actions">
                    <div className="match-group-tickets-count">
                      {selectedCount} ticket{selectedCount !== 1 ? 's' : ''} selected
                    </div>
                    <div className="match-group-buttons">
                      <button 
                        type="button" 
                        className="btn-transfer-group"
                        onClick={() => handleOpenTransferModal(matchId)}
                        disabled={selectedCount === 0}
                      >
                        TRANSFER TICKET(S)
                      </button>
                      <button 
                        type="button" 
                        className="btn-resell-group"
                        onClick={() => handleResellClick(matchId)}
                        disabled={selectedCount === 0}
                      >
                        RESELL
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Sidebar */}
        <aside className="tickets-sidebar">
          {/* Box 1: Nav menu */}
          <div className="sidebar-box compact">
            <div className="sidebar-menu-list">
              <Link to="/my-tickets" className="sidebar-menu-item active">
                <span className="sidebar-menu-icon">🎟️</span>
                My tickets
              </Link>
              <Link to="/transfer" className="sidebar-menu-item">
                <span className="sidebar-menu-icon">✉️</span>
                Resell/Transfer Tickets
              </Link>
              <span className="sidebar-menu-item" style={{ cursor: 'default', opacity: 0.6 }}>
                <span className="sidebar-menu-icon">📄</span>
                Ticket purchase summary
              </span>
              <span className="sidebar-menu-item" style={{ cursor: 'default', opacity: 0.6 }}>
                <span className="sidebar-menu-icon">⚙️</span>
                Account settings
              </span>
              <span className="sidebar-menu-item" style={{ cursor: 'default', opacity: 0.6 }}>
                <span className="sidebar-menu-icon">👤</span>
                Profile
              </span>
              <Link to="/matches" className="sidebar-menu-item">
                <span className="sidebar-menu-icon">🛍️</span>
                Buy tickets
              </Link>
            </div>
          </div>

          {/* Box 2: Sponsor Visa */}
          <div className="sidebar-box">
            <div className="sidebar-sponsor-visa">
              <div className="visa-logo-text">
                VISA
              </div>
              <div className="visa-subtitle">The Official Way to Pay</div>
            </div>
          </div>

          {/* Box 3: Hospitality Promo */}
          <div className="sidebar-promo-hospitality">
            <div className="hospitality-logo">🏆</div>
            <div className="hospitality-text">
              EXPLORE TICKET-INCLUSIVE HOSPITALITY PACKAGES HERE
            </div>
          </div>
        </aside>
      </div>

      {/* Edit Match & Tickets Modal Dialog */}
      {editingMatchId && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Edit Match & Tickets</h3>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setEditingMatchId(null)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <h4 style={{ marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>Match Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div className="form-field">
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>Home Team</label>
                    <input 
                      type="text" 
                      value={matchHome} 
                      onChange={(e) => setMatchHome(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>Away Team</label>
                    <input 
                      type="text" 
                      value={matchAway} 
                      onChange={(e) => setMatchAway(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>Stage / Match Number</label>
                    <input 
                      type="text" 
                      value={matchStage} 
                      onChange={(e) => setMatchStage(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>Date (YYYY-MM-DD)</label>
                    <input 
                      type="text" 
                      value={matchDate} 
                      onChange={(e) => setMatchDate(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>Stadium Venue</label>
                    <input 
                      type="text" 
                      value={matchVenue} 
                      onChange={(e) => setMatchVenue(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>City / Location</label>
                    <input 
                      type="text" 
                      value={matchCity} 
                      onChange={(e) => setMatchCity(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                      required
                    />
                  </div>
                </div>

                <h4 style={{ marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '6px', marginTop: '24px' }}>Tickets Details</h4>
                {(ticketsByMatch[editingMatchId] || []).map((t, idx) => {
                  const tEdit = ticketEdits[t.id] || { seat: '', category: 'Category 1', price: 0 };
                  return (
                    <div key={t.id} style={{ marginBottom: '20px', padding: '12px', background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '8px', color: '#374151' }}>
                        Ticket #{idx + 1} ({t.id.toUpperCase()})
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
                        <div className="form-field">
                          <label style={{ display: 'block', marginBottom: '2px', fontSize: '11px', color: '#4b5563' }}>Seat details</label>
                          <input 
                            type="text" 
                            value={tEdit.seat} 
                            onChange={(e) => handleTicketEditChange(t.id, 'seat', e.target.value)}
                            style={{ width: '100%', padding: '6px', fontSize: '13px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                            required
                          />
                        </div>
                        <div className="form-field">
                          <label style={{ display: 'block', marginBottom: '2px', fontSize: '11px', color: '#4b5563' }}>Category</label>
                          <select 
                            value={tEdit.category} 
                            onChange={(e) => handleTicketEditChange(t.id, 'category', e.target.value)}
                            style={{ width: '100%', padding: '6px', fontSize: '13px', borderRadius: '4px', border: '1px solid #d1d5db', background: 'white' }}
                          >
                            <option value="Category 1">Category 1</option>
                            <option value="Category 2">Category 2</option>
                            <option value="Category 3">Category 3</option>
                            <option value="Category 4">Category 4</option>
                            <option value="Cat 1">Cat 1</option>
                            <option value="Cat 2">Cat 2</option>
                            <option value="Cat 3">Cat 3</option>
                          </select>
                        </div>
                        <div className="form-field">
                          <label style={{ display: 'block', marginBottom: '2px', fontSize: '11px', color: '#4b5563' }}>Price paid (USD)</label>
                          <input 
                            type="number" 
                            value={tEdit.price} 
                            onChange={(e) => handleTicketEditChange(t.id, 'price', e.target.value)}
                            style={{ width: '100%', padding: '6px', fontSize: '13px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                            min="0"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm" 
                  onClick={() => setEditingMatchId(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-gold btn-sm"
                  style={{ background: '#000000', color: '#ffffff', border: '1px solid #000000' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Warning Transfer Modal (Exactly Matching Screenshot) */}
      {transferModalOpen && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(3px)' }}>
          <div className="modal-dialog" style={{ maxWidth: '480px', borderRadius: '16px', border: 'none' }}>
            <form onSubmit={handleExecuteTransfer}>
              <div className="modal-body" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#000000', marginBottom: '16px', lineHeight: '1.2' }}>
                  Please read carefully before transferring your ticket(s):
                </h3>
                <p style={{ fontSize: '12px', color: '#374151', lineHeight: '1.6', marginBottom: '24px' }}>
                  Transfers are final and no returns, credits or exchanges are available. Transfer recipients may not cancel or return a Ticket to you once accepted. You may not cancel or revoke a transferred Ticket once the transfer is accepted by the Transfer Recipient. By clicking the "Transfer Ticket(s)" button, you are confirming the transfer of your ticket(s) to another person and agree that you have read and accepted the applicable terms of the <span style={{ textDecoration: 'underline', fontWeight: '700' }}>Transfer and Resale Terms</span>. To complete the Ticket Transfer, enter the Transfer Recipient's email address and click "Transfer Ticket(s)".
                </p>

                <div className="form-field" style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: '#111827' }}>
                    Transfer Recipient's email address *
                  </label>
                  <input 
                    type="email" 
                    value={transferEmail} 
                    onChange={(e) => setTransferEmail(e.target.value)} 
                    style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px' }}
                    required
                  />
                </div>

                {transferStatus && (
                  <div className={`alert alert-${transferStatus.type}`} style={{ marginBottom: '16px', padding: '12px', borderRadius: '6px' }}>
                    {transferStatus.message}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    type="submit" 
                    className="btn"
                    style={{ background: '#1c1c24', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', letterSpacing: '0.05em', cursor: 'pointer', width: '100%' }}
                  >
                    TRANSFER TICKET(S)
                  </button>
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={() => {
                      setTransferModalOpen(false);
                      setTransferStatus(null);
                    }}
                    style={{ background: '#f3f4f6', color: '#000000', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', letterSpacing: '0.05em', cursor: 'pointer', width: '100%' }}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resale Success Modal */}
      {resaleSuccessOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '400px', textAlign: 'center', padding: '32px', borderRadius: '12px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px', color: '#000000' }}>Listed for Resale</h3>
            <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
              Your selected {resaleCount} ticket{resaleCount !== 1 ? 's have' : ' has'} been successfully listed on the official resale platform.
            </p>
            <button 
              type="button" 
              className="btn btn-gold btn-block" 
              onClick={() => setResaleSuccessOpen(false)}
              style={{ background: '#000000', color: '#ffffff', border: 'none' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}