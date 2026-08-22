import { closeTool } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { requestCompassPermission } from '@features/location/compass.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { isPremium } from '@features/premium/premium.js';
import windowClasses from '@shared/components/FloatingWindow.module.css';
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
import {
  FaArrowsAlt,
  FaInfoCircle,
  FaPlay,
  FaStop,
  FaTimes,
} from 'react-icons/fa';
import { LuMoveDiagonal2 } from 'react-icons/lu';
import { MdFullscreen, MdFullscreenExit } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import {
  panoramaCancel,
  panoramaSetSettings,
  panoramaToggleFullscreen,
} from '../model/actions.js';
import { grantedQuality, PANORAMA_QUALITIES } from '../quality.js';
import { getPanoramaRenderData } from '../renderHolder.js';
import { usePanoramaMessages } from '../translations/usePanoramaMessages.js';
import classes from './Panorama.module.css';
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

  const { render, rendering, error, fullscreen, probe } = useAppSelector(
    (state) => state.panorama,
  );

  const settings = useAppSelector((state) => state.panoramaSettings);

  const premium = useAppSelector((state) => isPremium(state.auth.user));

  const data = getPanoramaRenderData();

  const elapsed = useElapsed(rendering);

  const [showCaveats, setShowCaveats] = useState(false);

  // Plain, not the `meter` unit style: an elevation is written with `m a.s.l.`
  // after it, which says both the unit and what it is measured from — worth
  // saying where a distance in metres is on the same line.
  const nfEle = useNumberFormat({ maximumFractionDigits: 0 });

  const { boxRef, footerRef, moveHandleRef, resizeHandleProps } =
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

  return (
    <div
      className={clsx(
        windowClasses.window,
        classes.panel,
        'd-flex',
        'flex-column',
        // Dropped rather than overridden in full screen: Bootstrap's utilities
        // are `!important` and a single class, the same weight as the rule that
        // would undo them, so which one wins comes down to stylesheet order.
        // Left on, they pad the panel and round it — a frame with the map
        // showing through it.
        !fullscreen && ['p-2', 'rounded'],
        // The plain class is what the header watches for, to lift its whole
        // stacking context over the bottom controls — see `Main.module.css`.
        fullscreen && [classes.fullscreen, 'fm-fullscreen'],
      )}
      ref={boxRef}
    >
      {!fullscreen && (
        <div
          className={clsx(windowClasses.moveHandle, classes.grip)}
          ref={moveHandleRef}
        >
          <FaArrowsAlt />
        </div>
      )}

      <button
        type="button"
        className={clsx(classes.closeGrip, classes.grip)}
        onClick={() => dispatch(closeTool('panorama'))}
      >
        <FaTimes />
      </button>
      {/* Sized by the flex column rather than by the window hook's measured
          height: that arrives an observer late, so a shrinking window would
          push the footer out of the box before the picture gave anything back. */}
      <div
        className={clsx(
          classes.content,
          'd-flex align-items-center justify-content-center',
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
            {rendering ? m?.rendering : m?.pickHint}
          </p>
        )}
      </div>
      {rendering && (
        <div className="mt-2 mx-2 d-flex align-items-center gap-2">
          <ProgressBar
            className="flex-grow-1"
            striped
            animated
            now={Math.min(99, (elapsed / expectedMs) * 100)}
            label={`${Math.round(elapsed / 1000)} s`}
          />

          <Button
            variant="dark"
            size="sm"
            onClick={() => dispatch(panoramaCancel())}
          >
            {m?.cancel}
          </Button>
        </div>
      )}
      <div
        className={clsx(
          windowClasses.footer,
          'd-flex flex-wrap align-items-center gap-2 mt-2 mb-1 mx-2 small',
        )}
        ref={footerRef}
      >
        {render && (
          <span className="text-body-secondary">
            {m?.eyeElevation}: {nfEle.format(render.eyeElevation)}{' '}
            {gm?.general.masl}
            {/* The finer picture is premium's; say so where the one on screen
                is the fast pass. */}
            {!premium && <PremiumGem hint={m?.quality.premiumHint} />}
          </span>
        )}

        {/* What was last picked out of the picture, beside where it was picked
            from. Here rather than over the picture: this is the one place in
            the panel that is already text, and a summit's figures said here
            cover nothing they are about. */}
        {probe && (
          <span>
            {/* The row is a flex line whose items are separate readings; the
                dot is what says this one belongs to the elevation before it
                rather than being the next thing along. */}
            <span className="text-body-secondary me-2">·</span>

            <PanoramaProbeReadout probe={probe} />
          </span>
        )}

        {render?.preview && (
          <span className="badge text-bg-secondary">{m?.preview}</span>
        )}

        {render && render.queueDepth > 0 && (
          <span className="text-body-secondary">{m?.busy}</span>
        )}

        {rendering && elapsed > expectedMs && (
          <span className="text-body-secondary">{m?.slow}</span>
        )}

        {/* A render that failed with a picture still on screen: said here
            rather than as an alert, which would take away a good picture over
            a failed attempt to replace it. */}
        {render && error && (
          <span className="text-danger">{m?.errors[error]}</span>
        )}

        <span className="ms-auto d-flex align-items-center gap-1">
          {/* The icon is what says which state it is in, so this is an ordinary
              action rather than a toggle wearing an outline. */}
          <LongPressTooltip label={m?.autoPan}>
            {({ props }) => (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  // Asked on either edge, not just when turning it on: a phone
                  // starts out following, so the press that gets here first is
                  // as often the one stopping it. Straight out of the click,
                  // since that is the only place iOS grants it from.
                  void requestCompassPermission();

                  dispatch(panoramaSetSettings({ autoPan: !settings.autoPan }));
                }}
                {...props}
              >
                {settings.autoPan ? <FaStop /> : <FaPlay />}
              </Button>
            )}
          </LongPressTooltip>

          <LongPressTooltip label={m?.fullscreen}>
            {({ props }) => (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => dispatch(panoramaToggleFullscreen(undefined))}
                {...props}
              >
                {fullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
              </Button>
            )}
          </LongPressTooltip>

          <LongPressTooltip label={m?.caveats.title}>
            {({ props }) => (
              <Button
                variant="secondary"
                size="sm"
                active={showCaveats}
                onClick={() => setShowCaveats((v) => !v)}
                {...props}
              >
                <FaInfoCircle />
              </Button>
            )}
          </LongPressTooltip>
        </span>

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
      {!fullscreen && (
        <div
          className={clsx(windowClasses.resizeHandle, classes.grip)}
          {...resizeHandleProps}
        >
          <LuMoveDiagonal2 />
        </div>
      )}
    </div>
  );
}
