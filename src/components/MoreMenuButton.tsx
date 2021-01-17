import {
  authChooseLoginMethod,
  authStartLogout,
} from 'fm3/actions/authActions';
import { l10nSetChosenLanguage } from 'fm3/actions/l10nActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { tipsShow } from 'fm3/actions/tipsActions';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import tips from 'fm3/tips/index.json';
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';
import { useDispatch, useSelector } from 'react-redux';
import { OpenInExternalAppDropdownItems } from './OpenInExternalAppMenuItems';

export function MoreMenuButton(): ReactElement {
  const user = useSelector((state: RootState) => state.auth.user);

  const chosenLanguage = useSelector(
    (state: RootState) => state.l10n.chosenLanguage,
  );

  const language = useSelector((state: RootState) => state.l10n.language);

  const mapType = useSelector((state: RootState) => state.map.mapType);

  const lat = useSelector((state: RootState) => state.map.lat);

  const lon = useSelector((state: RootState) => state.map.lon);

  const zoom = useSelector((state: RootState) => state.map.zoom);

  const expertMode = useSelector((state: RootState) => state.main.expertMode);

  const [show, setShow] = useState(false);

  const [submenu, setSubmenu] = useState<string | null>(null);

  const button = useRef<HTMLButtonElement | null>(null);

  const tRef = useRef<number>();

  const handleButtonClick = useCallback(() => {
    setShow(true);

    if (tRef.current) {
      window.clearTimeout(tRef.current);

      tRef.current = undefined;
    }
  }, []);

  const close = useCallback(() => {
    setShow(false);

    // timeout because of the animation
    tRef.current = window.setTimeout(() => {
      setSubmenu(null);

      tRef.current = undefined;
    }, 1000);
  }, []);

  const dispatch = useDispatch();

  const handleLanguageClick = useCallback(
    (language: string | null) => {
      close();

      dispatch(l10nSetChosenLanguage(language));
    },
    [dispatch, close],
  );

  const handleTipSelect = useCallback(
    (tip: string | null) => {
      close();

      if (tip !== null) {
        dispatch(tipsShow(tip));
      }
    },
    [dispatch, close],
  );

  const handleBackClick = useCallback(() => {
    setSubmenu(null);
  }, []);

  const handleOpenExternally = useCallback(() => {
    setSubmenu('openExternally');
  }, []);

  const skCz = ['sk', 'cs'].includes(language);

  const m = useMessages();

  const eh = useCallback((e) => {
    if (e.code === 'Escape') {
      e.stopPropagation();
      e.preventDefault();

      setSubmenu(null);
    }
  }, []);

  useEffect(() => {
    document.body.removeEventListener('keyup', eh);

    if (submenu) {
      document.body.addEventListener('keyup', eh);
    }
  }, [eh, submenu]);

  return (
    <>
      <Button
        ref={button}
        onClick={handleButtonClick}
        title={m?.more.more}
        variant="primary"
      >
        <FontAwesomeIcon icon="bars" />
      </Button>
      <Overlay
        rootClose
        placement="bottom"
        show={show}
        onHide={close}
        target={button.current}
      >
        <Popover id="popover-trigger-click-root-close" className="fm-menu">
          <Popover.Content>
            {submenu === null ? (
              <>
                <Dropdown.Item eventKey="language" onSelect={setSubmenu}>
                  <FontAwesomeIcon icon="language" /> Language / Jazyk / Nyelv{' '}
                  <FontAwesomeIcon icon="chevron-right" />
                </Dropdown.Item>
                {user ? (
                  <Dropdown.Item
                    onSelect={() => {
                      close();
                      dispatch(authStartLogout());
                    }}
                  >
                    <FontAwesomeIcon icon="sign-out" />{' '}
                    {m?.more.logOut(user.name)}
                  </Dropdown.Item>
                ) : (
                  <Dropdown.Item
                    onSelect={() => {
                      close();
                      dispatch(authChooseLoginMethod());
                    }}
                  >
                    <FontAwesomeIcon icon="sign-in" /> {m?.more.logIn}
                  </Dropdown.Item>
                )}
                <Dropdown.Item
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('settings'));
                  }}
                >
                  <FontAwesomeIcon icon="cog" /> {m?.more.settings} <kbd>e</kbd>{' '}
                  <kbd>s</kbd>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onSelect={handleOpenExternally}>
                  <FontAwesomeIcon icon="external-link" />{' '}
                  {m?.external.openInExternal}{' '}
                  <FontAwesomeIcon icon="chevron-right" />
                </Dropdown.Item>
                <Dropdown.Item
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('export-pdf'));
                  }}
                >
                  <FontAwesomeIcon icon="file-pdf-o" /> {m?.more.pdfExport}{' '}
                  <kbd>e</kbd> <kbd>p</kbd>
                </Dropdown.Item>
                <Dropdown.Item
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('export-gpx'));
                  }}
                >
                  <FontAwesomeIcon icon="download" /> {m?.more.gpxExport}{' '}
                  <kbd>e</kbd> <kbd>g</kbd>
                </Dropdown.Item>
                <Dropdown.Item
                  onSelect={close}
                  href="http://wiki.freemap.sk/FileDownload"
                  target="_blank"
                >
                  <FontAwesomeIcon icon="!icon-gps-device" />{' '}
                  {m?.more.mapExports}
                </Dropdown.Item>
                <Dropdown.Item
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('embed'));
                  }}
                >
                  <FontAwesomeIcon icon="code" /> {m?.more.embedMap}{' '}
                  <kbd>e</kbd> <kbd>e</kbd>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  onSelect={close}
                  href="http://wiki.freemap.sk/NahlasenieChyby"
                  target="_blank"
                >
                  <FontAwesomeIcon icon="exclamation-triangle" />{' '}
                  {m?.more.reportMapError}
                </Dropdown.Item>
                <Dropdown.Item
                  onSelect={close}
                  href="https://github.com/FreemapSlovakia/freemap-v3-react/issues/new"
                  target="_blank"
                >
                  <FontAwesomeIcon icon="!icon-bug" /> {m?.more.reportAppError}
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item eventKey="help" onSelect={setSubmenu}>
                  <FontAwesomeIcon icon="book" /> {m?.more.help}{' '}
                  <FontAwesomeIcon icon="chevron-right" />
                </Dropdown.Item>
                <Dropdown.Item
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('supportUs'));
                  }}
                >
                  <FontAwesomeIcon icon="heart" style={{ color: 'red' }} />{' '}
                  {m?.more.supportUs}{' '}
                  <FontAwesomeIcon icon="heart" style={{ color: 'red' }} />
                </Dropdown.Item>
              </>
            ) : submenu === 'help' ? (
              <>
                <Dropdown.Header>
                  <FontAwesomeIcon icon="book" /> {m?.more.help}
                </Dropdown.Header>
                <Dropdown.Item onSelect={handleBackClick}>
                  <FontAwesomeIcon icon="chevron-left" /> {m?.more.back}{' '}
                  <kbd>Esc</kbd>
                </Dropdown.Item>
                <Dropdown.Divider />
                {(skCz ? ['A', 'K', 'T', 'C', 'X', 'O'] : ['X', 'O']).includes(
                  mapType,
                ) && (
                  <Dropdown.Item
                    onSelect={() => {
                      close();
                      dispatch(setActiveModal('legend'));
                    }}
                  >
                    <FontAwesomeIcon icon="map-o" /> {m?.more.mapLegend}
                  </Dropdown.Item>
                )}
                <Dropdown.Item
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('about'));
                  }}
                >
                  <FontAwesomeIcon icon="address-card-o" /> {m?.more.contacts}
                </Dropdown.Item>
                {skCz && (
                  <>
                    <Dropdown.Divider />
                    <Dropdown.Header>
                      <FontAwesomeIcon icon="lightbulb-o" /> {m?.more.tips}
                    </Dropdown.Header>
                    {tips.map(([key, name, icon]) => (
                      <Dropdown.Item
                        key={key}
                        onSelect={handleTipSelect}
                        eventKey={key}
                      >
                        <FontAwesomeIcon icon={icon} /> {name}
                      </Dropdown.Item>
                    ))}
                  </>
                )}
              </>
            ) : submenu === 'openExternally' ? (
              <>
                <Dropdown.Header>
                  <FontAwesomeIcon icon="external-link" />{' '}
                  {m?.external.openInExternal}
                </Dropdown.Header>
                <Dropdown.Item onSelect={handleBackClick}>
                  <FontAwesomeIcon icon="chevron-left" /> {m?.more.back}{' '}
                  <kbd>Esc</kbd>
                </Dropdown.Item>
                <Dropdown.Divider />
                <OpenInExternalAppDropdownItems
                  lat={lat}
                  lon={lon}
                  zoom={zoom}
                  mapType={mapType}
                  expertMode={expertMode}
                  onSelect={close}
                  pointTitle={document.title}
                  pointDescription={document.title}
                />
              </>
            ) : submenu === 'language' ? (
              <>
                <Dropdown.Header>
                  <FontAwesomeIcon icon="language" /> Language / Jazyk / Nyelv
                </Dropdown.Header>
                <Dropdown.Item onSelect={handleBackClick}>
                  <FontAwesomeIcon icon="chevron-left" /> {m?.more.back}{' '}
                  <kbd>Esc</kbd>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  onSelect={handleLanguageClick}
                  active={chosenLanguage === null}
                >
                  {m?.more.automaticLanguage}
                </Dropdown.Item>
                <Dropdown.Item
                  eventKey="en"
                  onSelect={handleLanguageClick}
                  active={chosenLanguage === 'en'}
                >
                  English
                </Dropdown.Item>
                <Dropdown.Item
                  eventKey="sk"
                  onSelect={handleLanguageClick}
                  active={chosenLanguage === 'sk'}
                >
                  Slovensky
                </Dropdown.Item>
                <Dropdown.Item
                  eventKey="cs"
                  onSelect={handleLanguageClick}
                  active={chosenLanguage === 'cs'}
                >
                  Česky
                </Dropdown.Item>
                <Dropdown.Item
                  eventKey="hu"
                  onSelect={handleLanguageClick}
                  active={chosenLanguage === 'hu'}
                >
                  Magyar
                </Dropdown.Item>
              </>
            ) : null}
          </Popover.Content>

          {submenu === null && (
            <div style={{ margin: '4px 18px', fontSize: '18px' }}>
              <a
                onSelect={close}
                href="https://www.facebook.com/FreemapSlovakia"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#3b5998' }}
                title={m?.more.facebook}
              >
                <FontAwesomeIcon icon="facebook-official" />
              </a>{' '}
              <a
                onSelect={close}
                href="https://twitter.com/FreemapSlovakia"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0084b4' }}
                title={m?.more.twitter}
              >
                <FontAwesomeIcon icon="twitter" />
              </a>{' '}
              <a
                onSelect={close}
                href="https://www.youtube.com/channel/UCy0FrRnqJlc96dEpDIpNhIQ"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#ff0000' }}
                title={m?.more.youtube}
              >
                <FontAwesomeIcon icon="youtube-play" />
              </a>{' '}
              <a
                onSelect={close}
                href="https://github.com/FreemapSlovakia"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#333' }}
                title={m?.more.github}
              >
                <FontAwesomeIcon icon="github" />
              </a>
            </div>
          )}
        </Popover>
      </Overlay>
    </>
  );
}
