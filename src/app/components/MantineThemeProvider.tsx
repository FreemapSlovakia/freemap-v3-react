import {
  createTheme,
  MantineProvider,
  Menu,
  Popover,
  Tooltip,
} from '@mantine/core';
import { ReactNode, useEffect, useState } from 'react';

function readBsTheme(): 'light' | 'dark' {
  return document.documentElement.getAttribute('data-bs-theme') === 'dark'
    ? 'dark'
    : 'light';
}

const theme = createTheme({
  defaultRadius: '3px',
  components: {
    Tooltip: Tooltip.extend({
      defaultProps: {
        zIndex: 2000,
      },
    }),
    Popover: Popover.extend({
      defaultProps: {
        zIndex: 2000,
        // Match react-bootstrap useRootClose: close on click only. The
        // map-wrapper's onClickCapture in Main.tsx intercepts clicks while a
        // dropdown is open (detected via aria-expanded=true), stops
        // propagation, and forwards a synthetic click to body so the
        // popover closes itself. Default ['mousedown', 'touchstart'] fires
        // before click, defeating that scheme. 'touchend' would close the
        // MapContextMenu the moment the user releases a long-press, since
        // long-press fires touchend but no synthesized click — sticking to
        // 'click' lets the long-press menu stay open until the user taps.
        clickOutsideEvents: ['click'],
      },
    }),
    Menu: Menu.extend({
      defaultProps: {
        clickOutsideEvents: ['click'],
        withArrow: true,
      },
    }),
  },
});

export function MantineThemeProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(readBsTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setColorScheme(readBsTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-bs-theme'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <MantineProvider theme={theme} forceColorScheme={colorScheme}>
      {children}
    </MantineProvider>
  );
}
