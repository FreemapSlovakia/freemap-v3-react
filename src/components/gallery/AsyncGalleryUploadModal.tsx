import React, { lazy, Suspense } from 'react';
import AsyncLoadingIndicator from 'fm3/components/AsyncLoadingIndicator';

const GalleryUploadModal = lazy(() =>
  import(
    /* webpackChunkName: "galleryUploadModal" */ 'fm3/components/gallery/GalleryUploadModal'
  ),
);

export default function AsyncGalleryUploadModal() {
  return (
    <Suspense fallback={<AsyncLoadingIndicator />}>
      <GalleryUploadModal />
    </Suspense>
  );
}
