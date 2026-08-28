import { useMessages } from '@features/l10n/l10nInjector.js';
import { formatDistance } from '@shared/distanceFormatter.js';
import { elevationCoverage, elevationStats } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { ReactElement } from 'react';
import { trackEndpoints } from '../trackEndpoints.js';
import {
  isTrackLine,
  resolveActiveTrack,
  type TrackLine,
} from '../trackSelection.js';
import type { DataViewerMessages } from '../translations/DataViewerMessages.js';
import { useDataViewerMessages } from '../translations/useDataViewerMessages.js';

export function DataViewerDetails(): ReactElement | null {
  // Resolve the active track over the recorded source (its endpoint times live
  // there), then read its stats from the densified render copy when present (a
  // sparse line's straight-segment climb/descent is coarse).
  const source = useAppSelector((state) => state.trackViewer.trackGeojson);

  const render = useAppSelector(
    (state) => state.trackViewer.renderTrackGeojson,
  );

  const activeTrackIndex = useAppSelector(
    (state) => state.trackViewer.activeTrackIndex,
  );

  const active = resolveActiveTrack(source, activeTrackIndex);

  if (!active) {
    return null;
  }

  const rendered = render?.features[active.index];

  const statsFeature =
    rendered && isTrackLine(rendered) ? rendered : active.feature;

  return (
    <DataViewerDetailsInt
      feature={active.feature}
      statsFeature={statsFeature}
    />
  );
}

function DataViewerDetailsInt({
  feature,
  statsFeature,
}: {
  feature: TrackLine;
  statsFeature: TrackLine;
}): ReactElement | null {
  const m = useMessages();

  const tvm = useDataViewerMessages();

  const elevationDecision = useAppSelector(
    (state) => state.trackViewer.elevationDecision,
  );

  // Coverage of the recorded active track (not the densified render copy) to
  // distinguish complete from partial recorded elevation in the source row.
  const elevationCov = elevationCoverage([feature]);

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

  const tableData: [keyof DataViewerMessages['details'], string][] = [];

  const endpoints = trackEndpoints(feature);

  const startTime = endpoints?.startTime;

  const finishTime = endpoints?.finishTime;

  if (startTime) {
    tableData.push(['startTime', timeFormat.format(startTime)]);
  }

  if (finishTime) {
    tableData.push(['finishTime', timeFormat.format(finishTime)]);
  }

  let duration = 0;

  if (startTime && finishTime && m) {
    duration = (finishTime.getTime() - startTime.getTime()) / 1000;

    const hours = Math.floor(duration / 3600);

    const minutes = Math.floor((duration - hours * 3600) / 60);

    tableData.push([
      'duration',
      tvm?.details.durationValue({ h: hours, m: minutes }) ?? '',
    ]);
  }

  if (endpoints) {
    const { length } = endpoints;

    tableData.push(['distance', formatDistance(length, language)]);

    if (duration) {
      const avgSpeed = (length / duration) * 3.6;

      tableData.push([
        'avgSpeed',
        `${oneDecimalDigitNumberFormat.format(avgSpeed)} km/h`,
      ]);
    }
  }

  const { minEle, maxEle, ascent, descent } = elevationStats(
    statsFeature.geometry,
  );

  if (minEle !== null) {
    tableData.push([
      'minEle',
      `${noDecimalDigitsNumberFormat.format(minEle)} ${m?.general.masl}`,
    ]);
  }

  if (maxEle !== null) {
    tableData.push([
      'maxEle',
      `${noDecimalDigitsNumberFormat.format(maxEle)} ${m?.general.masl}`,
    ]);
  }

  tableData.push(['uphill', `${noDecimalDigitsNumberFormat.format(ascent)} m`]);

  tableData.push([
    'downhill',
    `${noDecimalDigitsNumberFormat.format(descent)} m`,
  ]);

  if (elevationCov !== 'none') {
    // 'missing' keeps the recorded values and only fills gaps from the model, so
    // it's a mix — distinct from a full 'all' overwrite.
    const sourceValue =
      elevationDecision === 'all'
        ? tvm?.details.sourceFilled
        : elevationDecision === 'missing'
          ? tvm?.details.sourceFilledGaps
          : elevationCov === 'partial'
            ? tvm?.details.sourcePartial
            : tvm?.details.sourceOriginal;

    tableData.push(['source', sourceValue ?? '']);
  }

  return (
    <dl className="m-0 dl-horizontal">
      {tableData.map(([key, value]) => [
        <dt key={`${key}-dt`}>{`${tvm?.details[key] ?? ''}:`}</dt>,

        <dd key={`${key}-dd`} className="infoValue">
          {value}
        </dd>,
      ])}
    </dl>
  );
}
