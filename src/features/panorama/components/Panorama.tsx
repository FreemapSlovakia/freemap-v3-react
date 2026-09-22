import { closeTool } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { BreakpointsProvider } from '@shared/components/BreakpointsProvider.js';
import windowClasses from '@shared/components/FloatingWindow.module.css';
import { FloatingWindowGrips } from '@shared/components/FloatingWindowControls.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { PlaceActionsButton } from '@shared/components/PlaceActionsButton.js';
import type { ViewFromHere } from '@shared/components/ViewFromHereItems.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useFloatingWindow } from '@shared/hooks/useFloatingWindow.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { useTerrainProgress } from '@shared/hooks/useTerrainProgress.js';
import clsx from 'clsx';
import { type ReactElement, useEffect, useRef, useState } from 'react';
import { Alert, Button, Spinner } from 'react-bootstrap';
import {
  FaCrosshairs,
  FaInfoCircle,
  FaStreetView,
  FaTimes,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { type PanoramaProbe, panoramaCancel } from '../model/actions.js';
import { usePanoramaRenderData } from '../renderHolder.js';
import { usePanoramaMessages } from '../translations/usePanoramaMessages.js';
import { usePanoramaAim, usePanoramaProgress } from '../viewStore.js';
import classes from './Panorama.module.css';
import { PanoramaAbout } from './PanoramaAbout.js';
import { PanoramaControls } from './PanoramaControls.js';
import { PanoramaProbeReadout, readoutOf } from './PanoramaProbeReadout.js';
import { PanoramaView, PICKED_INK } from './PanoramaView.js';

export default function Panorama(): ReactElement {
  const m = usePanoramaMessages();

  const gm = useMessages();

  const dispatch = useDispatch();

  const { render, rendering, error, probe, viewpoint } = useAppSelector(
    (state) => state.panorama,
  );

  // Outside Redux, being four ticks a second of something only this panel
  // reads; see `viewStore`.
  const progress = usePanoramaProgress();

  // Plain, not the `meter` unit style: `general.masl` follows it and says both
  // the unit and what it is measured from.
  const nfEle = useNumberFormat({ maximumFractionDigits: 0 });

  const data = usePanoramaRenderData();

  const [showAbout, setShowAbout] = useState(false);

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

  const bar = useTerrainProgress(rendering, progress);

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
            // While a render is on, the one general line — what stage it is at
            // belongs to the spinner along the bottom, and saying the phase in
            // both places had them disagree a second apart.
            <p className="m-0 text-center text-body-secondary">
              {rendering
                ? m?.preparing
                : m?.pickHint({ icon: <FaStreetView /> })}
            </p>
          )}

          {/* What the picture answers, in two boxes rather than one: where the
              eye stands and what was last picked out of the picture are two
              places, each carrying its own menu. Clear of the close button the
              same way the grips are. The row itself passes presses through, or
              it would take a whole band of sky away from turning the view. */}
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
                    <div>
                      <FaStreetView /> {gm?.general.viewpoint}
                    </div>

                    <div>
                      {nfEle.format(render.eyeElevation)} {gm?.general.masl}
                    </div>

                    {/* Where the eye stands is a place like any other. The pin
                        rather than the render: dragged off, it is an ordinary
                        place and the two the picture answers for come back. */}
                    {viewpoint && (
                      <PlaceActionsButton
                        className="mt-1"
                        size="sm"
                        lat={viewpoint.lat}
                        lon={viewpoint.lon}
                        omit={
                          render.viewpoint.lat === viewpoint.lat &&
                          render.viewpoint.lon === viewpoint.lon
                            ? VIEWPOINT_OMIT
                            : undefined
                        }
                      />
                    )}
                  </div>
                )}
              </div>

              <MarkBox probe={probe} />
            </div>
          )}

          {/* Hidden while a render is on, the progress scrim taking the same
              corner. */}
          {render && !rendering && (
            <LongPressTooltip label={gm?.general.info}>
              {({ props }) => (
                <button
                  type="button"
                  className={clsx(
                    classes.aboutMark,
                    'position-absolute z-1 bottom-0 end-0 m-2 p-1 lh-1 rounded-circle border-0 bg-dark bg-opacity-50 text-white pe-auto',
                  )}
                  onClick={() => setShowAbout((v) => !v)}
                  {...props}
                >
                  <FaInfoCircle />
                </button>
              )}
            </LongPressTooltip>
          )}

          {/* Over the picture rather than under it: in the footer this took a
              block of the panel and pushed the picture up as it opened. It
              carries links, so it cannot be its own dismiss target — the ⓘ
              toggles it and the × closes it. */}
          {render && showAbout && (
            <div
              className={clsx(
                classes.about,
                'position-absolute z-2 top-0 bottom-0 start-0 end-0 p-3 bg-body-tertiary small',
              )}
            >
              <LongPressTooltip label={gm?.general.close}>
                {({ props }) => (
                  <button
                    type="button"
                    className="btn-close float-end ms-2"
                    onClick={() => setShowAbout(false)}
                    {...props}
                  />
                )}
              </LongPressTooltip>

              <PanoramaAbout
                depthLift={render.depthLift}
                terrain={render.attributions}
              />
            </div>
          )}

          {/* Over the picture, not above it: a row of its own takes its height
            off the view, so the picture would shrink and grow back twice per
            render. On a scrim, since it lies over whatever is on screen. */}
          {rendering && (
            <div className="position-absolute z-1 bottom-0 start-0 end-0 m-2 p-2 rounded bg-dark bg-opacity-50">
              {/* A spinner and the stage it is at, rather than a fraction: the
                  service counts only its marching, which on a slice is two
                  seconds of twelve. The seconds say as much as a bar would and
                  never stand still at the end. */}
              <div className="d-flex align-items-center gap-2">
                <Spinner animation="border" size="sm" className="text-white" />

                <span className="flex-grow-1 small text-white">
                  {bar.queued
                    ? m?.queued({ ahead: bar.queued.ahead })
                    : bar.phase === 'encoding'
                      ? m?.encoding
                      : bar.phase === 'decoding'
                        ? m?.decoding
                        : m?.rendering}{' '}
                  <span className="opacity-75">{bar.label}</span>
                </span>

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
          </div>
        </div>
      </div>
    </BreakpointsProvider>
  );
}

/**
 * What the viewpoint's menu leaves out: the picture on screen is the panorama
 * from here, and aiming it at the place it is taken from would turn it due
 * north and mark the ground at the viewer's feet.
 */
const VIEWPOINT_OMIT: ViewFromHere[] = ['panorama', 'lookAt'];

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
