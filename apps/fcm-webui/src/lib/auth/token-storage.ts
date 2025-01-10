const ACCESS_TOKEN_KEY = 'fcm_access_token';

export const tokenStorage = {
  setAccessToken: (token: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  },

  getAccessToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
  },

  clearAccessToken: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  },

  // Refresh token is automatically handled via httpOnly cookies by the browser
  clearTokens: async () => {
    tokenStorage.clearAccessToken();
    // Hit the clear-refresh-token endpoint to clear the httpOnly cookie
    try {
      const response = await fetch('/api/auth/clear-refresh-token', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to clear refresh token: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to clear tokens:', error);
      throw error;
    }
  }
};