import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { usePersistentState } from '@shared/hooks/usePersistentState.js';
import { isInvalidInt } from '@shared/numberValidator.js';
import storage from 'local-storage-fallback';
import {
  ChangeEvent,
  type ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button, Form, InputGroup, Modal, ToggleButton } from 'react-bootstrap';
import { FaClipboard, FaCode, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import z from 'zod';
import { setActiveModal } from '../store/actions.js';
import { useEmbedMessages } from './embedMapModal/translations/useEmbedMessages.js';

type Props = { show: boolean };

const FEATURES_STORAGE_KEY = 'fm.embedMap.features';

const FeatureSchema = z.enum(['search', 'mapSwitch', 'locateMe']);

type Feature = z.infer<typeof FeatureSchema>;

function identity<T>(value: T): T {
  return value;
}

const toWidth = (value: string | null) => value ?? '640';

const toHeight = (value: string | null) => value ?? '480';

export default function EmbedMapModal({ show }: Props): ReactElement {
  const m = useMessages();

  const lm = useEmbedMessages();

  const dispatch = useDispatch();

  const [width, , setWidth] = usePersistentState<string>(
    'fm.embedMap.width',
    identity,
    toWidth,
  );

  const [height, , setHeight] = usePersistentState<string>(
    'fm.embedMap.height',
    identity,
    toHeight,
  );

  const [features, setFeatures] = useState(() => {
    const features = storage.getItem(FEATURES_STORAGE_KEY);

    if (!features) {
      return new Set(FeatureSchema.options);
    }

    const set = new Set<Feature>();

    for (const feature of features.split(',')) {
      const f = FeatureSchema.safeParse(feature);

      if (f.success) {
        set.add(f.data);
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
    <Modal
      show={show}
      onHide={close}
      className="dynamic"
      contentClassName="bg-body-tertiary"
    >
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
          <Form.Label className="required">{lm?.dimensions}</Form.Label>

          <div className="d-flex gap-2">
            <InputGroup>
              <InputGroup.Text>{lm?.width}</InputGroup.Text>

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
            </InputGroup>

            <InputGroup>
              <InputGroup.Text>{lm?.height}</InputGroup.Text>

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
          </div>
        </Form.Group>

        <Form.Label className="d-block">{lm?.enableFeatures}</Form.Label>

        <div className="d-flex flex-wrap gap-2">
          <ToggleButton
            id="enableSearch"
            type="checkbox"
            variant="outline-primary"
            value="search"
            checked={features.has('search')}
            onChange={handleFeaturesChange}
          >
            {lm?.enableSearch}
          </ToggleButton>

          <ToggleButton
            id="enableMapSwitch"
            type="checkbox"
            variant="outline-primary"
            value="mapSwitch"
            checked={features.has('mapSwitch')}
            onChange={handleFeaturesChange}
          >
            {lm?.enableMapSwitch}
          </ToggleButton>

          <ToggleButton
            id="enableLocateMe"
            type="checkbox"
            variant="outline-primary"
            value="locateMe"
            checked={features.has('locateMe')}
            onChange={handleFeaturesChange}
          >
            {lm?.enableLocateMe}
          </ToggleButton>
        </div>

        <hr />

        <Form.Label>{lm?.code}</Form.Label>

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
            <Form.Label>{lm?.example}</Form.Label>

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
