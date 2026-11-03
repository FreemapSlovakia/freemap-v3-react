import { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

/** Resolves to whether the document went fullscreen. */
export async function requestDocumentFullscreen(): Promise<boolean> {
  try {
    // Some WebViews advertise the API but reject (or throw synchronously)
    // with "Fullscreen is not supported"; `await` catches both.
    await document.body.requestFullscreen();

    return true;
  } catch {
    return false;
  }
}

export function toggleFullscreen(): void {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  } else {
    void requestDocumentFullscreen();
  }
}

export function useFullscreen(): { available: boolean; active: boolean } {
  // An installed app has no browser chrome to escape, so fullscreen would win
  // nothing. Deliberately not `(display-mode: fullscreen)` as well: that also
  // matches while the Fullscreen API is active, which would take the control
  // away at the moment it is needed to leave again.
  const installed = useMediaQuery({ query: '(display-mode: standalone)' });

  const [active, setActive] = useState(() =>
    Boolean(document.fullscreenElement),
  );

  useEffect(() => {
    function handler() {
      setActive(Boolean(document.fullscreenElement));
    }

    document.addEventListener('fullscreenchange', handler);

    return () => {
      document.removeEventListener('fullscreenchange', handler);
    };
  }, []);

  return { available: document.fullscreenEnabled && !installed, active };
}
