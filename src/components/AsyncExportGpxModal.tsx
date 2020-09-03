import React, { lazy, Suspense } from 'react';
import { AsyncLoadingIndicator } from 'fm3/components/AsyncLoadingIndicator';

const ExportGpxModal = lazy(() =>
  import(
    /* webpackChunkName: "legendModal" */ 'fm3/components/ExportGpxModal'
  ).then(({ ExportGpxModal }) => ({ default: ExportGpxModal })),
);

export const AsyncExportGpxModal: React.FC = () => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <ExportGpxModal />
  </Suspense>
);
