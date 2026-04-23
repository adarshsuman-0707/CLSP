/**
 * useSSE — subscribes to the backend SSE stream and calls onEvent
 * whenever a booking-related event arrives.
 */

import { useEffect, useRef } from 'react';
import API_BASE_URL from '../Services/api.js';

// Strip trailing slash then add the path
const SSE_URL = API_BASE_URL.replace(/\/$/, '') + '/service/events';

const useSSE = (token, onEvent) => {
  // Keep callback ref fresh — avoids stale closure without re-subscribing
  const onEventRef = useRef(onEvent);
  useEffect(() => { onEventRef.current = onEvent; }, [onEvent]);

  useEffect(() => {
    if (!token) return;

    let es = null;
    let retryDelay = 1000;
    let retryTimer = null;
    let destroyed = false;

    const connect = () => {
      if (destroyed) return;

      // EventSource cannot send custom headers — pass token as query param.
      // authmiddleware accepts ?token= for this reason.
      const url = `${SSE_URL}?token=${encodeURIComponent(token)}`;
      console.log('[SSE] Connecting to', url);

      es = new EventSource(url, { withCredentials: true });

      es.onopen = () => {
        console.log('[SSE] Connection opened ✅');
        retryDelay = 1000; // reset back-off
      };

      es.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          console.log('[SSE] Event received:', event);

          // Skip the internal "connected" ping — don't pass to callback
          if (event.type === 'connected') return;

          onEventRef.current(event);
        } catch (err) {
          console.warn('[SSE] Failed to parse event:', e.data, err);
        }
      };

      es.onerror = (err) => {
        console.warn('[SSE] Connection error, retrying in', retryDelay, 'ms', err);
        es.close();
        if (!destroyed) {
          retryTimer = setTimeout(() => {
            retryDelay = Math.min(retryDelay * 2, 30000);
            connect();
          }, retryDelay);
        }
      };
    };

    connect();

    return () => {
      console.log('[SSE] Cleaning up connection');
      destroyed = true;
      clearTimeout(retryTimer);
      if (es) es.close();
    };
  }, [token]);
};

export default useSSE;
