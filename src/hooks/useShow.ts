import { useEffect, useState } from 'react';

export type ShowProps = { show: boolean };

// this hook is to prevent loading hidden components (modals)
// we could render async component conditionaly but this would break fade-out animation of closing dialogs
export function useShow(show: boolean): true | null {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (show) {
      setShown(true);
    } else {
      // this is to get rid of modal state after closing (and fade-out animation)
      const t = setTimeout(() => {
        setShown(false);
      }, 1000);
      return () => {
        clearTimeout(t);
      };
    }
  }, [show]);

  return show || shown || null;
}
