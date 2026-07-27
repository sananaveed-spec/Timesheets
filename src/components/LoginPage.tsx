import { useMsal } from '@azure/msal-react';
import { isAzureConfigured } from '../auth/env';
import { allowedEmailDomain } from '../auth/organization';
import { loginWithCredentials } from '../auth/session';

export function LoginPage() {
  const { instance } = useMsal();

  function handleSignIn() {
    if (!isAzureConfigured) {
      window.alert(
        'Azure AD is not configured. Add VITE_AZURE_CLIENT_ID and VITE_AZURE_TENANT_ID to .env.local, then restart npm run dev.',
      );
      return;
    }
    void loginWithCredentials(instance);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-10 shadow-lg">
        <div className="mb-6 flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="108"
            height="24"
            viewBox="0 0 108 24"
            aria-hidden="true"
          >
            <rect x="0" y="0" width="11" height="11" fill="#f25022" />
            <rect x="13" y="0" width="11" height="11" fill="#7fba00" />
            <rect x="0" y="13" width="11" height="11" fill="#00a4ef" />
            <rect x="13" y="13" width="11" height="11" fill="#ffb900" />
            <text
              x="32"
              y="17"
              fill="#1a1a1a"
              fontFamily="Segoe UI, sans-serif"
              fontSize="18"
              fontWeight="600"
            >
              Microsoft
            </text>
          </svg>
        </div>

        <h1 className="mb-2 text-center text-xl font-semibold text-gray-900">
          Clockify Converter
        </h1>
        <p className="mb-8 text-center text-sm text-gray-600">
          Sign in with your{' '}
          <strong className="font-medium text-gray-800">
            @{allowedEmailDomain}
          </strong>{' '}
          account.
        </p>

        {!isAzureConfigured ? (
          <div className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <strong>Azure AD is not configured.</strong>
            <p className="mt-1">
              Add <code className="font-mono">VITE_AZURE_CLIENT_ID</code> and{' '}
              <code className="font-mono">VITE_AZURE_TENANT_ID</code> to{' '}
              <code className="font-mono">.env.local</code>, then restart the
              dev server.
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleSignIn}
          disabled={!isAzureConfigured}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 21 21"
            aria-hidden="true"
          >
            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
          </svg>
          Sign in with Microsoft
        </button>
      </div>
    </div>
  );
}
