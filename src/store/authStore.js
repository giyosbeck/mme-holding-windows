import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      phoneNumber: '',
      user: null,
      userId: null,
      token: null,

      // Save phone number for auto-fill
      setPhoneNumber: (phone) => set({ phoneNumber: phone }),

      // Login with API response data
      login: (apiResponse) => {
        // Save token to localStorage for API calls
        if (apiResponse.token) {
          localStorage.setItem('auth_token', apiResponse.token);
        }

        set({
          isAuthenticated: true,
          userId: apiResponse.userID,
          token: apiResponse.token,
          user: {
            id: apiResponse.userID,
            role: apiResponse.userRole,
            roleStatus: apiResponse.userRoleStatus,
            language: apiResponse.selected_language,
            expired: apiResponse.expired
          }
        });
      },

      // Logout
      logout: () => {
        localStorage.removeItem('auth_token');
        set({
          isAuthenticated: false,
          user: null,
          userId: null,
          token: null,
          // Keep phone number for next login
        });
      },

      // Clear everything (when user clicks different number)
      clearAll: () => {
        localStorage.removeItem('auth_token');
        set({
          isAuthenticated: false,
          user: null,
          userId: null,
          token: null,
          phoneNumber: '',
        });
      },
    }),
    {
      name: 'warehouse-auth',
    }
  )
);

export default useAuthStore;
