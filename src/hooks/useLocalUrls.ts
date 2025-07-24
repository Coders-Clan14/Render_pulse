import { useState, useEffect } from 'react';

const URLS_KEY = 'renderpulse_urls';

export function useLocalUrls() {
  const [urlIds, setUrlIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(URLS_KEY);
    if (stored) {
      try {
        setUrlIds(JSON.parse(stored));
      } catch {
        setUrlIds([]);
      }
    }
  }, []);

  const addUrl = (urlId: string) => {
    const newIds = [...urlIds, urlId];
    setUrlIds(newIds);
    localStorage.setItem(URLS_KEY, JSON.stringify(newIds));
  };

  const removeUrl = (urlId: string) => {
    const newIds = urlIds.filter(id => id !== urlId);
    setUrlIds(newIds);
    localStorage.setItem(URLS_KEY, JSON.stringify(newIds));
  };

  const canAddMore = urlIds.length < 3;

  return {
    urlIds,
    addUrl,
    removeUrl,
    canAddMore,
    count: urlIds.length
  };
}