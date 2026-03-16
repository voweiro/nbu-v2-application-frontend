// Base API URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Payment service configuration
export const PAYMENT_SERVICE_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL;

// Helper function to build payment service URLs
export const buildPaymentUrl = (path: string) => {
  return `${PAYMENT_SERVICE_URL}${path}`;
};

// Helper to resolve file URLs (passport, certificates, etc.)
export const getFileUrl = (url: string | undefined) => {
  if (!url) return '';
  
  const baseUrl = API_BASE_URL;
  let fileId = '';
  
  // Extract ID from Google Drive URLs
  if (url.includes('drive.google.com')) {
    const match1 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match1 && match1[1]) fileId = match1[1];
    
    if (!fileId) {
      const match2 = url.match(/id=([a-zA-Z0-9_-]+)/);
      if (match2 && match2[1]) fileId = match2[1];
    }
  }

  if (fileId) {
    return `${baseUrl}/admission/file/${fileId}`;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Handle case where URL might already include the API prefix
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  
  if (cleanUrl.startsWith('/api/admission/file/')) {
      const pathWithNoApiPrefix = cleanUrl.replace(/^\/api/, '');
      return `${baseUrl}${pathWithNoApiPrefix}`;
  }

  return `${baseUrl}/admission/file/${encodeURIComponent(url)}`;
};