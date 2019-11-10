import React, { lazy, Suspense } from 'react';
import { AsyncLoadingIndicator } from 'fm3/components/AsyncLoadingIndicator';

const LegendModal = lazy(() =>
  import(/* webpackChunkName: "legendModal" */ 'fm3/components/LegendModal'),
);

export const AsyncLegendModal: React.FC = () => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <LegendModal />
  </Suspense>
);
