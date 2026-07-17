import { useState, useEffect } from 'react';

export type MapplsLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

let globalLoadStatus: MapplsLoadStatus = 'idle';
let globalCallbacks: Array<(status: MapplsLoadStatus) => void> = [];

export const useMappls = () => {
  const [status, setStatus] = useState<MapplsLoadStatus>(globalLoadStatus);

  useEffect(() => {
    // If already loaded or errored, set status and exit
    if (globalLoadStatus === 'ready' || globalLoadStatus === 'error') {
      setStatus(globalLoadStatus);
      return;
    }

    const handleStatusChange = (newStatus: MapplsLoadStatus) => {
      setStatus(newStatus);
    };

    globalCallbacks.push(handleStatusChange);

    // If loading has already started, just listen
    if (globalLoadStatus === 'loading') {
      return () => {
        globalCallbacks = globalCallbacks.filter((cb) => cb !== handleStatusChange);
      };
    }

    // Start script loading
    globalLoadStatus = 'loading';
    globalCallbacks.forEach((cb) => cb('loading'));

    const apiKey = import.meta.env.VITE_MAPPLS_API_KEY;
    if (!apiKey) {
      console.error('❌ Mappls API key is not configured in VITE_MAPPLS_API_KEY!');
      globalLoadStatus = 'error';
      globalCallbacks.forEach((cb) => cb('error'));
      return;
    }

    // Mappls Web Map JS SDK URL
    const scriptSrc = `https://apis.mappls.com/advancedmaps/api/${apiKey}/map_sdk?v=3.0`;

    const existingScript = document.querySelector(`script[src^="https://apis.mappls.com/advancedmaps/api/"]`);

    if (existingScript) {
      // Check if SDK already loaded globally
      if (window.mappls) {
        globalLoadStatus = 'ready';
        globalCallbacks.forEach((cb) => cb('ready'));
      } else {
        existingScript.addEventListener('load', () => {
          globalLoadStatus = 'ready';
          globalCallbacks.forEach((cb) => cb('ready'));
        });
        existingScript.addEventListener('error', () => {
          globalLoadStatus = 'error';
          globalCallbacks.forEach((cb) => cb('error'));
        });
      }
      return () => {
        globalCallbacks = globalCallbacks.filter((cb) => cb !== handleStatusChange);
      };
    }

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    script.defer = true;

    script.addEventListener('load', () => {
      // Check if window.mappls is loaded
      if (window.mappls) {
        globalLoadStatus = 'ready';
        globalCallbacks.forEach((cb) => cb('ready'));
      } else {
        // Polling check if there is delay
        let retries = 0;
        const interval = setInterval(() => {
          if (window.mappls) {
            clearInterval(interval);
            globalLoadStatus = 'ready';
            globalCallbacks.forEach((cb) => cb('ready'));
          } else if (retries > 10) {
            clearInterval(interval);
            globalLoadStatus = 'error';
            globalCallbacks.forEach((cb) => cb('error'));
          }
          retries++;
        }, 100);
      }
    });

    script.addEventListener('error', () => {
      globalLoadStatus = 'error';
      globalCallbacks.forEach((cb) => cb('error'));
    });

    document.body.appendChild(script);

    return () => {
      globalCallbacks = globalCallbacks.filter((cb) => cb !== handleStatusChange);
    };
  }, []);

  return {
    isLoaded: status === 'ready',
    isLoading: status === 'loading',
    isError: status === 'error',
    status
  };
};

// Add typescript declaration for window.mappls
declare global {
  interface Window {
    mappls: any;
  }
}
