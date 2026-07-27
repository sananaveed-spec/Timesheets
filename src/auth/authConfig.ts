import type { Configuration } from '@azure/msal-browser';
import { azureClientId, azureTenantId } from './env';
import { allowedEmailDomain } from './organization';

export function getMsalConfig(): Configuration {
  return {
    auth: {
      clientId: azureClientId,
      authority: `https://login.microsoftonline.com/${azureTenantId}`,
      redirectUri:
        typeof window !== 'undefined' ? window.location.origin : '/',
      postLogoutRedirectUri:
        typeof window !== 'undefined' ? window.location.origin : '/',
    },
    cache: {
      cacheLocation: 'sessionStorage',
    },
  };
}

export const loginRequest = {
  scopes: ['User.Read'],
  extraQueryParameters: {
    domain_hint: allowedEmailDomain,
  },
};
