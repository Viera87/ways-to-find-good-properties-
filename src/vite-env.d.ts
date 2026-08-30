/// <reference types="vite/client" />

interface Window {
  certusNative?: {
    fetchJson: (url: string) => Promise<unknown>;
  };
}
