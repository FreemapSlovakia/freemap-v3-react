import type { ElevationInfoBaseProps } from '@features/elevationChart/components/ElevationInfo.js';
import type { JSX } from 'react';

export type MeasurementMessages = {
  elevationFetchError: (props: { err: unknown }) => string;
  elevationInfo: (props: ElevationInfoBaseProps) => JSX.Element;
  areaInfo: (props: { area: number; perimeter: number }) => JSX.Element;
  distanceInfo: (props: { length: number }) => JSX.Element;
};
