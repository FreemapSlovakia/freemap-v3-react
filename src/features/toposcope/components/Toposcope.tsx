import { closeTool, selectFeature } from '@app/store/actions.js';
import { interpolateLabel } from '@features/drawing/interpolateLabel.js';
import windowClasses from '@shared/components/FloatingWindow.module.css';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useFloatingWindow } from '@shared/hooks/useFloatingWindow.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { siteNames, siteOf } from '@shared/sites.js';
import clsx from 'clsx';
import { type ReactElement, useMemo } from 'react';
import { CloseButton } from 'react-bootstrap';
import { FaArrowsAlt } from 'react-icons/fa';
import { LuMoveDiagonal2 } from 'react-icons/lu';
import { useDispatch } from 'react-redux';
import { toposcopeCenterSelector } from '../centerPoint.js';
import {
  fillRayTemplate,
  metersToFeet,
  metersToMiles,
  type RayValues,
} from '../rayTemplate.js';
import {
  bearingTo,
  distanceTo,
  formatDialLocation,
} from '../toposcopeGeometry.js';
import { setToposcopeSvg } from '../toposcopeSvgHolder.js';
import { useToposcopeMessages } from '../translations/useToposcopeMessages.js';
import classes from './Toposcope.module.css';
import { type ToposcopeRay, ToposcopeSvg } from './ToposcopeSvg.js';

/** Splits a label into lines, dropping the blank ones a stray newline leaves. */
function toLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function Toposcope(): ReactElement {
  const m = useToposcopeMessages();

  const dispatch = useDispatch();

  const center = useAppSelector(toposcopeCenterSelector);

  const inscriptions = useAppSelector((state) => state.toposcope.inscriptions);

  const points = useAppSelector((state) => state.drawingPoints.points);

  const {
    innerCircleRadius,
    outerCircleRadius,
    scale,
    preventUpturnedText,
    line1,
    line2,
  } = useAppSelector((state) => state.toposcope);

  const activeRayId = useAppSelector((state) =>
    state.main.selection?.type === 'draw-points'
      ? (state.main.selection.id ?? null)
      : null,
  );

  const nf = useNumberFormat({
    style: 'unit',
    unit: 'kilometer',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const nfEle = useNumberFormat({
    style: 'unit',
    unit: 'meter',
    maximumFractionDigits: 0,
  });

  const nfFt = useNumberFormat({
    style: 'unit',
    unit: 'foot',
    maximumFractionDigits: 0,
  });

  const nfMi = useNumberFormat({
    style: 'unit',
    unit: 'mile',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const nfAz = useNumberFormat({
    style: 'unit',
    unit: 'degree',
    // English spells the short form "78 deg"; only the narrow one is the degree
    // sign. Every other locale here writes the sign either way.
    unitDisplay: 'narrow',
    maximumFractionDigits: 0,
  });

  // Every drawn point but the centre is a ray, written on the two templates the
  // dial carries rather than on the point's own label — that label is one of the
  // things a template can name, so a converted peak reads properly with nothing
  // typed into it. Rays keep their point's index as their id, so pressing one
  // selects the right point on the map.
  const rays = useMemo((): ToposcopeRay[] => {
    if (!center) {
      return [];
    }

    return points.flatMap((point, i): ToposcopeRay[] => {
      if (i === center.index) {
        return [];
      }

      const bearing = bearingTo(center.point.coords, point.coords);

      const meters = distanceTo(center.point.coords, point.coords);

      // `Number('')` is 0, which would read as a summit at sea level.
      const rawEle = point.props?.['ele']?.trim();

      const ele = rawEle ? Number(rawEle) : Number.NaN;

      const values: RayValues = {
        label: interpolateLabel(point.label ?? '', point.props),
        elevation: Number.isFinite(ele) ? nfEle.format(ele) : undefined,
        elevation_ft: Number.isFinite(ele)
          ? nfFt.format(metersToFeet(ele))
          : undefined,
        distance: nf.format(meters / 1000),
        distance_mi: nfMi.format(metersToMiles(meters)),
        azimuth: nfAz.format(bearing),
        location: formatDialLocation(point.coords),
        props: point.props,
      };

      return [
        {
          id: i,
          bearing,
          // The first template above the ray and the second below it, each
          // keeping whatever lines its text and its values turned out to have.
          // A template that comes out empty leaves nothing on its side.
          above: toLines(fillRayTemplate(line1, values)),
          below: toLines(fillRayTemplate(line2, values)),
        },
      ];
    });
  }, [center, points, nf, nfMi, nfEle, nfFt, nfAz, line1, line2]);

  // The middle of the dial says whatever the centre point is labelled with —
  // `{location}` by default, which the picker writes when it creates the point.
  const centerLines = useMemo(
    () =>
      center
        ? toLines(
            interpolateLabel(center.point.label ?? '', {
              ...center.point.props,
              location: formatDialLocation(center.point.coords),
            }),
          )
        : [],
    [center],
  );

  const {
    boxRef,
    footerRef,
    moveHandleRef,
    resizeHandleProps,
    pos,
    width,
    height,
  } = useFloatingWindow({ storageKey: 'fm.toposcope.box' });

  // The portal the dial was made on — the same name the page title carries, so
  // an exported dial says which of the two sites drew it.
  const credit =
    m?.credit({ site: siteNames[siteOf(window.location.hostname)] }) ?? '';

  const size = Math.max(Math.min(width, height), 0);

  return (
    <div
      className={clsx(
        windowClasses.window,
        classes.toposcope,
        'm-2',
        'p-2',
        'rounded',
      )}
      ref={boxRef}
      style={pos}
    >
      <div className={windowClasses.moveHandle} ref={moveHandleRef}>
        <FaArrowsAlt />
      </div>

      <CloseButton onClick={() => dispatch(closeTool('toposcope'))} />

      <div className={classes.dial} style={{ height }}>
        {center ? (
          <ToposcopeSvg
            svgRef={setToposcopeSvg}
            width={size}
            height={size}
            rays={rays}
            centerLines={centerLines}
            inscriptions={inscriptions.map((inscription) =>
              inscription
                .replaceAll('{attribution}', m?.osmAttribution ?? '')
                .replaceAll('{credit}', credit),
            )}
            cardinals={[
              m?.cardinals.e ?? '',
              m?.cardinals.s ?? '',
              m?.cardinals.w ?? '',
              m?.cardinals.n ?? '',
            ]}
            innerCircleRadius={innerCircleRadius}
            outerCircleRadius={outerCircleRadius}
            scale={scale}
            preventUpturnedText={preventUpturnedText}
            activeRayId={activeRayId}
            onRayClick={(id) =>
              dispatch(selectFeature({ type: 'draw-points', id }))
            }
          />
        ) : (
          <p className="m-0 text-center text-body-secondary">
            {m?.pickCenterHint}
          </p>
        )}
      </div>

      {/* Only the hint: the settings and download buttons belong to the tool's
          toolbar, where the rest of its controls are. */}
      <div
        className={clsx(
          windowClasses.footer,
          'd-flex flex-wrap align-items-center gap-2 mb-1 mx-2',
        )}
        ref={footerRef}
      >
        {center && rays.length === 0 && (
          <p className="m-0 small text-body-secondary">{m?.addPointsHint}</p>
        )}
      </div>

      <div className={windowClasses.resizeHandle} {...resizeHandleProps}>
        <LuMoveDiagonal2 />
      </div>
    </div>
  );
}
