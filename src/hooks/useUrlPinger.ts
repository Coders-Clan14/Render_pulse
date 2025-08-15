// src/hooks/useUrlPinger.ts
import { useEffect, useRef } from 'react';
import { PingUrl } from '@/types/ping';

export function useUrlPinger(urls: PingUrl[]) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Only start pinging if there are active URLs
    const activeUrls = urls.filter(url => url.is_active && new Date(url.expires_at) > new Date());
    
    if (activeUrls.length === 0) {
      return;
    }

    console.log(`Starting client-side pinger for ${activeUrls.length} URLs`);

    const pingUrls = async () => {
      for (const urlRecord of activeUrls) {
        try {
          // Use a simple HEAD request to ping the URL
          // Note: This might be blocked by CORS, but it will still "ping" the server
          fetch(urlRecord.url, {
            method: 'HEAD',
            mode: 'no-cors', // This bypasses CORS but we won't get response details
            cache: 'no-cache'
          }).catch(() => {
            // Ignore errors - the ping was still sent
          });

          console.log(`Client-side ping sent to: ${urlRecord.url}`);
        } catch (error) {
          console.log(`Client-side ping failed for ${urlRecord.url}:`, error);
        }
      }
    };

    // Ping immediately
    pingUrls();

    // Set up interval for every 30 seconds
    intervalRef.current = setInterval(pingUrls, 30000);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [urls]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
}