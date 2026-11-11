const defaultUrl = () => import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

export function createLiveSocket({ onMessage, onStatus, url = defaultUrl(), reconnectDelay = 2000 } = {}) {
  let socket = null;
  let stopped = false;
  let timer = null;

  const connect = () => {
    if (stopped) return;
    onStatus?.('connecting');
    try {
      socket = new WebSocket(url);
      socket.onopen = () => onStatus?.('connected');
      socket.onmessage = (e) => {
        try {
          onMessage?.(JSON.parse(e.data));
        } catch {
          onStatus?.('invalid');
        }
      };
      socket.onerror = () => onStatus?.('error');
      socket.onclose = () => {
        if (!stopped) {
          onStatus?.('reconnecting');
          timer = setTimeout(connect, reconnectDelay);
        }
      };
    } catch {
      onStatus?.('reconnecting');
      timer = setTimeout(connect, reconnectDelay);
    }
  };

  connect();

  return {
    close() {
      stopped = true;
      clearTimeout(timer);
      socket?.close();
    },
    send(payload) {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(payload));
      }
    }
  };
}
