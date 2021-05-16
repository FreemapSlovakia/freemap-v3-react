import { setActiveModal } from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import FormCheck from 'react-bootstrap/FormCheck';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import { FaClipboard, FaCode, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

type Props = { show: boolean };

export function EmbedMapModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const [width, setWidth] = useState('640');

  const [height, setHeight] = useState('480');

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

  return (
    <Modal show={show} onHide={close} className="dynamic">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCode /> {m?.mainMenu.embedMap}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormGroup style={{ maxWidth: '542px' }}>
          <FormLabel>{m?.embed.dimensions}</FormLabel>
          <InputGroup>
            <InputGroup.Append>
              <InputGroup.Text>{m?.embed.width}</InputGroup.Text>
            </InputGroup.Append>
            <FormControl
              type="number"
              value={width}
              min={100}
              max={1600}
              step={10}
              required
              onChange={({ currentTarget }) => {
                setWidth(currentTarget.value);
              }}
            />
            <InputGroup.Append>
              <InputGroup.Text>{m?.embed.height}</InputGroup.Text>
            </InputGroup.Append>
            <FormControl
              type="number"
              value={height}
              min={100}
              max={1200}
              step={10}
              required
              onChange={({ currentTarget }) => {
                setHeight(currentTarget.value);
              }}
            />
          </InputGroup>
        </FormGroup>

        <strong>{m?.embed.enableFeatures}</strong>
        <FormCheck
          id="enableSearch"
          type="checkbox"
          onChange={({ currentTarget }) => {
            setEnableSearch(currentTarget.checked);
          }}
          checked={enableSearch}
          label={m?.embed.enableSearch}
        />
        <FormCheck
          id="enableMapSwitch"
          type="checkbox"
          onChange={({ currentTarget }) => {
            setEnableMapSwitch(currentTarget.checked);
          }}
          checked={enableMapSwitch}
          label={m?.embed.enableMapSwitch}
        />
        <FormCheck
          id="enableLocateMe"
          type="checkbox"
          onChange={({ currentTarget }) => {
            setEnableLocateMe(currentTarget.checked);
          }}
          checked={enableLocateMe}
          label={m?.embed.enableLocateMe}
        />
        <hr />
        <p>{m?.embed.code}</p>
        <FormControl
          ref={setFormControl}
          as="textarea"
          value={`<iframe src="${url}" style="width: ${width}px; height: ${height}px; border: 0" allowfullscreen></iframe>`}
          readOnly
          rows={3}
        />
        <br />
        <p>{m?.embed.example}</p>
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
          <FaClipboard /> {m?.general.copyCode}
        </Button>{' '}
        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
