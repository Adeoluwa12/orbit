import React, { useCallback, useEffect, useState } from 'react';
import { Job, Stats, Profile, jobsApi, profileApi } from '../hooks/api';
import JobCard from '../components/JobCard';
import StatsBar from '../components/StatsBar';
import ProfilePanel from '../components/ProfilePanel';
import './Dashboard.css';

const STATUS_TABS = [
  { key: 'new', label: 'New' },
  { key: 'saved', label: 'Saved' },
  { key: 'applied', label: 'Applied' },
  { key: 'skipped', label: 'Skipped' },
] as const;

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<Job['status']>('new');
  const [company, setCompany] = useState('');
  const [search, setSearch] = useState('');
  const [fetching, setFetching] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadJobs = useCallback(async () => {
    try {
      const res = await jobsApi.getAll({ status: activeTab, company: company || undefined, search: search || undefined });
      setJobs(res.data.jobs);
    } catch (err) {
      console.error('Failed to load jobs', err);
    }
  }, [activeTab, company, search]);

  const loadStats = useCallback(async () => {
    try {
      const res = await jobsApi.getStats();
      setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([loadJobs(), loadStats()]);
      try {
        const res = await profileApi.get();
        setProfile(res.data.profile);
      } catch {}
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  async function handleFetch() {
    setFetching(true);
    try {
      await jobsApi.triggerFetch();
      await Promise.all([loadJobs(), loadStats()]);
    } finally {
      setFetching(false);
    }
  }

  function handleStatusChange(id: string, status: Job['status']) {
    setJobs((prev) => prev.filter((j) => j._id !== id));
    loadStats();
  }

  const targetCompanies = profile?.targetCompanies ?? [
    'Apple', 'Microsoft', 'Amazon', 'Meta',
    'Google', 'Stripe', 'Darktrace', 'Revolut',
    'Adyen', 'Zalando', 'Datadog', 'Elastic',
  ];
  // When the profile has many companies (e.g. 100+ EU list), show top ones as pills
  // and let the search box handle the rest — keeps the header usable.
  const visibleCompanyPills = targetCompanies.slice(0, 12);

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header__brand">
          <div className="header__logo">⬡</div>
          <div>
            <h1 className="header__title">Orbit</h1>
            <p className="header__sub">Your daily job feed</p>
          </div>
        </div>
        <div className="header__actions">
          <div className="company-filters">
            {visibleCompanyPills.map((c) => (
              <button
                key={c}
                className={`company-pill ${company === c ? 'company-pill--active' : ''}`}
                onClick={() => setCompany(company === c ? '' : c)}
              >
                {c}
              </button>
            ))}
          </div>
          <button className="btn btn--outline" onClick={() => setShowProfile(true)}>
            ⚙ Profile
          </button>
        </div>
      </header>

      <StatsBar
        stats={stats}
        onFetch={handleFetch}
        fetching={fetching}
        lastFetched={profile?.lastFetchedAt}
      />

      <div className="content">
        <div className="toolbar">
          <div className="tabs">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                className={`tab ${activeTab === tab.key ? 'tab--active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                {stats && (
                  <span className="tab__count">
                    {stats[tab.key as keyof Stats] as number}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="search-box">
            <span className="search-box__icon">🔍</span>
            <input
              className="search-box__input"
              placeholder="Search roles, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner spinner--lg" />
            <p>Loading your feed...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">
              {activeTab === 'new' ? '🚀' : activeTab === 'applied' ? '✅' : activeTab === 'saved' ? '🔖' : '🗑'}
            </div>
            <h3 className="empty-state__title">
              {activeTab === 'new'
                ? 'No new jobs yet'
                : `No ${activeTab} jobs`}
            </h3>
            <p className="empty-state__sub">
              {activeTab === 'new'
                ? 'Hit "Fetch Jobs" to pull the latest openings from your target companies.'
                : `Jobs you mark as "${activeTab}" will appear here.`}
            </p>
            {activeTab === 'new' && (
              <button className="btn btn--primary" onClick={handleFetch} disabled={fetching}>
                {fetching ? 'Fetching...' : '↻ Fetch Jobs Now'}
              </button>
            )}
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>

      {showProfile && (
        <ProfilePanel
          profile={profile}
          onUpdate={setProfile}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}
