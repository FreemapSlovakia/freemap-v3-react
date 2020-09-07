import React, { lazy, Suspense } from 'react';
import { AsyncLoadingIndicator } from 'fm3/components/AsyncLoadingIndicator';

const ExportPdfModal = lazy(() =>
  import(
    /* webpackChunkName: "exportPdfModal" */ 'fm3/components/ExportPdfModal'
  ).then(({ ExportPdfModal }) => ({ default: ExportPdfModal })),
);

export const AsyncExportPdfModal: React.FC = () => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <ExportPdfModal />
  </Suspense>
);
