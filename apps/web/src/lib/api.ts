import { cookies } from "next/headers";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  let sessionToken = cookieStore.get("better-auth.session_token")?.value 
    || cookieStore.get("__Secure-better-auth.session_token")?.value;
  
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  if (sessionToken) {
    // Decode in case it's URI encoded by the browser/Next.js cookies API
    sessionToken = decodeURIComponent(sessionToken);
    headers.set('Authorization', `Bearer ${sessionToken}`);
  }

  const baseUrl = process.env.INTERNAL_API_URL || 'http://127.0.0.1:3001';
  
  const url = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      console.warn(`[apiFetch] Unauthorized access to ${endpoint} (Status: ${res.status})`);
      // Prevent 500 error on Next.js Server Components by returning null for unauthorized requests
      return null;
    }
    
    let errorMessage = `API Request Failed with status ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.message) {
        errorMessage = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
      }
    } catch (e) {}
    throw new Error(errorMessage);
  }

  if (res.status === 204) return null;
  
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
