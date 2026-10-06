import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  FmDismissButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { Icon } from 'leaflet';
import { type ReactElement, useCallback, useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { createRoot } from 'react-dom/client';
import { FaExternalLinkAlt, FaWikipediaW } from 'react-icons/fa';
import { Marker, Pane, Tooltip } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import {
  type WikiPreview,
  wikiLoadPreview,
  wikiSetPreview,
} from '../model/actions.js';
import classes from './WikiLayer.module.css';

class WikiIcon extends Icon {
  static template: ChildNode | undefined;

  createIcon(oldIcon?: HTMLElement) {
    const reuse = oldIcon && oldIcon.tagName === 'DIV';

    const div = oldIcon && reuse ? oldIcon : document.createElement('div');

    // Leaflet's Icon._setIconStyles is an untyped internal method.
    (this as any)._setIconStyles(div, 'icon');

    if (WikiIcon.template) {
      div.appendChild(WikiIcon.template.cloneNode(true));
    } else {
      const root = createRoot(div);

      root.render(<FaWikipediaW />);

      WikiIcon.template = div.childNodes.item(0);
    }

    return div;
  }

  createShadow(oldIcon?: HTMLElement) {
    return oldIcon ?? document.createElement('div');
  }
}

const wikiIcon = new WikiIcon({
  className: classes.wikiIcon,
  iconUrl: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -9],
  tooltipAnchor: [0, -9],
});

export function WikiLayer(): ReactElement {
  const m = useMessages();

  const points = useAppSelector((state) => state.wiki.points);

  const preview = useAppSelector((state) => state.wiki.preview);

  const loading = useAppSelector((state) => state.wiki.loading);

  const opacity = useAppSelector(
    (state) => state.map.layerSetups['w']?.opacity ?? 1,
  );

  const dispatch = useDispatch();

  // `Pane` reads its style once; set anew, it would remount every marker.
  const [pane, setPane] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (pane) {
      pane.style.opacity = String(opacity);
    }
  }, [pane, opacity]);

  const [memPreview, setMemPreview] = useState<WikiPreview>();

  useEffect(() => {
    if (preview) {
      setMemPreview(preview);
    } else {
      const ref = window.setTimeout(() => {
        setMemPreview(undefined);
      }, 500);

      return () => {
        window.clearTimeout(ref);
      };
    }
  }, [preview]);

  const effPreview = preview ?? memPreview;

  const close = useCallback(() => {
    dispatch(wikiSetPreview(null));
  }, [dispatch]);

  return (
    <>
      <Modal
        scrollable
        show={loading !== null || preview !== null}
        onHide={close}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaWikipediaW />{' '}
            <a
              href={
                effPreview
                  ? `https://${effPreview.lang}.wikipedia.org/wiki/${effPreview.langTitle}`
                  : loading?.replace(
                      /(.*):(.*)/,
                      'https://$1.wikipedia.org/wiki/$2',
                    )
              }
              target="wikipedia"
            >
              {effPreview ? effPreview.title : loading?.replace(/.*:/, '')}{' '}
              <FaExternalLinkAlt />
            </a>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {effPreview ? (
            <>
              {effPreview.thumbnail && (
                <img
                  src={effPreview.thumbnail.source}
                  width={effPreview.thumbnail.width}
                  height={effPreview.thumbnail.height}
                  alt={effPreview.title}
                />
              )}
              <div dangerouslySetInnerHTML={{ __html: effPreview.extract }} />
            </>
          ) : (
            m?.general.loading
          )}
        </Modal.Body>

        <FmModalFooter>
          <FmDismissButton label={m?.general.close} onClick={close} />
        </FmModalFooter>
      </Modal>

      <Pane name="wiki" ref={setPane}>
        {points.map(({ id, lat, lon, name, wikipedia }) => (
          <Marker
            key={id}
            position={{ lat, lng: lon }}
            icon={wikiIcon}
            eventHandlers={{
              click() {
                dispatch(wikiLoadPreview(wikipedia));
              },
            }}
          >
            {(wikipedia || name) && (
              <Tooltip className="compact" direction="top" permanent>
                <div
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 150,
                  }}
                >
                  {wikipedia.replace(/^[a-z]+:/, '') || name}
                </div>
              </Tooltip>
            )}
          </Marker>
        ))}
      </Pane>
    </>
  );
}
