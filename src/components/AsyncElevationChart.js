import React, { lazy, Suspense } from 'react';
import AsyncLoadingIndicator from 'fm3/components/AsyncLoadingIndicator';

const ElevationChart = lazy(() => import(/* webpackChunkName: "elevationChart" */ 'fm3/components/ElevationChart'));

export default function AsyncElevationChart() {
  return (
    <Suspense fallback={<AsyncLoadingIndicator />}>
      <ElevationChart />
    </Suspense>
  );
}
