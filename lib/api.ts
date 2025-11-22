const API_BASE = "http://localhost:5000/api";
export const api = {
  // ---------------- AUTH ----------------
  auth: {
    signup: (email: string, password: string, role: string) =>
      fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
        credentials: "include",
        mode: "cors",
      }).then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          try {
            throw JSON.parse(text);
          } catch {
            throw { message: text || `Request failed with status ${r.status}` };
          }
        }
        return r.json();
      }),

    login: (email: string, password: string) =>
      fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
        mode: "cors",
      }).then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          try {
            throw JSON.parse(text);
          } catch {
            throw { message: text || `Request failed with status ${r.status}` };
          }
        }
        return r.json();
      }),
  },

  // ---------------- PLAYERS ----------------
  players: {
    create: (name: string, clubName: string) =>
      fetch(`${API_BASE}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, clubName }),
        credentials: "include",
        mode: "cors",
      }).then((r) => r.json()),

    list: () => fetch(`${API_BASE}/players`, { credentials: "include", mode: "cors" }).then((r) => r.json()),

    byEvent: (eventId: string) =>
      fetch(`${API_BASE}/players/event/${eventId}`, { credentials: "include", mode: "cors" }).then((r) => r.json()),

    registerToEvent: (eventId: string, uniqueId: string) =>
      fetch(`${API_BASE}/players/register-to-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, uniqueId }),
        credentials: "include",
        mode: "cors",
      }).then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          try {
            throw JSON.parse(text);
          } catch {
            throw { message: text || `Request failed with status ${r.status}` };
          }
        }
        return r.json();
      }),
  },

  // ---------------- TEAMS ----------------
  teams: {
    create: (teamData: any) =>
      fetch(`${API_BASE}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamData),
        credentials: "include",
        mode: "cors",
      }).then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          try {
            throw JSON.parse(text);
          } catch {
            throw { message: text || `Request failed with status ${r.status}` };
          }
        }
        return r.json();
      }),

    list: () => fetch(`${API_BASE}/teams`, { credentials: "include", mode: "cors" }).then((r) => r.json()),

    byEvent: (eventId: string) =>
      fetch(`${API_BASE}/teams/event/${eventId}`, { credentials: "include", mode: "cors" }).then((r) => r.json()),

    registerToEvent: (teamId: string, eventId: string) =>
      fetch(`${API_BASE}/teams/register-to-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, eventId }),
        credentials: "include",
        mode: "cors",
      }).then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          try {
            throw JSON.parse(text);
          } catch {
            throw { message: text || `Request failed with status ${r.status}` };
          }
        }
        return r.json();
      }),
  },

  // ---------------- EVENTS ----------------
  events: {
    create: (data: any, token?: string) =>
      fetch(`${API_BASE}/events`, {
        method: "POST",
        credentials: "include",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(data),
      }).then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          try {
            throw JSON.parse(text);
          } catch {
            throw { message: text };
          }
        }
        return r.json();
      }),

    list: () =>
      fetch(`${API_BASE}/events`, {
        credentials: "include",
        mode: "cors",
      }).then((r) => r.json()),

    get: (id: string) =>
      fetch(`${API_BASE}/events/${id}`, { credentials: "include", mode: "cors" }).then((r) => r.json()),

    getMatches: (eventId: string) =>
      fetch(`${API_BASE}/events/${eventId}/matches`, {
        credentials: "include",
        mode: "cors",
      }).then((r) => r.json()),

    getLeaderboard: (eventId: string) =>
      fetch(`${API_BASE}/events/${eventId}/leaderboard`, {
        credentials: "include",
        mode: "cors",
      }).then((r) => r.json()),

    generateFixtures: (eventId: string, token: string) =>
      fetch(`${API_BASE}/events/${eventId}/generate-fixtures`, {
        method: "POST",
        credentials: "include",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }).then((r) => r.json()),

    schedule: (eventId: string, token: string) =>
      fetch(`${API_BASE}/events/${eventId}/schedule`, {
        method: "POST",
        credentials: "include",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }).then((r) => r.json()),
  },

  // ---------------- MATCHES ----------------
  matches: {
    generateCode: (matchId: string, token: string) =>
      fetch(`${API_BASE}/matches/${matchId}/generate-code`, {
        method: "POST",
        credentials: "include",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }).then((r) => r.json()),

    verifyCode: (matchId: string, code: string) =>
      fetch(`${API_BASE}/matches/${matchId}/verify-code`, {
        method: "POST",
        credentials: "include",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      }).then((r) => r.json()),

    submitScore: (matchId: string, winnerId: string, matchCode: string) =>
      fetch(`${API_BASE}/matches/${matchId}/submit-score`, {
        method: "POST",
        credentials: "include",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ winnerId, matchCode }),
      }).then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          try {
            const error = JSON.parse(text);
            throw new Error(error.message || `Request failed with status ${r.status}`);
          } catch {
            throw new Error(text || `Request failed with status ${r.status}`);
          }
        }
        return r.json();
      }),
  },
}
