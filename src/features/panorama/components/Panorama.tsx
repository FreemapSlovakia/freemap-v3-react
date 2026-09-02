import { closeTool } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { isPremium } from '@features/premium/premium.js';
import { BreakpointsProvider } from '@shared/components/BreakpointsProvider.js';
import windowClasses from '@shared/components/FloatingWindow.module.css';
import { FloatingWindowGrips } from '@shared/components/FloatingWindowControls.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { PlaceActionsButton } from '@shared/components/PlaceActionsButton.js';
import { ELEVATION_API_DTM_ATTRIBUTION } from '@shared/elevationSources.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useFloatingWindow } from '@shared/hooks/useFloatingWindow.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { useTerrainProgress } from '@shared/hooks/useTerrainProgress.js';
import { GEDTM30_ATTR } from '@shared/mapDefinitions.js';
import clsx from 'clsx';
import {
  Fragment,
  type ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Alert, Button, ProgressBar } from 'react-bootstrap';
import { FaCrosshairs, FaStreetView, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { type PanoramaProbe, panoramaCancel } from '../model/actions.js';
import { grantedQuality, PANORAMA_QUALITIES } from '../quality.js';
import { usePanoramaRenderData } from '../renderHolder.js';
import { usePanoramaMessages } from '../translations/usePanoramaMessages.js';
import { usePanoramaAim } from '../viewStore.js';
import classes from './Panorama.module.css';
import { PanoramaControls } from './PanoramaControls.js';
import { PanoramaProbeReadout, readoutOf } from './PanoramaProbeReadout.js';
import { PanoramaView, PICKED_INK } from './PanoramaView.js';

/**
 * Every model the panorama can be drawn from: the national ones the outdoor map
 * credits, and the global fallback past their borders. The service says nothing
 * about which of them answered, and a view reaches 300 km across borders, so
 * they are all credited.
 */
const TERRAIN_SOURCES = [...ELEVATION_API_DTM_ATTRIBUTION, GEDTM30_ATTR];

export default function Panorama(): ReactElement {
  const m = usePanoramaMessages();

  const gm = useMessages();

  const dispatch = useDispatch();

  const { render, rendering, progress, error, probe } = useAppSelector(
    (state) => state.panorama,
  );

  // Plain, not the `meter` unit style: `general.masl` follows it and says both
  // the unit and what it is measured from.
  const nfEle = useNumberFormat({ maximumFractionDigits: 0 });

  const settings = useAppSelector((state) => state.panoramaSettings);

  const premium = useAppSelector((state) => isPremium(state.auth.user));

  const data = usePanoramaRenderData();

  const [showCaveats, setShowCaveats] = useState(false);

  const { boxProps, bottomProps, fullscreen, toggleFullscreen, ...grips } =
    useFloatingWindow({ storageKey: 'fm.panorama.window' });

  // The view fills whatever the box leaves it, which full screen changes out
  // from under the window hook — so it is measured rather than computed.
  const contentRef = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = contentRef.current;

    if (!el) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      const rect = entry?.contentRect;

      if (rect) {
        setSize({
          width: Math.floor(rect.width),
          height: Math.floor(rect.height),
        });
      }
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // What the picture is being drawn at, which is also how long to expect to
  // wait — the two-pass preview aside, that is the whole of it.
  const { expectedMs } =
    PANORAMA_QUALITIES[grantedQuality(settings.quality, premium)];

  const bar = useTerrainProgress(rendering, progress, expectedMs);

  return (
    // The window is resized by its own grip, so its controls collapse against
    // its width — a wide screen says nothing about the room this row has. Zero
    // until the observer answers, and while the panel is put away for a place
    // to be picked: collapsed is what a box of no width has room for, and the
    // viewport's own width would expand every label for the frame the panel
    // comes back on.
    <BreakpointsProvider width={size.width}>
      <div {...boxProps}>
        <FloatingWindowGrips
          fullscreen={fullscreen}
          gripClassName={classes.grip}
          {...grips}
        />

        {/* The only close button: the panel has no toolbar row of its own. */}
        <LongPressTooltip label={gm?.general.close}>
          {({ props }) => (
            <button
              type="button"
              className={clsx(classes.closeGrip, classes.grip)}
              onClick={() => dispatch(closeTool('panorama'))}
              {...props}
            >
              <FaTimes />
            </button>
          )}
        </LongPressTooltip>
        {/* Sized by the flex column rather than by the window hook's measured
          height: that arrives an observer late, so a shrinking window would
          push the footer out of the box before the picture gave anything back. */}
        <div
          className={clsx(
            classes.content,
            // `position-relative` is what the overlays below anchor to; the
            // observer sizing the view reads this box's own rect, which they
            // leave alone.
            'position-relative d-flex align-items-center justify-content-center',
          )}
          ref={contentRef}
        >
          {render && data && data.id === render.id ? (
            <PanoramaView
              render={render}
              data={data}
              width={size.width}
              height={size.height}
            />
          ) : error ? (
            <Alert variant="danger" className="m-0">
              {m?.errors[error]}
            </Alert>
          ) : (
            <p className="m-0 text-center text-body-secondary">
              {rendering
                ? m?.rendering
                : m?.pickHint({ icon: <FaStreetView /> })}
            </p>
          )}

          {/* What the picture answers, in two boxes rather than one: where the
              eye stands is of the picture, what was last picked out of it is of
              a place, and the menu belongs to that place alone — under one box
              it read as the viewpoint's. Clear of the close button the same way
              the grips are. The row itself passes presses through, or it would
              take a whole band of sky away from turning the view. */}
          {(render || probe) && (
            <div
              className={clsx(
                fullscreen ? classes.belowGripsFullscreen : classes.belowGrips,
                'position-absolute z-1 top-0 start-0 end-0 mx-2 mb-2 d-flex align-items-start justify-content-between gap-2 pe-none',
              )}
            >
              <div className="d-flex flex-column align-items-start gap-1 pe-auto">
                {render && (
                  <div className="p-2 rounded bg-dark bg-opacity-50 small text-white">
                    {gm?.general.viewpoint}: {nfEle.format(render.eyeElevation)}{' '}
                    {gm?.general.masl}
                    {/* The finer picture is premium's; say so where the one on
                      screen is the fast pass. */}
                    {!premium && <PremiumGem hint={m?.quality.premiumHint} />}
                  </div>
                )}

                {/* Says the picture on screen is the fast first pass. Under the
                    elevation, not over it: it comes and goes with every render,
                    and above it would shift the box below it each time. */}
                {render?.preview && (
                  <span className="badge text-bg-secondary">{m?.preview}</span>
                )}
              </div>

              <MarkBox probe={probe} />
            </div>
          )}

          {/* Over the picture, not above it: a row of its own takes its height
            off the view, so the picture would shrink and grow back twice per
            render. On a scrim, since it lies over whatever is on screen. */}
          {rendering && (
            <div className="position-absolute z-1 bottom-0 start-0 end-0 m-2 p-2 rounded bg-dark bg-opacity-50">
              {bar.queued && (
                <p className="mb-1 small text-white">
                  {m?.queued({ ahead: bar.queued.ahead })}
                </p>
              )}

              <div className="d-flex align-items-center gap-2">
                <ProgressBar
                  className="flex-grow-1"
                  striped
                  animated
                  variant={bar.variant}
                  now={bar.now}
                  label={bar.label}
                />

                <Button
                  variant="dark"
                  size="sm"
                  onClick={() => dispatch(panoramaCancel())}
                >
                  {m?.cancel}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div {...bottomProps}>
          <PanoramaControls
            showCaveats={showCaveats}
            onToggleCaveats={() => setShowCaveats((v) => !v)}
            fullscreen={fullscreen}
            onToggleFullscreen={toggleFullscreen}
          />

          <div
            className={clsx(
              windowClasses.footer,
              'd-flex flex-wrap align-items-center gap-2 mt-2 mb-1 mx-2 small',
            )}
          >
            {/* A render that failed with a picture still on screen: said here
            rather than as an alert, which would take away a good picture over
            a failed attempt to replace it. */}
            {render && error && (
              <span className="text-danger">{m?.errors[error]}</span>
            )}

            {showCaveats && (
              <div className="w-100 text-body-secondary">
                <p className="mb-1">{m?.caveats.bareEarth}</p>

                <p className="mb-1">{m?.caveats.coverage}</p>

                <p className="mb-1">{m?.caveats.viewpoint}</p>

                {/* Of the render, not of the setting: this says what the picture
                  on screen is, and a lift only staged has not drawn it yet. */}
                {(render?.depthLift ?? 0) > 0 && (
                  <p className="mb-1">{m?.caveats.depthLift}</p>
                )}

                <p className="mb-1">
                  {m?.terrainSource}:{' '}
                  {TERRAIN_SOURCES.map((attr, i) => (
                    <Fragment key={attr.name}>
                      {i > 0 ? ', ' : null}

                      {attr.url ? (
                        <a
                          href={attr.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-body-emphasis"
                        >
                          {attr.name}
                        </a>
                      ) : (
                        attr.name
                      )}
                    </Fragment>
                  ))}
                </p>

                {/* Every name in the picture is an OSM node — the summit's own
                    elevation comes from the terrain model above, but what it is
                    called does not. */}
                <p className="mb-0">
                  {m?.peakSource}:{' '}
                  <a
                    href="https://osm.org/copyright"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-body-emphasis"
                  >
                    {gm?.mapLayers.attr['osmData']}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </BreakpointsProvider>
  );
}

/**
 * What was last picked out of the picture, or where a gesture on the map is
 * holding it — its own component because that gesture reports every frame, and
 * the panel around it has nothing to say about a mark being dragged.
 */
function MarkBox({ probe }: { probe: PanoramaProbe | null }): ReactElement {
  const aim = usePanoramaAim();

  const readout = readoutOf(aim, probe);

  return !readout ? (
    <div />
  ) : (
    <div className="p-2 rounded bg-dark bg-opacity-50 small text-white text-end pe-auto">
      {/* What the box is of, where two bare figures would not say: the mark the
          picture and the map both wear, in the same ink. A summit says it by
          name instead. */}
      <div className="d-flex align-items-center gap-2">
        {!readout.peak && <FaCrosshairs color={PICKED_INK} />}

        <div className="flex-grow-1">
          <PanoramaProbeReadout probe={readout} />
        </div>
      </div>

      {/* What was picked out of the picture is a place like any other: route to
          it, look from it, open it elsewhere. Not while the mark is being
          dragged: it is on its way somewhere, and the place under it is not
          settled yet. */}
      {probe && !aim?.mark && (
        <PlaceActionsButton
          className="mt-1"
          size="sm"
          lat={probe.lat}
          lon={probe.lon}
        />
      )}
    </div>
  );
}
