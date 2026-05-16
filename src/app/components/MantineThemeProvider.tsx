import { createTheme, MantineProvider, Tooltip } from '@mantine/core';
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
