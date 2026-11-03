import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-bs-theme'],
  });

  return () => observer.disconnect();
}

const getTheme = () =>
  document.documentElement.dataset['bsTheme'] === 'dark' ? 'dark' : 'light';

/** The theme the app shows (`window.applyTheme` sets it on `<html>`). */
export function useBsTheme(): 'dark' | 'light' {
  return useSyncExternalStore(subscribe, getTheme);
}
