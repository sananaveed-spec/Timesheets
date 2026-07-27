export const azureClientId =
  import.meta.env.VITE_AZURE_CLIENT_ID ??
  import.meta.env.NEXT_PUBLIC_AZURE_CLIENT_ID ??
  '';
export const azureTenantId =
  import.meta.env.VITE_AZURE_TENANT_ID ??
  import.meta.env.NEXT_PUBLIC_AZURE_TENANT_ID ??
  '';

export const isAzureConfigured =
  azureClientId.length > 0 &&
  azureTenantId.length > 0 &&
  azureClientId !== 'your-application-client-id' &&
  azureTenantId !== 'your-directory-tenant-id';
