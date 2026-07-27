import { MsalProvider } from '@azure/msal-react';
import { useEffect, useState, type ReactNode } from 'react';
import { msalInstance } from '../auth/msalInstance';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function initializeAuth() {
      await msalInstance.initialize();

      try {
        const response = await msalInstance.handleRedirectPromise();
        if (response?.account) {
          msalInstance.setActiveAccount(response.account);
        }
      } catch {
        // No redirect in progress on a normal page load.
      }

      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0 && !msalInstance.getActiveAccount()) {
        msalInstance.setActiveAccount(accounts[0]);
      }

      setReady(true);
    }

    void initializeAuth();
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-xl bg-white px-6 py-4 text-sm text-gray-600 shadow-sm">
          Loading...
        </div>
      </div>
    );
  }

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
