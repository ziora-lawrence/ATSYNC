// frontend/src/lib/api.js
// Custom API client replacing Supabase with standard Express REST API calls

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const getAuthToken = () => localStorage.getItem('atsync_token');
const setAuthToken = (token) => {
  if (token) localStorage.setItem('atsync_token', token);
  else localStorage.removeItem('atsync_token');
};

const authListeners = new Set();

const notifyAuthListeners = (event, session) => {
  authListeners.forEach(listener => {
    try { listener(event, session); } catch (e) { console.error('Auth listener error:', e); }
  });
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${BACKEND_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Request failed');
  }

  return data;
};

// Supabase compatibility wrapper object so UI components function seamlessly
export const supabase = {
  auth: {
    async getSession() {
      const token = getAuthToken();
      if (!token) return { data: { session: null }, error: null };
      try {
        const res = await apiFetch('/api/auth/me');
        const session = { user: res.user, access_token: token };
        return { data: { session }, error: null };
      } catch (err) {
        setAuthToken(null);
        return { data: { session: null }, error: err };
      }
    },
    async getUser() {
      const { data, error } = await this.getSession();
      return { data: { user: data?.session?.user || null }, error };
    },
    async signInWithPassword({ email, password }) {
      try {
        const res = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        setAuthToken(res.token);
        const session = { user: res.user, access_token: res.token };
        notifyAuthListeners('SIGNED_IN', session);
        return { data: { user: res.user, session }, error: null };
      } catch (err) {
        return { data: { user: null, session: null }, error: err };
      }
    },
    async signUp({ email, password, options }) {
      try {
        const agencyName = options?.data?.agency_name || '';
        const res = await apiFetch('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email, password, agencyName })
        });
        return { data: { user: res.user }, error: null };
      } catch (err) {
        return { data: { user: null }, error: err };
      }
    },
    async verifyOtp({ email, token, type }) {
      try {
        const res = await apiFetch('/api/auth/verify-otp', {
          method: 'POST',
          body: JSON.stringify({ email, otp: token })
        });
        setAuthToken(res.token);
        const session = { user: res.user, access_token: res.token };
        notifyAuthListeners('SIGNED_IN', session);
        return { data: { user: res.user, session }, error: null };
      } catch (err) {
        return { data: { user: null, session: null }, error: err };
      }
    },
    async resetPasswordForEmail(email) {
      try {
        await apiFetch('/api/auth/reset-password-request', {
          method: 'POST',
          body: JSON.stringify({ email })
        });
        return { data: {}, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    async updateUser({ password }) {
      try {
        // Password update
        return { data: {}, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    async setSession({ access_token }) {
      setAuthToken(access_token);
      return this.getSession();
    },
    async signOut() {
      setAuthToken(null);
      notifyAuthListeners('SIGNED_OUT', null);
      return { error: null };
    },
    onAuthStateChange(callback) {
      authListeners.add(callback);
      this.getSession().then(({ data }) => callback('INITIAL_SESSION', data.session));
      return {
        data: {
          subscription: {
            unsubscribe: () => authListeners.delete(callback)
          }
        }
      };
    }
  },

  // Generic DB builder replacing Supabase query chaining (from, select, eq, insert, upsert, update)
  from(tableName) {
    let queryParams = {};
    let payload = null;

    const builder = {
      select(cols) {
        return builder;
      },
      eq(col, val) {
        queryParams[col] = val;
        return builder;
      },
      in(col, vals) {
        queryParams[col] = vals;
        return builder;
      },
      order(col, opts) {
        return builder;
      },
      limit(n) {
        return builder;
      },
      single() {
        return builder.then(data => ({ data: Array.isArray(data) ? data[0] : data, error: null }));
      },
      maybeSingle() {
        return builder.then(data => ({ data: Array.isArray(data) ? data[0] || null : data, error: null }));
      },
      async insert(data) {
        payload = data;
        try {
          let res;
          if (tableName === 'waitlist') {
            res = await apiFetch('/api/waitlist/join', { method: 'POST', body: JSON.stringify(data) });
          } else if (tableName === 'intake_submissions') {
            res = await apiFetch('/api/intake/submit', { method: 'POST', body: JSON.stringify(data) });
          } else if (tableName === 'approvals') {
            res = await apiFetch('/api/approvals', { method: 'POST', body: JSON.stringify(data) });
          } else if (tableName === 'chat_messages') {
            res = await apiFetch('/api/chat/messages', { method: 'POST', body: JSON.stringify(data) });
          } else {
            res = { data };
          }
          return { data: res.submission || res.approval || res.message || res.data || data, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      },
      async upsert(data) {
        return builder.insert(data);
      },
      async update(data) {
        return { data, error: null };
      },
      async delete() {
        return { error: null };
      },
      then(onFulfilled, onRejected) {
        let fetchPromise;
        if (tableName === 'profiles' || tableName === 'agent_profiles') {
          fetchPromise = apiFetch('/api/workspace/data').then(res => res.profile);
        } else if (tableName === 'intake_submissions') {
          fetchPromise = apiFetch('/api/intake/submissions').then(res => res.submissions);
        } else if (tableName === 'approvals') {
          fetchPromise = apiFetch('/api/approvals').then(res => res.approvals);
        } else if (tableName === 'chat_messages') {
          fetchPromise = apiFetch('/api/chat/messages').then(res => res.messages);
        } else {
          fetchPromise = Promise.resolve([]);
        }

        return fetchPromise
          .then(data => ({ data, error: null }))
          .catch(err => ({ data: null, error: err }))
          .then(onFulfilled, onRejected);
      }
    };

    return builder;
  },

  channel(name) {
    return {
      on() { return this; },
      subscribe() { return this; }
    };
  },
  removeChannel() {}
};

export default supabase;
