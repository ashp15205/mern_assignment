import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

export function useApiHealth(pollMs = 15000) {
  const [status, setStatus] = useState('checking'); // checking | ok | degraded | offline

  const check = useCallback(async () => {
    try {
      const { data } = await api.health();
      setStatus(data.database === 'connected' ? 'ok' : 'degraded');
    } catch {
      setStatus('offline');
    }
  }, []);

  useEffect(() => {
    check();
    const id = setInterval(check, pollMs);
    return () => clearInterval(id);
  }, [check, pollMs]);

  return { status, retry: check };
}
