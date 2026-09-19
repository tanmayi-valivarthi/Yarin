import { useEffect, useRef, useCallback } from 'react';
import { wsUrl } from '@/services/api';

export interface WsEvent {
  type: string;
  [key: string]: any;
}

export function useWebSocket(onEvent: (event: WsEvent) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(wsUrl());
      wsRef.current = ws;

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          onEventRef.current(data);
        } catch { /* ignore non-JSON */ }
      };

      ws.onclose = () => {
        wsRef.current = null;
        // Reconnect after 3s
        setTimeout(() => connect(), 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      setTimeout(() => connect(), 3000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return wsRef;
}
