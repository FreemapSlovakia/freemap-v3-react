import {
  coverageFailing,
  loadTileCoverage,
  type TileCoverage,
  unknownCoverage,
  useTileCoverages,
} from '@shared/tileCoverage.js';
import { Fragment, type ReactNode, useEffect, useId, useState } from 'react';
import { Pane, useMap } from 'react-leaflet';

const RETRY_MS = 60_000;

type Props = {
  coverageUrl: string;
  opacity: number;
  zIndex: number;
  children: (coverage: TileCoverage) => ReactNode;
};

/**
 * Its own stacking context, so the layers inside keep their order and share the
 * opacity.
 */
export function CoveragePane({
  coverageUrl,
  opacity,
  zIndex,
  children,
}: Props): ReactNode {
  const name = `fm-coverage-${useId().replace(/\W/g, '')}`;

  const loaded = useTileCoverages([coverageUrl]).get(coverageUrl);

  const [failed, setFailed] = useState(() => coverageFailing(coverageUrl));

  // Until a retry succeeds, both sources are drawn everywhere.
  useEffect(() => {
    if (loaded) {
      return;
    }

    let timer: number | undefined;

    let active = true;

    const attempt = () => {
      loadTileCoverage(coverageUrl).then((coverage) => {
        if (active && coverage === unknownCoverage) {
          setFailed(true);

          timer = window.setTimeout(attempt, RETRY_MS);
        }
      });
    };

    attempt();

    return () => {
      active = false;

      window.clearTimeout(timer);
    };
  }, [coverageUrl, loaded]);

  const map = useMap();

  // `Pane` takes its style at creation only; a remount would reload every tile.
  useEffect(() => {
    const pane = map.getPane(name);

    if (pane) {
      pane.style.opacity = String(opacity);

      pane.style.zIndex = String(zIndex);
    }
  }, [map, name, opacity, zIndex]);

  const coverage = loaded ?? (failed ? unknownCoverage : undefined);

  return (
    <Pane name={name} pane="tilePane" style={{ zIndex, opacity }}>
      {coverage && (
        // the layers take `skipTile` at construction, so a loaded coverage remounts them
        <Fragment key={loaded ? 'known' : 'unknown'}>
          {children(coverage)}
        </Fragment>
      )}
    </Pane>
  );
}
