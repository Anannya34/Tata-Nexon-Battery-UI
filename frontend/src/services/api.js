const API_BASE = 'http://localhost:8000';

/**
 * Fetch wrapper with error handling.
 */
async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `API error ${res.status}`);
    }
    return res.json();
  } catch (err) {
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error('Cannot connect to API server. Make sure it is running on port 8000.');
    }
    throw err;
  }
}

export const api = {
  /** Health check */
  health: () => apiFetch('/health'),

  /** Get model info */
  getModelInfo: () => apiFetch('/models/info'),

  /** Single battery prediction */
  predictSingle: (data) =>
    apiFetch('/predict', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Batch prediction */
  predictBatch: (dataList) =>
    apiFetch('/predict/batch', {
      method: 'POST',
      body: JSON.stringify(dataList),
    }),

  /** Get system status */
  getStatus: () => apiFetch('/status'),
};
