import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export interface Job {
  _id: string;
  jobId: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  employmentType: string;
  postedAt: string;
  status: 'new' | 'saved' | 'applied' | 'skipped';
  tags: string[];
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
  };
}

export interface Stats {
  total: number;
  new: number;
  saved: number;
  applied: number;
  skipped: number;
  byCompany: { _id: string; count: number }[];
}

export interface Profile {
  targetCompanies: string[];
  targetRoles: string[];
  keywords: string[];
  locations: string[];
  lastFetchedAt?: string;
}

export const jobsApi = {
  getAll: (params?: { status?: string; company?: string; search?: string }) =>
    api.get<{ jobs: Job[]; count: number }>('/jobs', { params }),

  getStats: () => api.get<{ stats: Stats }>('/jobs/stats'),

  updateStatus: (id: string, status: Job['status']) =>
    api.patch<{ job: Job }>(`/jobs/${id}/status`, { status }),

  triggerFetch: () => api.post<{ added: number; skipped: number }>('/jobs/fetch'),

  clearSkipped: () => api.delete('/jobs/skipped'),
};

export const profileApi = {
  get: () => api.get<{ profile: Profile }>('/profile'),
  update: (data: Partial<Profile>) => api.put<{ profile: Profile }>('/profile', data),
};
