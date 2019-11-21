import React, { lazy, Suspense } from 'react';
import { AsyncLoadingIndicator } from 'fm3/components/AsyncLoadingIndicator';

const GalleryUploadModal = lazy(() =>
  import(
    /* webpackChunkName: "galleryUploadModal" */ 'fm3/components/gallery/GalleryUploadModal'
  ).then(({ GalleryUploadModal }) => ({ default: GalleryUploadModal })),
);

export const AsyncGalleryUploadModal: React.FC = () => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <GalleryUploadModal />
  </Suspense>
);
