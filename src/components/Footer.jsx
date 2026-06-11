export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <strong>FIFA World Cup 2026™</strong>
          <p>Official ticket portal demo — purchase, manage, and transfer your match tickets securely.</p>
        </div>
        <div className="footer-links">
          <div>
            <h4>Tickets</h4>
            <a href="/matches">Browse matches</a>
            <a href="/my-tickets">My tickets</a>
            <a href="/transfer">Transfer ticket</a>
          </div>
          <div>
            <h4>Demo accounts</h4>
            <span>demo@fifa.com / demo123</span>
            <span>friend@fifa.com / demo123</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        © 2026 FIFA. Demo application for educational purposes.
      </div>
    </footer>
  );
}