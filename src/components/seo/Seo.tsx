import { lazy, ReactElement, Suspense } from 'react';
import { AsyncLoadingIndicator } from '../AsyncLoadingIndicator';

const HikingIndex = lazy(() =>
  import(/* webpackChunkName: "HikingIndex" */ './HikingIndex').then(
    ({ HikingIndex }) => ({ default: HikingIndex }),
  ),
);

const BicycleIndex = lazy(() =>
  import(/* webpackChunkName: "BicycleIndex" */ './BicycleIndex').then(
    ({ BicycleIndex }) => ({ default: BicycleIndex }),
  ),
);

export function Seo(): ReactElement {
  return (
    <Suspense fallback={<AsyncLoadingIndicator />}>
      {1 === 1 + 1 ? <BicycleIndex /> : <HikingIndex />}
    </Suspense>
  );
}
