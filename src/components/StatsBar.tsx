import React from 'react';
import { Stats } from '../hooks/api';

interface Props {
  stats: Stats | null;
  onFetch: () => void;
  fetching: boolean;
  lastFetched?: string;
}

export default function StatsBar({ stats, onFetch, fetching, lastFetched }: Props) {
  return (
    <div className="stats-bar">
      <div className="stats-bar__numbers">
        <div className="stat">
          <span className="stat__value">{stats?.new ?? '—'}</span>
          <span className="stat__label">New</span>
        </div>
        <div className="stat">
          <span className="stat__value stat__value--yellow">{stats?.saved ?? '—'}</span>
          <span className="stat__label">Saved</span>
        </div>
        <div className="stat">
          <span className="stat__value stat__value--green">{stats?.applied ?? '—'}</span>
          <span className="stat__label">Applied</span>
        </div>
        <div className="stat">
          <span className="stat__value stat__value--muted">{stats?.total ?? '—'}</span>
          <span className="stat__label">Total</span>
        </div>
      </div>

      <div className="stats-bar__actions">
        {lastFetched && (
          <span className="stats-bar__last-fetch">
            Last sync: {new Date(lastFetched).toLocaleTimeString()}
          </span>
        )}
        <button
          className="btn btn--fetch"
          onClick={onFetch}
          disabled={fetching}
        >
          {fetching ? (
            <>
              <span className="spinner" /> Fetching...
            </>
          ) : (
            '↻ Fetch Jobs'
          )}
        </button>
      </div>
    </div>
  );
}
