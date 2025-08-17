import webVitals from 'web-vitals';

declare global {
  interface Window {
    webVitals: typeof webVitals;
  }
}
