import React, {
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import InputGroup from 'react-bootstrap/lib/InputGroup';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';

import { setActiveModal } from 'fm3/actions/mainActions';
import { useTranslator } from 'fm3/l10nInjector';

export function EmbedMapModal(): ReactElement {
  const t = useTranslator();

  const dispatch = useDispatch();

  const [width, setWidth] = useState('500');

  const [height, setHeight] = useState('300');

  const [enableSearch, setEnableSearch] = useState(true);

  const [enableMapSwitch, setEnableMapSwitch] = useState(true);

  const [enableLocateMe, setEnableLocateMe] = useState(true);

  const getEmbedFeatures = useCallback(
    () =>
      [
        enableSearch && 'search',
        !enableMapSwitch && 'noMapSwitch',
        !enableLocateMe && 'noLocateMe',
      ].filter((x) => x) as string[],
    [enableLocateMe, enableMapSwitch, enableSearch],
  );

  const getUrl = useCallback(
    (url: string) => {
      const embedFeatures = getEmbedFeatures();

      return `${url.replace(/&(show|embed)=[^&]*/, '')}${
        embedFeatures.length ? `&embed=${embedFeatures.join(',')}` : ''
      }`;
    },
    [getEmbedFeatures],
  );

  const [url, setUrl] = useState(getUrl(window.location.href));

  const [iframeUrl] = useState(getUrl(window.location.href));

  const iframe = useRef<HTMLIFrameElement | null>(null);

  const textarea = useRef<HTMLInputElement | null>(null);

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

  const setFormControl = (ta: HTMLInputElement | null): void => {
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

  return (
    <Modal show onHide={close} className="dynamic">
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="code" /> {t('more.embedMap')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormGroup style={{ maxWidth: '542px' }}>
          <ControlLabel>{t('embed.dimensions')}</ControlLabel>
          <InputGroup>
            <InputGroup.Addon>{t('embed.width')}</InputGroup.Addon>
            <FormControl
              type="number"
              value={width}
              min={100}
              max={1600}
              step={10}
              required
              onChange={({ target }) => {
                setWidth((target as HTMLInputElement).value);
              }}
            />
            <InputGroup.Addon>{t('embed.height')}</InputGroup.Addon>
            <FormControl
              type="number"
              value={height}
              min={100}
              max={1200}
              step={10}
              required
              onChange={({ target }) => {
                setHeight((target as HTMLInputElement).value);
              }}
            />
          </InputGroup>
        </FormGroup>

        <strong>{t('embed.enableFeatures')}</strong>
        <Checkbox
          onChange={({ target }) => {
            setEnableSearch((target as HTMLInputElement).checked);
          }}
          checked={enableSearch}
        >
          {t('embed.enableSearch')}
        </Checkbox>
        <Checkbox
          onChange={({ target }) => {
            setEnableMapSwitch((target as HTMLInputElement).checked);
          }}
          checked={enableMapSwitch}
        >
          {t('embed.enableMapSwitch')}
        </Checkbox>
        <Checkbox
          onChange={({ target }) => {
            setEnableLocateMe((target as HTMLInputElement).checked);
          }}
          checked={enableLocateMe}
        >
          {t('embed.enableLocateMe')}
        </Checkbox>
        <hr />
        <p>{t('embed.code')}</p>
        <FormControl
          inputRef={setFormControl}
          componentClass="textarea"
          value={`<iframe src="${url}" style="width: ${width}px; height: ${height}px; border: 0" allowfullscreen></iframe>`}
          readOnly
          rows={3}
        />
        <br />
        <p>{t('embed.example')}</p>
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
            ref={iframe}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleCopyClick}>
          <Glyphicon glyph="copy" /> {t('general.copyCode')}
        </Button>{' '}
        <Button onClick={close}>
          <Glyphicon glyph="remove" /> {t('general.close')} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
