import { useMessages } from '@features/l10n/l10nInjector.js';
import storage from 'local-storage-fallback';
import {
  ChangeEvent,
  type ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Form } from 'react-bootstrap';
import { setActiveModal } from '../store/actions.js';

import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { usePersistentState } from '@shared/hooks/usePersistentState.js';
import { isInvalidInt } from '@shared/numberValidator.js';
import { Button, InputGroup, Modal } from 'react-bootstrap';
import { FaClipboard, FaCode, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { is } from 'typia';

type Props = { show: boolean };

const FEATURES_STORAGE_KEY = 'fm.embedMap.features';

const FEATURES = ['search', 'mapSwitch', 'locateMe'] as const;

type Feature = (typeof FEATURES)[number];

export default EmbedMapModal;

export function EmbedMapModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const [width, , setWidth] = usePersistentState<string>(
    'fm.embedMap.width',
    (value) => value,
    (value) => value ?? '640',
  );

  const [height, , setHeight] = usePersistentState<string>(
    'fm.embedMap.height',
    (value) => value,
    (value) => value ?? '480',
  );

  const [features, setFeatures] = useState(() => {
    const features = storage.getItem(FEATURES_STORAGE_KEY);

    if (!features) {
      return new Set(FEATURES);
    }

    const set = new Set<Feature>();

    for (const feature of features.split(',')) {
      if (is<Feature>(feature)) {
        set.add(feature);
      }
    }

    return set;
  });

  const getEmbedFeatures = useCallback(
    () =>
      [
        features.has('search') && 'search',
        !features.has('mapSwitch') && 'noMapSwitch',
        !features.has('locateMe') && 'noLocateMe',
      ].filter(Boolean) as string[],
    [features],
  );

  const getUrl = useCallback(
    (url: string) => {
      const embedFeatures = getEmbedFeatures();

      return `${url.replace(/&(show|embed|tool)=[^&]*/g, '')}${
        embedFeatures.length ? `&embed=${embedFeatures.join(',')}` : ''
      }`;
    },
    [getEmbedFeatures],
  );

  const [url, setUrl] = useState(getUrl(window.location.href));

  const [iframeUrl] = useState(getUrl(window.location.href));

  const iframe = useRef<HTMLIFrameElement | null>(null);

  const textarea = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (iframe.current?.contentWindow) {
      iframe.current.contentWindow.postMessage(
        {
          freemap: {
            action: 'setEmbedFeatures',
            payload: getEmbedFeatures(),
          },
        },
        '*',
      );
    }
  }, [getEmbedFeatures]);

  useEffect(() => {
    window.addEventListener('message', (e) => {
      const { data } = e;

      const href = iframe.current?.contentWindow?.location.href;

      if (
        href &&
        data &&
        typeof data === 'object' &&
        typeof data.freemap === 'object' &&
        data.freemap.action === 'urlUpdated' &&
        iframe.current
      ) {
        setUrl(getUrl(href));
      }
    });
  }, [getUrl]);

  const setFormControl = (ta: HTMLTextAreaElement | null): void => {
    textarea.current = ta;
  };

  const handleCopyClick = (): void => {
    if (textarea.current) {
      textarea.current.focus();

      window.setTimeout(() => {
        if (textarea.current) {
          textarea.current.setSelectionRange(0, 9999);
        }
      });

      document.execCommand('copy');
    }
  };

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const allow = ['fullscreen'];

  if (features.has('locateMe')) {
    allow.push('geolocation');
  }

  const invalidWidth = isInvalidInt(width, true, 100, 1600);

  const invalidHeight = isInvalidInt(width, true, 100, 1200);

  const cookiesEnabled = useAppSelector(
    (state) => state.cookieConsent.cookieConsentResult !== null,
  );

  const handleFeaturesChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value as Feature;

      setFeatures((prev) => {
        const next = new Set(prev);

        if (next.has(value)) {
          next.delete(value);
        } else {
          next.add(value);
        }

        if (cookiesEnabled) {
          storage.setItem(FEATURES_STORAGE_KEY, [...next].join(','));
        }

        return next;
      });
    },
    [cookiesEnabled],
  );

  return (
    <Modal show={show} onHide={close} className="dynamic">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCode /> {m?.mainMenu.embedMap}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group
          controlId="dimensions"
          className="mb-3"
          style={{ maxWidth: '542px' }}
        >
          <Form.Label className="required">{m?.embed.dimensions}</Form.Label>

          <InputGroup>
            <InputGroup.Text>{m?.embed.width}</InputGroup.Text>

            <Form.Control
              type="number"
              value={width}
              min={100}
              max={1600}
              step={10}
              isInvalid={invalidWidth}
              required
              onChange={setWidth}
            />

            <InputGroup.Text>{m?.embed.height}</InputGroup.Text>

            <Form.Control
              type="number"
              value={height}
              min={100}
              max={1200}
              step={10}
              isInvalid={invalidHeight}
              required
              onChange={setHeight}
            />
          </InputGroup>
        </Form.Group>

        <Form.Label>{m?.embed.enableFeatures}</Form.Label>

        <Form.Check
          id="enableSearch"
          type="checkbox"
          value="search"
          onChange={handleFeaturesChange}
          checked={features.has('search')}
          label={m?.embed.enableSearch}
        />

        <Form.Check
          id="enableMapSwitch"
          type="checkbox"
          value="mapSwitch"
          onChange={handleFeaturesChange}
          checked={features.has('mapSwitch')}
          label={m?.embed.enableMapSwitch}
        />

        <Form.Check
          id="enableLocateMe"
          type="checkbox"
          value="locateMe"
          onChange={handleFeaturesChange}
          checked={features.has('locateMe')}
          label={m?.embed.enableLocateMe}
        />

        <hr />

        <Form.Label>{m?.embed.code}</Form.Label>

        <Form.Control
          ref={setFormControl}
          as="textarea"
          value={
            invalidWidth || invalidHeight
              ? ''
              : `<iframe src="${url}" style="width: ${width}px; height: ${height}px; border: 0" allowfullscreen allow="${allow.join(
                  ';',
                )}"></iframe>`
          }
          readOnly
          rows={3}
          disabled={invalidWidth || invalidHeight}
        />

        {!(invalidWidth || invalidHeight) && (
          <div className="mt-3">
            <Form.Label>{m?.embed.example}</Form.Label>

            <div style={{ overflowX: 'auto' }}>
              <iframe
                title="Freemap.sk"
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  border: '0',
                  display: 'block',
                  margin: '0 auto',
                }}
                src={iframeUrl}
                allowFullScreen
                allow={allow.join(';')}
                ref={iframe}
              />
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          onClick={handleCopyClick}
          disabled={invalidWidth || invalidHeight}
        >
          <FaClipboard /> {m?.general.copyCode}
        </Button>

        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
