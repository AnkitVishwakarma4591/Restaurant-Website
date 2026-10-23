// Shared Supabase Auth configuration and session helpers for the static site.
window.SAFFRON_AUTH_CONFIG = {
  supabaseUrl: "https://puusxhlglndguvqiuedf.supabase.co",
  publishableKey: "sb_publishable_MqhNzT_0r_muqYDA3fedLw_Wl8ICIaq",
  storageKey: "saffron_ember_auth_session"
};

window.SaffronAuth = (() => {
  const { supabaseUrl, publishableKey, storageKey } = window.SAFFRON_AUTH_CONFIG;

  function readSession() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "null");
    } catch {
      return null;
    }
  }

  function saveSession(session) {
    if (!session?.access_token || !session?.refresh_token) return;
    localStorage.setItem(storageKey, JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at || Math.floor(Date.now() / 1000) + (session.expires_in || 3600),
      user: session.user || null
    }));
  }

  function clearSession() {
    localStorage.removeItem(storageKey);
  }

  async function request(path, { method = "GET", body, accessToken } = {}) {
    const headers = {
      apikey: publishableKey,
      "Content-Type": "application/json"
    };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const response = await fetch(`${supabaseUrl}/auth/v1/${path}`, {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.msg || result.message || result.error_description || "Authentication request failed.");
    }
    return result;
  }

  async function signIn(email, password) {
    const session = await request("token?grant_type=password", {
      method: "POST",
      body: { email, password }
    });
    saveSession(session);
    return session;
  }

  async function recoverPassword(email, redirectTo) {
    return request(`recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
      method: "POST",
      body: { email }
    });
  }

  async function updatePassword(password) {
    const session = readSession();
    if (!session?.access_token) throw new Error("Your reset link is missing or has expired.");
    const user = await request("user", {
      method: "PUT",
      accessToken: session.access_token,
      body: { password }
    });
    clearSession();
    return user;
  }

  function setSessionFromRecoveryUrl() {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const isRecovery = params.get("type") === "recovery";
    if (!accessToken || !refreshToken || !isRecovery) return false;

    saveSession({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: Number(params.get("expires_in") || 3600)
    });
    window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
    return true;
  }

  async function refreshSession(session) {
    if (!session?.refresh_token) return null;
    try {
      const refreshed = await request("token?grant_type=refresh_token", {
        method: "POST",
        body: { refresh_token: session.refresh_token }
      });
      saveSession(refreshed);
      return refreshed;
    } catch (error) {
      clearSession();
      throw error;
    }
  }

  async function getCurrentUser() {
    let session = readSession();
    if (!session?.access_token) return null;

    if (session.expires_at && session.expires_at <= Math.floor(Date.now() / 1000) + 30) {
      session = await refreshSession(session);
      if (!session) return null;
    }

    try {
      const user = await request("user", { accessToken: session.access_token });
      session.user = user;
      saveSession(session);
      return user;
    } catch {
      clearSession();
      return null;
    }
  }

  async function signOut() {
    const session = readSession();
    if (!session?.access_token) {
      clearSession();
      return;
    }
    try {
      await request("logout", { method: "POST", accessToken: session.access_token });
    } finally {
      clearSession();
    }
  }

  return {
    readSession,
    saveSession,
    clearSession,
    signIn,
    recoverPassword,
    updatePassword,
    setSessionFromRecoveryUrl,
    getCurrentUser,
    signOut
  };
})();
