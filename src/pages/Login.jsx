import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register, currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/my-tickets';

  if (currentUser) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const result = mode === 'login'
      ? login(email, password)
      : register(name, email, password);

    if (result.ok) {
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }
  };

  const fillDemo = () => {
    setMode('login');
    setEmail('demo@fifa.com');
    setPassword('demo123');
  };

  return (
    <div className="page login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="brand-icon">FIFA</span>
          <h1>{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
          <p>Access your tickets and transfer them securely.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'register' && (
            <label className="form-field">
              Full name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </label>
          )}

          <label className="form-field">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
            />
          </label>

          <label className="form-field">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="btn btn-gold btn-block">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="login-footer">
          <button type="button" className="link-btn" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign in'}
          </button>
          <button type="button" className="demo-btn" onClick={fillDemo}>
            Use demo account (demo@fifa.com)
          </button>
        </div>
      </div>
    </div>
  );
}