import { useMessages } from '@features/l10n/l10nInjector.js';
import { smoothElevations } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { distance } from '@turf/distance';
import { Geometry } from 'geojson';
import type { ReactElement } from 'react';
import { formatDistance } from '../../../shared/distanceFormatter.js';
import { Messages } from '../../../translations/messagesInterface.js';
import { useStartFinishPoints } from '../hooks/useStartFinishPoints.js';

export function TrackViewerDetails(): ReactElement | null {
  const trackGeojson = useAppSelector(
    (state) => state.trackViewer.trackGeojson,
  );

  return trackGeojson ? (
    <TrackViewerDetailsInt geometry={trackGeojson.features[0].geometry} />
  ) : null;
}

export function TrackViewerDetailsInt({
  geometry,
}: {
  geometry: Geometry;
}): ReactElement | null {
  const m = useMessages();

  const [startPoints, finishPoints] = useStartFinishPoints();

  const eleSmoothingFactor = 5;

  const language = useAppSelector((state) => state.l10n.language);

  const oneDecimalDigitNumberFormat = useNumberFormat({
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const noDecimalDigitsNumberFormat = useNumberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const timeFormat = useDateTimeFormat({
    hour: 'numeric',
    minute: '2-digit',
  });

  const tableData: [keyof Messages['trackViewer']['details'], string][] = [];

  let startTime: Date | undefined;

  let finishTime: Date | undefined;

  if (startPoints.length) {
    startTime = startPoints[0].startTime;

    if (startTime) {
      tableData.push(['startTime', timeFormat.format(startTime)]);
    }
  }

  if (finishPoints.length) {
    finishTime = finishPoints[0].finishTime;

    if (finishTime) {
      tableData.push(['finishTime', timeFormat.format(finishTime)]);
    }
  }

  let duration = 0;

  if (startTime && finishTime && m) {
    duration = (finishTime.getTime() - startTime.getTime()) / 1000;

    const hours = Math.floor(duration / 3600);

    const minutes = Math.floor((duration - hours * 3600) / 60);

    tableData.push([
      'duration',
      m.trackViewer.details.durationValue({ h: hours, m: minutes }),
    ]);
  }

  if (finishPoints.length) {
    const { length } = finishPoints[0];

    tableData.push(['distance', formatDistance(length, language)]);

    if (duration) {
      const avgSpeed = (length / duration) * 3.6;

      tableData.push([
        'avgSpeed',
        `${oneDecimalDigitNumberFormat.format(avgSpeed)} km/h`,
      ]);
    }
  }

  if (geometry.type !== 'LineString') {
    return null; // TODO log error?
  }

  let minEle = Infinity;

  let maxEle = -Infinity;

  let uphillEleSum = 0;

  let downhillEleSum = 0;

  const smoothed = smoothElevations(geometry.coordinates, eleSmoothingFactor);

  let [prevCoord] = smoothed;

  for (const coord of smoothed) {
    const distanceFromPrevPointInMeters = distance(coord, prevCoord, {
      units: 'meters',
    });

    if (10 * eleSmoothingFactor < distanceFromPrevPointInMeters) {
      // otherwise the ele sums are very high
      const ele = coord[2];

      if (ele < minEle) {
        minEle = ele;
      }

      if (maxEle < ele) {
        maxEle = ele;
      }

      const eleDiff = ele - prevCoord[2];

      if (eleDiff < 0) {
        downhillEleSum += eleDiff * -1;
      } else if (eleDiff > 0) {
        uphillEleSum += eleDiff;
      }

      prevCoord = coord;
    }
  }

  if (minEle !== Infinity) {
    tableData.push([
      'minEle',
      `${noDecimalDigitsNumberFormat.format(minEle)} ${m?.general.masl}`,
    ]);
  }

  if (maxEle !== -Infinity) {
    tableData.push([
      'maxEle',
      `${noDecimalDigitsNumberFormat.format(maxEle)} ${m?.general.masl}`,
    ]);
  }

  tableData.push([
    'uphill',
    `${noDecimalDigitsNumberFormat.format(uphillEleSum)} m`,
  ]);

  tableData.push([
    'downhill',
    `${noDecimalDigitsNumberFormat.format(downhillEleSum)} m`,
  ]);

  return (
    <dl className="m-0 dl-horizontal">
      {tableData.map(([key, value]) => [
        <dt key={`${key}-dt`}>{(m?.trackViewer.details[key] ?? '') + ':'}</dt>,

        <dd key={`${key}-dd`} className="infoValue">
          {value}
        </dd>,
      ])}
    </dl>
  );
}
