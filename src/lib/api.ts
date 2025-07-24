import type { PingUrl, AddUrlRequest } from '@/types/ping';

const SUPABASE_URL = 'https://ojuitmfclbzwrsxbchzr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdWl0bWZjbGJ6d3JzeGJjaHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTU2NDYsImV4cCI6MjA2ODQ5MTY0Nn0.-EjiUOBMmgvuset0QGxAxJjQfkPxZ7B5eUknwoUpg6k';

export async function addPingUrl(request: AddUrlRequest): Promise<PingUrl> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/ping-urls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add URL');
  }

  return response.json();
}

export async function getUserUrls(clientId: string): Promise<PingUrl[]> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/ping-urls/${clientId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch URLs');
  }

  return response.json();
}

export async function deleteUrl(urlId: string): Promise<void> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/ping-urls/${urlId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete URL');
  }
}