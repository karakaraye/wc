import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { matches } from '../data/matches';

const STORAGE_KEY = 'fifa-ticket-portal';

const defaultUsers = [
  {
    id: 'u1',
    email: 'demo@fifa.com',
    password: 'demo123',
    name: 'Alex Morgan',
    tickets: [
      {
        id: 't1',
        matchId: 'm1',
        seat: 'Section 112 · Row 14 · Seat 8',
        category: 'Cat 1',
        price: 450,
        purchasedAt: '2026-03-10T10:00:00Z',
      },
      {
        id: 't2',
        matchId: 'm3',
        seat: 'Section 204 · Row 6 · Seat 22',
        category: 'Cat 1',
        price: 480,
        purchasedAt: '2026-03-12T14:30:00Z',
      },
    ],
  },
  {
    id: 'u2',
    email: 'friend@fifa.com',
    password: 'demo123',
    name: 'Jordan Lee',
    tickets: [],
  },
];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.matches) {
        parsed.matches = matches;
      }
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return { users: defaultUsers, transfers: [], currentUserId: null, matches: matches };
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const currentUser = state.users.find((u) => u.id === state.currentUserId) ?? null;

  const login = useCallback((email, password) => {
    const user = state.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) return { ok: false, error: 'Invalid email or password' };
    setState((s) => ({ ...s, currentUserId: user.id }));
    return { ok: true };
  }, [state.users]);

  const logout = useCallback(() => {
    setState((s) => ({ ...s, currentUserId: null }));
  }, []);

  const register = useCallback((name, email, password) => {
    if (state.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'An account with this email already exists' };
    }
    const newUser = {
      id: `u${Date.now()}`,
      email,
      password,
      name,
      tickets: [],
    };
    setState((s) => ({
      ...s,
      users: [...s.users, newUser],
      currentUserId: newUser.id,
    }));
    return { ok: true };
  }, [state.users]);

  const purchaseTicket = useCallback((matchId, category) => {
    if (!currentUser) return { ok: false, error: 'Please sign in to purchase tickets' };
    const currentMatches = state.matches || matches;
    const match = currentMatches.find((m) => m.id === matchId);
    if (!match) return { ok: false, error: 'Match not found' };

    const ticket = {
      id: `t${Date.now()}`,
      matchId,
      seat: `Section ${100 + Math.floor(Math.random() * 50)} · Row ${Math.floor(Math.random() * 20) + 1} · Seat ${Math.floor(Math.random() * 30) + 1}`,
      category: category || match.category,
      price: match.price,
      purchasedAt: new Date().toISOString(),
    };

    setState((s) => ({
      ...s,
      users: s.users.map((u) =>
        u.id === currentUser.id ? { ...u, tickets: [...u.tickets, ticket] } : u
      ),
    }));
    return { ok: true, ticket };
  }, [currentUser, state.matches]);

  const transferTicket = useCallback((ticketId, recipientEmail, recipientName) => {
    if (!currentUser) return { ok: false, error: 'Please sign in to transfer tickets' };

    const ticket = currentUser.tickets.find((t) => t.id === ticketId);
    if (!ticket) return { ok: false, error: 'Ticket not found' };

    const email = recipientEmail.trim().toLowerCase();
    const name = recipientName.trim();
    if (!email || !name) return { ok: false, error: 'Recipient name and email are required' };
    if (email === currentUser.email.toLowerCase()) {
      return { ok: false, error: 'You cannot transfer a ticket to yourself' };
    }

    setState((s) => {
      let recipient = s.users.find((u) => u.email.toLowerCase() === email);
      let users = s.users;

      if (!recipient) {
        recipient = {
          id: `u${Date.now()}`,
          email: recipientEmail.trim(),
          password: 'invite' + Math.random().toString(36).slice(2, 10),
          name,
          tickets: [],
        };
        users = [...users, recipient];
      }

      users = users.map((u) => {
        if (u.id === currentUser.id) {
          return { ...u, tickets: u.tickets.filter((t) => t.id !== ticketId) };
        }
        if (u.id === recipient.id) {
          return { ...u, tickets: [...u.tickets, ticket] };
        }
        return u;
      });

      const transfer = {
        id: `tr${Date.now()}`,
        ticketId,
        matchId: ticket.matchId,
        fromUserId: currentUser.id,
        fromEmail: currentUser.email,
        fromName: currentUser.name,
        toEmail: recipientEmail.trim(),
        toName: name,
        toUserId: recipient.id,
        transferredAt: new Date().toISOString(),
        seat: ticket.seat,
      };

      return { ...s, users, transfers: [...s.transfers, transfer] };
    });

    return { ok: true };
  }, [currentUser]);

  const updateTicket = useCallback((ticketId, updatedData) => {
    if (!currentUser) return { ok: false, error: 'Please sign in to update tickets' };
    setState((s) => ({
      ...s,
      users: s.users.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              tickets: u.tickets.map((t) =>
                t.id === ticketId ? { ...t, ...updatedData } : t
              ),
            }
          : u
      ),
    }));
    return { ok: true };
  }, [currentUser]);

  const updateMatch = useCallback((matchId, updatedData) => {
    setState((s) => ({
      ...s,
      matches: (s.matches || matches).map((m) =>
        m.id === matchId ? { ...m, ...updatedData } : m
      ),
    }));
    return { ok: true };
  }, []);

  const getUserTransfers = useCallback(() => {
    if (!currentUser) return [];
    return state.transfers.filter(
      (t) =>
        t.fromUserId === currentUser.id ||
        t.toUserId === currentUser.id ||
        t.toEmail.toLowerCase() === currentUser.email.toLowerCase()
    );
  }, [currentUser, state.transfers]);

  const value = {
    currentUser,
    login,
    logout,
    register,
    purchaseTicket,
    transferTicket,
    getUserTransfers,
    updateTicket,
    updateMatch,
    matches: state.matches || matches,
    transfers: state.transfers,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}