import React, { lazy, Suspense } from 'react';
import { AsyncLoadingIndicator } from 'fm3/components/AsyncLoadingIndicator';

const LoginModal = lazy(() =>
  import(
    /* webpackChunkName: "loginModal" */ 'fm3/components/LoginModal'
  ).then(({ LoginModal }) => ({ default: LoginModal })),
);

export const AsyncLoginModal: React.FC = () => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <LoginModal />
  </Suspense>
);

const ElevationChart = lazy(() =>
  import(
    /* webpackChunkName: "elevationChart" */ 'fm3/components/ElevationChart'
  ).then(({ ElevationChart }) => ({ default: ElevationChart })),
);

export const AsyncElevationChart: React.FC = () => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <ElevationChart />
  </Suspense>
);

const ExportGpxModal = lazy(() =>
  import(
    /* webpackChunkName: "exportGpxModal" */ 'fm3/components/ExportGpxModal'
  ).then(({ ExportGpxModal }) => ({ default: ExportGpxModal })),
);

export const AsyncExportGpxModal: React.FC = () => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <ExportGpxModal />
  </Suspense>
);

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

const LegendModal = lazy(() =>
  import(
    /* webpackChunkName: "legendModal" */ 'fm3/components/LegendModal'
  ).then(({ LegendModal }) => ({ default: LegendModal })),
);

export const AsyncLegendModal: React.FC = () => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <LegendModal />
  </Suspense>
);

const LegendOutdoorModal = lazy(() =>
  import(
    /* webpackChunkName: "legendOutdoorModal" */ 'fm3/components/LegendOutdoorModal'
  ).then(({ LegendOutdoorModal }) => ({ default: LegendOutdoorModal })),
);

export const AsyncLegendOutdoorModal: React.FC = () => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <LegendOutdoorModal />
  </Suspense>
);

const EmbedMapModal = lazy(() =>
  import(
    /* webpackChunkName: "embedMapModal" */ 'fm3/components/EmbedMapModal'
  ).then(({ EmbedMapModal }) => ({ default: EmbedMapModal })),
);

export const AsyncEmbedMapModal: React.FC = () => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <EmbedMapModal />
  </Suspense>
);

const TipsModal = lazy(() =>
  import(
    /* webpackChunkName: "tipsModal" */ 'fm3/components/TipsModal'
  ).then(({ TipsModal }) => ({ default: TipsModal })),
);

export const AsyncTipsModal: React.FC = () => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <TipsModal />
  </Suspense>
);

const AboutModal = lazy(() =>
  import(
    /* webpackChunkName: "aboutModal" */ 'fm3/components/AboutModal'
  ).then(({ AboutModal }) => ({ default: AboutModal })),
);

export const AsyncAboutModal: React.FC = () => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <AboutModal />
  </Suspense>
);

const SupportUsModal = lazy(() =>
  import(
    /* webpackChunkName: "supportUsModal" */ 'fm3/components/SupportUsModal'
  ).then(({ SupportUsModal }) => ({ default: SupportUsModal })),
);

export const AsyncSupportUsModal: React.FC = () => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <SupportUsModal />
  </Suspense>
);

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

const GalleryViewerModal = lazy(() =>
  import(
    /* webpackChunkName: "galleryViewerModal" */ 'fm3/components/gallery/GalleryViewerModal'
  ).then(({ GalleryViewerModal }) => ({ default: GalleryViewerModal })),
);

export const AsyncGalleryViewerModal: React.FC = () => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <GalleryViewerModal />
  </Suspense>
);

const GalleryFilterModal = lazy(() =>
  import(
    /* webpackChunkName: "galleryFilterModal" */ 'fm3/components/gallery/GalleryFilterModal'
  ).then(({ GalleryFilterModal }) => ({ default: GalleryFilterModal })),
);

export const AsyncGalleryFilterModal: React.FC = () => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <GalleryFilterModal />
  </Suspense>
);

const TrackingModal = lazy(() =>
  import(
    /* webpackChunkName: "trackingModal" */ 'fm3/components/tracking/TrackingModal'
  ).then(({ TrackingModal }) => ({ default: TrackingModal })),
);

export const AsyncTrackingModal: React.FC = () => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <TrackingModal />
  </Suspense>
);

const DrawingEditLabelModal = lazy(() =>
  import(
    /* webpackChunkName: "drawingEditLabelModal" */ 'fm3/components/DrawingEditLabelModal'
  ).then(({ DrawingEditLabelModal }) => ({ default: DrawingEditLabelModal })),
);

export const AsyncDrawingEditLabelModal: React.FC = () => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <DrawingEditLabelModal />
  </Suspense>
);

const TrackViewerUploadModal = lazy(() =>
  import(
    /* webpackChunkName: "trackViewerUploadModal" */ 'fm3/components/TrackViewerUploadModal'
  ).then(({ TrackViewerUploadModal }) => ({ default: TrackViewerUploadModal })),
);

export const AsyncTrackViewerUploadModal: React.FC = () => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <TrackViewerUploadModal />
  </Suspense>
);
