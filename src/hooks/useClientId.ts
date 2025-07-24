import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const CLIENT_ID_KEY = 'renderpulse_client_id';

export function useClientId() {
  const [clientId, setClientId] = useState<string>('');

  useEffect(() => {
    // Get or create client ID
    let id = localStorage.getItem(CLIENT_ID_KEY);
    if (!id) {
      id = uuidv4();
      localStorage.setItem(CLIENT_ID_KEY, id);
    }
    setClientId(id);
  }, []);

  return clientId;
}