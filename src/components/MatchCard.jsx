import { Link } from 'react-router-dom';
import { formatDate } from '../data/matches';

export default function MatchCard({ match }) {
  return (
    <article className="match-card">
      <div className="match-card-image" style={{ backgroundImage: `url(${match.image})` }}>
        <span className="match-stage">{match.stage}</span>
      </div>
      <div className="match-card-body">
        <div className="match-teams">
          <span>{match.homeFlag} {match.home}</span>
          <span className="vs">vs</span>
          <span>{match.away} {match.awayFlag}</span>
        </div>
        <p className="match-meta">{formatDate(match.date)} · {match.time}</p>
        <p className="match-venue">{match.venue}, {match.city}</p>
        <div className="match-card-footer">
          <span className="match-price">From ${match.price}</span>
          <Link to={`/matches/${match.id}`} className="btn btn-primary btn-sm">Get tickets</Link>
        </div>
      </div>
    </article>
  );
}