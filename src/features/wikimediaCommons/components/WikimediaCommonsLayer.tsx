import { useMessages } from '@features/l10n/l10nInjector.js';
import { OpenInExternalAppMenuButton } from '@features/openInExternalApp/components/OpenInExternalAppMenuButton.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { Icon } from 'leaflet';
import { type ReactElement, useCallback, useMemo } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaExternalLinkAlt, FaTimes } from 'react-icons/fa';
import { SiWikimediacommons } from 'react-icons/si';
import { Marker, Pane } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import {
  wikimediaCommonsLoadPreview,
  wikimediaCommonsSetPreview,
} from '../model/actions.js';
import './wikimediaCommons.scss';

const ICON_SIZE = 40;

function makeIcon(thumbUrl: string): Icon {
  return new Icon({
    iconUrl: thumbUrl,
    iconSize: [ICON_SIZE, ICON_SIZE],
    iconAnchor: [ICON_SIZE / 2, ICON_SIZE / 2],
    popupAnchor: [0, -ICON_SIZE / 2],
    tooltipAnchor: [0, -ICON_SIZE / 2],
    className: 'leaflet-marker-wm-photo-icon',
  });
}

export function WikimediaCommonsLayer(): ReactElement {
  const m = useMessages();

  const photos = useAppSelector((state) => state.wikimediaCommons.photos);

  const preview = useAppSelector((state) => state.wikimediaCommons.preview);

  const loading = useAppSelector((state) => state.wikimediaCommons.loading);

  const opacity = useAppSelector(
    (state) => state.map.layersSettings['M']?.opacity ?? 1,
  );

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(wikimediaCommonsSetPreview(null));
  }, [dispatch]);

  const icons = useMemo(() => {
    const map = new Map<string, Icon>();

    for (const p of photos) {
      if (!map.has(p.thumbUrl)) {
        map.set(p.thumbUrl, makeIcon(p.thumbUrl));
      }
    }

    return map;
  }, [photos]);

  const partial = useMemo(
    () => (loading ? photos.find((p) => p.pageId === loading) : undefined),
    [loading, photos],
  );

  const shown = preview ?? partial ?? null;

  const fileTitle = shown?.title.replace(/^File:/, '');

  return (
    <>
      <Modal
        show={loading !== null || preview !== null}
        onHide={close}
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <SiWikimediacommons /> Wikimedia Commons
            {fileTitle && (
              <>
                {' – '}
                <a
                  href={shown?.descriptionUrl ?? '#'}
                  target="commons"
                  rel="noopener noreferrer"
                >
                  {fileTitle} <FaExternalLinkAlt />
                </a>
              </>
            )}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {shown ? (
            <>
              <div
                className="wmc-image-container position-relative mx-auto"
                style={{
                  aspectRatio: `${shown.thumbWidth} / ${shown.thumbHeight}`,
                  maxWidth: `calc((100dvh - 300px) * ${shown.thumbWidth} / ${shown.thumbHeight})`,
                }}
              >
                <img
                  className="position-absolute top-0 start-0 w-100 h-100"
                  src={preview ? preview.largeThumbUrl : shown.thumbUrl}
                  alt={fileTitle ?? ''}
                />

                {shown.license &&
                  (shown.licenseUrl ? (
                    <a
                      className="wmc-license position-absolute bottom-0 end-0"
                      href={shown.licenseUrl}
                      target="license"
                      rel="noopener noreferrer"
                    >
                      {shown.license}
                    </a>
                  ) : (
                    <span className="wmc-license wmc-license-text position-absolute bottom-0 end-0">
                      {shown.license}
                    </span>
                  ))}
              </div>

              <div className="mt-3">
                {shown.artist && (
                  <>
                    {m?.wikimediaCommons.artist}: <b>{shown.artist}</b>
                  </>
                )}

                {shown.dateTime && (
                  <>
                    {shown.artist && ' ｜ '}
                    {m?.wikimediaCommons.dateTime}: <b>{shown.dateTime}</b>
                  </>
                )}

                {shown.description && (
                  <>
                    {(shown.artist || shown.dateTime) && ' ｜ '}
                    {shown.description}
                  </>
                )}
              </div>
            </>
          ) : (
            m?.general.loading
          )}
        </Modal.Body>

        <Modal.Footer>
          {shown && (
            <LongPressTooltip
              breakpoint="md"
              label={m?.gallery.viewer.openInNewWindow}
            >
              {({ label, labelClassName, props }) => (
                <OpenInExternalAppMenuButton
                  lat={shown.lat}
                  lon={shown.lon}
                  placement="top"
                  includePoint
                  pointTitle={fileTitle}
                  pointDescription={shown.description}
                  url={shown.descriptionUrl}
                  {...props}
                >
                  <FaExternalLinkAlt />
                  <span className={labelClassName}> {label}</span>
                </OpenInExternalAppMenuButton>
              )}
            </LongPressTooltip>
          )}

          <Button variant="dark" onClick={close}>
            <FaTimes /> {m?.general.close}
          </Button>
        </Modal.Footer>
      </Modal>

      <Pane name="wikimediaCommons" style={{ opacity }} key={opacity}>
        {photos.map((photo) => {
          const icon = icons.get(photo.thumbUrl);

          if (!icon) {
            return null;
          }

          return (
            <Marker
              key={photo.pageId}
              position={{ lat: photo.lat, lng: photo.lon }}
              icon={icon}
              eventHandlers={{
                click() {
                  dispatch(wikimediaCommonsLoadPreview(photo.pageId));
                },
              }}
            />
          );
        })}
      </Pane>
    </>
  );
}

export default WikimediaCommonsLayer;
