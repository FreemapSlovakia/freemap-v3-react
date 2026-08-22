import { closeTool } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { isPremium } from '@features/premium/premium.js';
import windowClasses from '@shared/components/FloatingWindow.module.css';
import { FloatingWindowGrips } from '@shared/components/FloatingWindowControls.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { ELEVATION_API_DTM_ATTRIBUTION } from '@shared/elevationSources.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useFloatingWindow } from '@shared/hooks/useFloatingWindow.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
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
import { FaEye, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { panoramaCancel } from '../model/actions.js';
import { grantedQuality, PANORAMA_QUALITIES } from '../quality.js';
import { getPanoramaRenderData } from '../renderHolder.js';
import { usePanoramaMessages } from '../translations/usePanoramaMessages.js';
import classes from './Panorama.module.css';
import { PanoramaControls } from './PanoramaControls.js';
import { PanoramaProbeReadout } from './PanoramaProbeReadout.js';
import { PanoramaView } from './PanoramaView.js';

/**
 * Every model the panorama can be drawn from: the national ones the outdoor map
 * credits, and the global fallback past their borders. The service says nothing
 * about which of them answered, and a view reaches 300 km across borders, so
 * they are all credited.
 */
const TERRAIN_SOURCES = [...ELEVATION_API_DTM_ATTRIBUTION, GEDTM30_ATTR];

function useElapsed(running: boolean): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) {
      setElapsed(0);

      return;
    }

    const started = performance.now();

    const timer = setInterval(
      () => setElapsed(performance.now() - started),
      250,
    );

    return () => clearInterval(timer);
  }, [running]);

  return elapsed;
}

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

  const data = getPanoramaRenderData();

  const elapsed = useElapsed(rendering);

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

  const nfPercent = useNumberFormat({
    style: 'percent',
    maximumFractionDigits: 0,
  });

  // The service reports its own progress, but only once the request has landed
  // on it, and not at all where the side channel can't be opened — so the clock
  // estimate stands in until a real figure arrives.
  const queued = progress?.phase === 'queued' ? progress : null;

  // Only the rendering phase counts columns; the ones after it carry no figure
  // and would otherwise drop a nearly full bar back to zero.
  const percent =
    !progress || queued
      ? null
      : progress.phase === 'rendering'
        ? progress.percent
        : 100;

  return (
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
            {rendering ? m?.rendering : m?.pickHint({ icon: <FaEye /> })}
          </p>
        )}

        {/* Says the picture on screen is the fast first pass. `mt-5` clears
            what is already in that corner: the compass strip and the move
            grip. */}
        {render?.preview && (
          <span className="badge text-bg-secondary position-absolute z-1 top-0 start-0 m-2 mt-5">
            {m?.preview}
          </span>
        )}

        {/* What the picture answers: where the eye stands, and what was last
            picked out of it. Opposite the preview badge, and clear of the
            compass strip and the close button by the same `mt-5`. */}
        {(render || probe) && (
          <div className="position-absolute z-1 top-0 end-0 m-2 mt-5 p-2 rounded bg-dark bg-opacity-50 small text-white text-end mw-100">
            {render && (
              <div>
                {m?.eyeElevation}: {nfEle.format(render.eyeElevation)}{' '}
                {gm?.general.masl}
                {/* The finer picture is premium's; say so where the one on
                    screen is the fast pass. */}
                {!premium && <PremiumGem hint={m?.quality.premiumHint} />}
              </div>
            )}

            {probe && <PanoramaProbeReadout probe={probe} />}
          </div>
        )}

        {/* Over the picture, not above it: a row of its own takes its height
            off the view, so the picture would shrink and grow back twice per
            render. On a scrim, since it lies over whatever is on screen. */}
        {rendering && (
          <div className="position-absolute z-1 bottom-0 start-0 end-0 m-2 p-2 rounded bg-dark bg-opacity-50">
            {queued && (
              <p className="mb-1 small text-white">
                {m?.queued({ ahead: queued.ahead })}
              </p>
            )}

            <div className="d-flex align-items-center gap-2">
              {/* Full and grey while queued: there is nothing to be a fraction
                  of until the render starts. */}
              <ProgressBar
                className="flex-grow-1"
                striped
                animated
                variant={queued ? 'secondary' : undefined}
                now={
                  queued
                    ? 100
                    : (percent ?? Math.min(99, (elapsed / expectedMs) * 100))
                }
                label={
                  percent === null
                    ? `${Math.round(elapsed / 1000)} s`
                    : nfPercent.format(percent / 100)
                }
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

              <p className="mb-0">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
