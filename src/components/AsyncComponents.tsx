import { AsyncLoadingIndicator } from 'fm3/components/AsyncLoadingIndicator';
import { lazy, ReactElement, Suspense, useEffect, useState } from 'react';

type ShowProps = { show: boolean };

// this hook is to prevent loading hidden components (modals)
// we could render async component conditionaly but this would break fade-out animation of closing dialogs
function useShow(show: boolean) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (show) {
      setShown(true);
    } else {
      // this is to get rid of modal state after closing (and fade-out animation)
      const t = setTimeout(() => {
        setShown(false);
      }, 1000);
      return () => {
        clearTimeout(t);
      };
    }
  }, [show]);

  return show || shown || null;
}

const LoginModal = lazy(() =>
  import(
    /* webpackChunkName: "loginModal" */ 'fm3/components/LoginModal'
  ).then(({ LoginModal }) => ({ default: LoginModal })),
);

export const AsyncLoginModal = ({ show }: ShowProps): ReactElement => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <LoginModal show={show} />
  </Suspense>
);

const ElevationChart = lazy(() =>
  import(
    /* webpackChunkName: "elevationChart" */ 'fm3/components/ElevationChart'
  ).then(({ ElevationChart }) => ({ default: ElevationChart })),
);

export const AsyncElevationChart = (): ReactElement => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <ElevationChart />
  </Suspense>
);

const ExportGpxModal = lazy(() =>
  import(
    /* webpackChunkName: "exportGpxModal" */ 'fm3/components/ExportGpxModal'
  ).then(({ ExportGpxModal }) => ({ default: ExportGpxModal })),
);

export const AsyncExportGpxModal = ({ show }: ShowProps): ReactElement => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <ExportGpxModal show={show} />
  </Suspense>
);

const ExportPdfModal = lazy(() =>
  import(
    /* webpackChunkName: "exportPdfModal" */ 'fm3/components/ExportPdfModal'
  ).then(({ ExportPdfModal }) => ({ default: ExportPdfModal })),
);

export const AsyncExportPdfModal = ({ show }: ShowProps): ReactElement => (
  <Suspense fallback={<AsyncLoadingIndicator />}>
    <ExportPdfModal show={show} />
  </Suspense>
);

const LegendModal = lazy(() =>
  import(
    /* webpackChunkName: "legendModal" */ 'fm3/components/LegendModal'
  ).then(({ LegendModal }) => ({ default: LegendModal })),
);

export function AsyncLegendModal({ show }: ShowProps): ReactElement | null {
  return (
    useShow(show) && (
      <Suspense fallback={<AsyncLoadingIndicator />}>
        <LegendModal show={show} />
      </Suspense>
    )
  );
}

const LegendOutdoorModal = lazy(() =>
  import(
    /* webpackChunkName: "legendOutdoorModal" */ 'fm3/components/LegendOutdoorModal'
  ).then(({ LegendOutdoorModal }) => ({ default: LegendOutdoorModal })),
);

export const AsyncLegendOutdoorModal = ({
  show,
}: ShowProps): ReactElement | null =>
  useShow(show) && (
    <Suspense fallback={<AsyncLoadingIndicator />}>
      <LegendOutdoorModal show={show} />
    </Suspense>
  );

const EmbedMapModal = lazy(() =>
  import(
    /* webpackChunkName: "embedMapModal" */ 'fm3/components/EmbedMapModal'
  ).then(({ EmbedMapModal }) => ({ default: EmbedMapModal })),
);

export const AsyncEmbedMapModal = ({ show }: ShowProps): ReactElement | null =>
  useShow(show) && (
    <Suspense fallback={<AsyncLoadingIndicator />}>
      <EmbedMapModal show={show} />
    </Suspense>
  );

const TipsModal = lazy(() =>
  import(
    /* webpackChunkName: "tipsModal" */ 'fm3/components/TipsModal'
  ).then(({ TipsModal }) => ({ default: TipsModal })),
);

export const AsyncTipsModal = ({ show }: ShowProps): ReactElement | null =>
  useShow(show) && (
    <Suspense fallback={<AsyncLoadingIndicator />}>
      <TipsModal show={show} />
    </Suspense>
  );

const AboutModal = lazy(() =>
  import(
    /* webpackChunkName: "aboutModal" */ 'fm3/components/AboutModal'
  ).then(({ AboutModal }) => ({ default: AboutModal })),
);

export const AsyncAboutModal = ({ show }: ShowProps): ReactElement | null =>
  useShow(show) && (
    <Suspense fallback={<AsyncLoadingIndicator />}>
      <AboutModal show={show} />
    </Suspense>
  );

const SupportUsModal = lazy(() =>
  import(
    /* webpackChunkName: "supportUsModal" */ 'fm3/components/SupportUsModal'
  ).then(({ SupportUsModal }) => ({ default: SupportUsModal })),
);

export function AsyncSupportUsModal({ show }: ShowProps): ReactElement | null {
  return (
    useShow(show) && (
      <Suspense fallback={<AsyncLoadingIndicator />}>
        <SupportUsModal show={show} />
      </Suspense>
    )
  );
}

const GalleryUploadModal = lazy(() =>
  import(
    /* webpackChunkName: "galleryUploadModal" */ 'fm3/components/gallery/GalleryUploadModal'
  ).then(({ GalleryUploadModal }) => ({ default: GalleryUploadModal })),
);

export const AsyncGalleryUploadModal = ({
  show,
}: ShowProps): ReactElement | null =>
  useShow(show) && (
    <Suspense fallback={<AsyncLoadingIndicator />}>
      <GalleryUploadModal show={show} />
    </Suspense>
  );

const GalleryViewerModal = lazy(() =>
  import(
    /* webpackChunkName: "galleryViewerModal" */ 'fm3/components/gallery/GalleryViewerModal'
  ).then(({ GalleryViewerModal }) => ({ default: GalleryViewerModal })),
);

export const AsyncGalleryViewerModal = ({
  show,
}: ShowProps): ReactElement | null =>
  useShow(show) && (
    <Suspense fallback={<AsyncLoadingIndicator />}>
      <GalleryViewerModal show={show} />
    </Suspense>
  );

const GalleryFilterModal = lazy(() =>
  import(
    /* webpackChunkName: "galleryFilterModal" */ 'fm3/components/gallery/GalleryFilterModal'
  ).then(({ GalleryFilterModal }) => ({ default: GalleryFilterModal })),
);

export const AsyncGalleryFilterModal = ({
  show,
}: ShowProps): ReactElement | null =>
  useShow(show) && (
    <Suspense fallback={<AsyncLoadingIndicator />}>
      <GalleryFilterModal show={show} />
    </Suspense>
  );

const TrackingModal = lazy(() =>
  import(
    /* webpackChunkName: "trackingModal" */ 'fm3/components/tracking/TrackingModal'
  ).then(({ TrackingModal }) => ({ default: TrackingModal })),
);

export const AsyncTrackingModal = ({ show }: ShowProps): ReactElement | null =>
  useShow(show) && (
    <Suspense fallback={<AsyncLoadingIndicator />}>
      <TrackingModal show={show} />
    </Suspense>
  );

const DrawingEditLabelModal = lazy(() =>
  import(
    /* webpackChunkName: "drawingEditLabelModal" */ 'fm3/components/DrawingEditLabelModal'
  ).then(({ DrawingEditLabelModal }) => ({ default: DrawingEditLabelModal })),
);

export const AsyncDrawingEditLabelModal = ({
  show,
}: ShowProps): ReactElement | null =>
  useShow(show) && (
    <Suspense fallback={<AsyncLoadingIndicator />}>
      <DrawingEditLabelModal show={show} />
    </Suspense>
  );

const TrackViewerUploadModal = lazy(() =>
  import(
    /* webpackChunkName: "trackViewerUploadModal" */ 'fm3/components/TrackViewerUploadModal'
  ).then(({ TrackViewerUploadModal }) => ({ default: TrackViewerUploadModal })),
);

export const AsyncTrackViewerUploadModal = ({
  show,
}: ShowProps): ReactElement | null =>
  useShow(show) && (
    <Suspense fallback={<AsyncLoadingIndicator />}>
      <TrackViewerUploadModal show={show} />
    </Suspense>
  );

const SettingsModal = lazy(() =>
  import(
    /* webpackChunkName: "settingsModal" */ 'fm3/components/SettingsModal'
  ).then(({ SettingsModal }) => ({ default: SettingsModal })),
);

export const AsyncSettingsModal = ({ show }: ShowProps): ReactElement | null =>
  useShow(show) && (
    <Suspense fallback={<AsyncLoadingIndicator />}>
      <SettingsModal show={show} />
    </Suspense>
  );
