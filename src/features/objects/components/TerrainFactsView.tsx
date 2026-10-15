import { convertToDrawing } from '@app/store/actions.js';
import { useConvertToDataViewer } from '@features/dataViewer/hooks/useConvertToDataViewer.js';
import { ElevationSourcesInfo } from '@features/elevationChart/components/ElevationValue.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { searchSelectResult } from '@features/search/model/actions.js';
import { loadingResult } from '@features/search/model/resultUtils.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { useTerrainLicenses } from '@shared/tileLicenses.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { featureCollection, lineString, point } from '@turf/helpers';
import type { Feature } from 'geojson';
import type { ReactElement, ReactNode } from 'react';
import { Button, ButtonGroup, Dropdown, Spinner } from 'react-bootstrap';
import { FaEllipsisV, FaMapMarkerAlt, FaPencilAlt } from 'react-icons/fa';
import { MdShapeLine } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { objectsRouteClear, objectsRouteRequest } from '../model/actions.js';
import { type TerrainFacts, terrainCredits } from '../model/terrainFacts.js';
import { useObjectsMessages } from '../translations/useObjectsMessages.js';
import { TerrainMarkToggle } from './TerrainMarkToggle.js';

type Props = {
  facts: TerrainFacts;
  osmId: number;
  /** The peak's or saddle's own, for what is copied off it. */
  name: string | undefined;
  /** The summit or saddle elevation, from the same service, so under one ⓘ. */
  elevationRow?: ReactNode;
};

/** A peak's prominence, key col and isolation, or a saddle's depth. */
export function TerrainFactsView({
  facts,
  osmId,
  name,
  elevationRow,
}: Props): ReactElement {
  const om = useObjectsMessages();

  const m = useMessages();

  const dispatch = useDispatch();

  const convertToDataViewer = useConvertToDataViewer();

  const nfM = useNumberFormat({ maximumFractionDigits: 0 });

  const nfKm = useNumberFormat({ maximumFractionDigits: 1 });

  const route = useAppSelector((state) =>
    state.objects.route?.osmId === osmId ? state.objects.route : null,
  );

  const keyColShown = useAppSelector(
    (state) => state.objects.marks.keyCol?.osmId === osmId,
  );

  const licenses = useTerrainLicenses();

  // The number bold and its unit not, as the elevation line writes it.
  const metres = (value: number) => (
    <>
      <b>{nfM.format(value)}</b>&nbsp;m
    </>
  );

  // By the rounded metres: 999.6 m is written as 1 km, not 1,000 m.
  const distance = (value: number) =>
    Math.round(value) < 1000 ? (
      metres(value)
    ) : (
      <>
        <b>{nfKm.format(value / 1000)}</b>&nbsp;km
      </>
    );

  const selectNode = (id: number) =>
    dispatch(
      searchSelectResult({
        result: loadingResult({ type: 'osm', elementType: 'node', id }),
        // A neighbouring summit: brought into view, not zoomed in on.
        focus: 'pan',
      }),
    );

  const showOnMap = (onClick: () => void, className?: string) => (
    <LongPressTooltip label={om?.terrain.showOnMap}>
      {({ props }) => (
        <Button
          variant="secondary"
          size="sm"
          className={className}
          onClick={onClick}
          {...props}
        >
          <FaMapMarkerAlt />
        </Button>
      )}
    </LongPressTooltip>
  );

  // Negative margins: as tall as a button, without making its line taller.
  const inLine = 'ms-2 my-n1';

  /** One ⓘ for the lines shown, on a bracket that says what it spans. */
  const bracketed = (lines: ReactNode[], codes: string[]) => {
    const shown = lines.filter(Boolean);

    // Nothing to group for a single value, nor with no ⓘ to group under.
    const grouped = shown.length > 1 && codes.length > 0;

    return (
      <div className="d-flex">
        <div>{shown}</div>

        {grouped && (
          <div
            className="ms-2 border border-start-0 border-secondary-subtle rounded-end flex-shrink-0"
            style={{ width: '0.5rem' }}
          />
        )}

        <div className={grouped ? 'align-self-center' : undefined}>
          <ElevationSourcesInfo
            attributions={terrainCredits(codes, licenses)}
          />
        </div>
      </div>
    );
  };

  if (facts.kind === 'saddle') {
    const { depthM, keyColOf } = facts;

    return bracketed(
      [
        elevationRow,
        depthM !== null && (
          <div key="depth">
            {om?.terrain.depth}: {metres(depthM)}
          </div>
        ),
        keyColOf && (
          <div key="keyColOf">
            {om?.terrain.keyColOf}:{' '}
            <b>{keyColOf.name ?? `#${keyColOf.osmId}`}</b>
            {showOnMap(() => selectNode(keyColOf.osmId), inLine)}
          </div>
        ),
      ],
      facts.eleSources,
    );
  }

  const { prominence, isolationM, col } = facts;

  /** The ⋮ beside a toggle, copying what it shows off the map. */
  const copyMenu = (feature: () => Feature) => {
    const geojson = () => featureCollection([feature()]);

    return (
      <Dropdown as={ButtonGroup}>
        {/* Nested, so the group's `sm` doesn't reach it. */}
        <Dropdown.Toggle variant="secondary" size="sm">
          <FaEllipsisV />
        </Dropdown.Toggle>

        <FmDropdownMenu>
          <Dropdown.Item
            onClick={() =>
              dispatch(
                convertToDrawing({ type: 'geojson', geojson: geojson() }),
              )
            }
          >
            <FaPencilAlt /> {m?.general.copyToDrawing}
          </Dropdown.Item>

          <Dropdown.Item
            onClick={() =>
              convertToDataViewer({ type: 'geojson', geojson: geojson() })
            }
          >
            <MdShapeLine /> {m?.general.copyTo({ tool: m.tools.dataViewer })}
          </Dropdown.Item>
        </FmDropdownMenu>
      </Dropdown>
    );
  };

  const routeCoords = route?.coordinates;

  return bracketed(
    [
      elevationRow,
      prominence !== null && (
        <div key="prominence">
          {om?.terrain.prominence}: {metres(prominence)}
        </div>
      ),
      col && (
        <div key="col">
          {om?.terrain.keyCol}:{' '}
          {col.name !== null && (
            <>
              <b>{col.name}</b>,{' '}
            </>
          )}
          <b>{nfM.format(col.ele)}</b>&nbsp;{m?.general.masl}
          <ButtonGroup size="sm" className={inLine}>
            {/* Marked rather than selected: selecting the saddle would replace
                these details, and the mark with them. */}
            <TerrainMarkToggle
              kind="keyCol"
              mark={{ osmId, lat: col.lat, lon: col.lon, poi: 'saddle' }}
            />

            {keyColShown &&
              copyMenu(() =>
                point([col.lon, col.lat], {
                  name: col.name ?? om?.terrain.keyCol,
                  ele: col.ele.toFixed(1),
                  natural: 'saddle',
                }),
              )}
          </ButtonGroup>
        </div>
      ),
      isolationM !== null && (
        <div key="isolation">
          {om?.terrain.isolation}: {distance(isolationM)}
        </div>
      ),
      // An island's col is the sea, and leaves no route.
      col && (
        <ButtonGroup key="route" size="sm" className="mt-1">
          <Button
            variant={route ? 'primary' : 'outline-primary'}
            active={Boolean(route)}
            onClick={() => {
              if (!route) {
                trackMatomo(['trackEvent', 'Objects', 'showProminenceRoute']);
              }

              dispatch(
                route ? objectsRouteClear() : objectsRouteRequest({ osmId }),
              );
            }}
          >
            {route && !route.coordinates && (
              <Spinner animation="border" size="sm" className="me-1" />
            )}
            {route ? om?.terrain.hideRoute : om?.terrain.showRoute}
          </Button>

          {routeCoords &&
            copyMenu(() =>
              lineString(
                routeCoords.map(([lat, lon]) => [lon, lat]),
                {
                  name: [name, om?.terrain.route].filter(Boolean).join(' – '),
                },
              ),
            )}
        </ButtonGroup>
      ),
    ],
    elevationRow ? [...facts.eleSources, ...facts.sources] : facts.sources,
  );
}
