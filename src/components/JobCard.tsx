import React, { useState } from 'react';
import { Job, jobsApi } from '../hooks/api';

interface Props {
  job: Job;
  onStatusChange: (id: string, status: Job['status']) => void;
}

const companyColors: Record<string, string> = {
  Apple: '#a3a3a3',
  Microsoft: '#00a4ef',
  Amazon: '#ff9900',
  Meta: '#0866ff',
};

function formatSalary(salary: Job['salary']) {
  if (!salary?.min && !salary?.max) return null;
  const fmt = (n: number) =>
    n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  if (salary.min && salary.max) return `${fmt(salary.min)} – ${fmt(salary.max)}`;
  if (salary.max) return `Up to ${fmt(salary.max)}`;
  return `From ${fmt(salary.min!)}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function JobCard({ job, onStatusChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const accent = companyColors[job.company] || '#6c63ff';

  async function handleStatus(status: Job['status']) {
    setLoading(true);
    try {
      await jobsApi.updateStatus(job._id, status);
      onStatusChange(job._id, status);
    } finally {
      setLoading(false);
    }
  }

  const salary = formatSalary(job.salary);

  return (
    <div
      className={`job-card ${job.status !== 'new' ? `job-card--${job.status}` : ''}`}
      style={{ '--accent-color': accent } as React.CSSProperties}
    >
      <div className="job-card__header">
        <div className="job-card__company-dot" style={{ background: accent }} />
        <div className="job-card__meta">
          <span className="job-card__company">{job.company}</span>
          <span className="job-card__time">{timeAgo(job.postedAt)}</span>
        </div>
        {job.status !== 'new' && (
          <span className={`job-card__badge job-card__badge--${job.status}`}>
            {job.status}
          </span>
        )}
      </div>

      <h3 className="job-card__title">{job.title}</h3>

      <div className="job-card__info">
        <span className="job-card__info-item">📍 {job.location}</span>
        <span className="job-card__info-item">⏱ {job.employmentType}</span>
        {salary && <span className="job-card__info-item salary">💰 {salary}/yr</span>}
      </div>

      {job.tags.length > 0 && (
        <div className="job-card__tags">
          {job.tags.slice(0, 5).map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
          {job.tags.length > 5 && (
            <span className="tag tag--more">+{job.tags.length - 5}</span>
          )}
        </div>
      )}

      {expanded && (
        <p className="job-card__description">
          {job.description.slice(0, 400)}
          {job.description.length > 400 ? '...' : ''}
        </p>
      )}

      <button
        className="job-card__expand"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Hide details ↑' : 'Show details ↓'}
      </button>

      <div className="job-card__actions">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--primary"
        >
          Apply →
        </a>
        {job.status !== 'saved' && (
          <button
            className="btn btn--ghost"
            onClick={() => handleStatus('saved')}
            disabled={loading}
          >
            Save
          </button>
        )}
        {job.status !== 'applied' && (
          <button
            className="btn btn--success"
            onClick={() => handleStatus('applied')}
            disabled={loading}
          >
            ✓ Applied
          </button>
        )}
        {job.status !== 'skipped' && (
          <button
            className="btn btn--danger"
            onClick={() => handleStatus('skipped')}
            disabled={loading}
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
