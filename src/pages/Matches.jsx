import { useState } from 'react';
import { matches } from '../data/matches';
import MatchCard from '../components/MatchCard';

const stages = ['All', ...new Set(matches.map((m) => m.stage))];
const countries = ['All', ...new Set(matches.map((m) => m.country))];

export default function Matches() {
  const [stageFilter, setStageFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');

  const filtered = matches.filter((m) => {
    const stageOk = stageFilter === 'All' || m.stage === stageFilter;
    const countryOk = countryFilter === 'All' || m.country === countryFilter;
    return stageOk && countryOk;
  });

  return (
    <div className="page matches-page">
      <div className="page-header">
        <h1>Match tickets</h1>
        <p>Browse all FIFA World Cup 2026 fixtures and secure your seats.</p>
      </div>

      <div className="filters">
        <label>
          Stage
          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
            {stages.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Host country
          <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="match-grid">
        {filtered.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="empty-state">No matches match your filters.</p>
      )}
    </div>
  );
}