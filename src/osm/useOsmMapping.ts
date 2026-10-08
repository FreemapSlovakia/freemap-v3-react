import { useEffect, useState } from 'react';
import { getOsmMapping } from './osmNameResolver.js';
import type { OsmMapping } from './types.js';

/** The OSM tag names for `language`, once its chunk has loaded. */
export function useOsmMapping(language: string): OsmMapping | undefined {
  const [mapping, setMapping] = useState<OsmMapping>();

  useEffect(() => {
    let current = true;

    getOsmMapping(language).then((mapping) => {
      if (current) {
        setMapping(mapping);
      }
    });

    return () => {
      current = false;
    };
  }, [language]);

  return mapping;
}
