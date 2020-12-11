import { useDispatch, useSelector } from 'react-redux';
import { useState, useRef, useCallback, ReactElement } from 'react';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import tips from 'fm3/tips/index.json';
import { useMessages } from 'fm3/l10nInjector';

import { setActiveModal } from 'fm3/actions/mainActions';
import {
  authStartLogout,
  authChooseLoginMethod,
} from 'fm3/actions/authActions';
import { tipsShow } from 'fm3/actions/tipsActions';
import { l10nSetChosenLanguage } from 'fm3/actions/l10nActions';
import { RootState } from 'fm3/storeCreator';
import { OpenInExternalAppDropdownItems } from './OpenInExternalAppDropdownItems';
import { Button, Popover } from 'react-bootstrap';
import Overlay from 'react-overlays/esm/Overlay';
import DropdownItem from 'react-bootstrap/esm/DropdownItem';

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

  const [submenu, setSubmenu] = useState<any>(null);

  const button = useRef<Button | null>(null);

  const handleButtonClick = useCallback(() => {
    setShow(true);
  }, []);

  const close = useCallback(() => {
    setShow(false);
    setSubmenu(null);
  }, []);

  const dispatch = useDispatch();

  const handleLanguageClick = useCallback(
    (language: unknown) => {
      close();

      if (language === null || typeof language === 'string') {
        dispatch(l10nSetChosenLanguage(language));
      }
    },
    [dispatch, close],
  );

  const handleTipSelect = useCallback(
    (tip: unknown) => {
      close();

      if (typeof tip === 'string') {
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
        target={button.current ?? undefined}
        shouldUpdatePosition
      >
        <Popover id="popover-trigger-click-root-close" className="fm-menu">
          <ul>
            {submenu === null ? (
              <>
                <DropdownItem eventKey="language" onSelect={setSubmenu}>
                  <FontAwesomeIcon icon="language" /> Language / Jazyk / Nyelv{' '}
                  <FontAwesomeIcon icon="chevron-right" />
                </DropdownItem>
                {user ? (
                  <DropdownItem
                    onSelect={() => {
                      close();
                      dispatch(authStartLogout());
                    }}
                  >
                    <FontAwesomeIcon icon="sign-out" />{' '}
                    {m?.more.logOut(user.name)}
                  </DropdownItem>
                ) : (
                  <DropdownItem
                    onSelect={() => {
                      close();
                      dispatch(authChooseLoginMethod());
                    }}
                  >
                    <FontAwesomeIcon icon="sign-in" /> {m?.more.logIn}
                  </DropdownItem>
                )}
                <DropdownItem
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('settings'));
                  }}
                >
                  <FontAwesomeIcon icon="cog" /> {m?.more.settings} <kbd>e</kbd>{' '}
                  <kbd>s</kbd>
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem onSelect={handleOpenExternally}>
                  <FontAwesomeIcon icon="external-link" />{' '}
                  {m?.external.openInExternal}{' '}
                  <FontAwesomeIcon icon="chevron-right" />
                </DropdownItem>
                <DropdownItem
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('export-pdf'));
                  }}
                >
                  <FontAwesomeIcon icon="file-pdf-o" /> {m?.more.pdfExport}{' '}
                  <kbd>e</kbd> <kbd>p</kbd>
                </DropdownItem>
                <DropdownItem
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('export-gpx'));
                  }}
                >
                  <FontAwesomeIcon icon="download" /> {m?.more.gpxExport}{' '}
                  <kbd>e</kbd> <kbd>g</kbd>
                </DropdownItem>
                <DropdownItem
                  onSelect={close}
                  href="http://wiki.freemap.sk/FileDownload"
                  target="_blank"
                >
                  <FontAwesomeIcon icon="!icon-gps-device" />{' '}
                  {m?.more.mapExports}
                </DropdownItem>
                <DropdownItem
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('embed'));
                  }}
                >
                  <FontAwesomeIcon icon="code" /> {m?.more.embedMap}{' '}
                  <kbd>e</kbd> <kbd>e</kbd>
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem
                  onSelect={close}
                  href="http://wiki.freemap.sk/NahlasenieChyby"
                  target="_blank"
                >
                  <FontAwesomeIcon icon="exclamation-triangle" />{' '}
                  {m?.more.reportMapError}
                </DropdownItem>
                <DropdownItem
                  onSelect={close}
                  href="https://github.com/FreemapSlovakia/freemap-v3-react/issues/new"
                  target="_blank"
                >
                  <FontAwesomeIcon icon="!icon-bug" /> {m?.more.reportAppError}
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem eventKey="help" onSelect={setSubmenu}>
                  <FontAwesomeIcon icon="book" /> {m?.more.help}{' '}
                  <FontAwesomeIcon icon="chevron-right" />
                </DropdownItem>
                <DropdownItem
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('supportUs'));
                  }}
                >
                  <FontAwesomeIcon icon="heart" style={{ color: 'red' }} />{' '}
                  {m?.more.supportUs}{' '}
                  <FontAwesomeIcon icon="heart" style={{ color: 'red' }} />
                </DropdownItem>
              </>
            ) : submenu === 'help' ? (
              <>
                <DropdownItem header>
                  <FontAwesomeIcon icon="book" /> {m?.more.help}
                </DropdownItem>
                <DropdownItem onSelect={handleBackClick}>
                  <FontAwesomeIcon icon="chevron-left" /> {m?.more.back}{' '}
                  <kbd>Esc</kbd>
                </DropdownItem>
                <DropdownItem divider />
                {(skCz ? ['A', 'K', 'T', 'C', 'X', 'O'] : ['X', 'O']).includes(
                  mapType,
                ) && (
                  <DropdownItem
                    onSelect={() => {
                      close();
                      dispatch(setActiveModal('legend'));
                    }}
                  >
                    <FontAwesomeIcon icon="map-o" /> {m?.more.mapLegend}
                  </DropdownItem>
                )}
                <DropdownItem
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('about'));
                  }}
                >
                  <FontAwesomeIcon icon="address-card-o" /> {m?.more.contacts}
                </DropdownItem>
                {skCz && (
                  <>
                    <DropdownItem divider />
                    <DropdownItem header>
                      <FontAwesomeIcon icon="lightbulb-o" /> {m?.more.tips}
                    </DropdownItem>
                    {tips.map(([key, name, icon]) => (
                      <DropdownItem
                        key={key}
                        onSelect={handleTipSelect}
                        eventKey={key}
                      >
                        <FontAwesomeIcon icon={icon} /> {name}
                      </DropdownItem>
                    ))}
                  </>
                )}
              </>
            ) : submenu === 'openExternally' ? (
              <>
                <DropdownItem header>
                  <FontAwesomeIcon icon="external-link" />{' '}
                  {m?.external.openInExternal}
                </DropdownItem>
                <DropdownItem onSelect={handleBackClick}>
                  <FontAwesomeIcon icon="chevron-left" /> {m?.more.back}{' '}
                  <kbd>Esc</kbd>
                </DropdownItem>
                <DropdownItem divider />
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
                <DropdownItem header>
                  <FontAwesomeIcon icon="language" /> Language / Jazyk / Nyelv
                </DropdownItem>
                <DropdownItem onSelect={handleBackClick}>
                  <FontAwesomeIcon icon="chevron-left" /> {m?.more.back}{' '}
                  <kbd>Esc</kbd>
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem
                  eventKey={null}
                  onSelect={handleLanguageClick}
                  active={chosenLanguage === null}
                >
                  {m?.more.automaticLanguage}
                </DropdownItem>
                <DropdownItem
                  eventKey="en"
                  onSelect={handleLanguageClick}
                  active={chosenLanguage === 'en'}
                >
                  English
                </DropdownItem>
                <DropdownItem
                  eventKey="sk"
                  onSelect={handleLanguageClick}
                  active={chosenLanguage === 'sk'}
                >
                  Slovensky
                </DropdownItem>
                <DropdownItem
                  eventKey="cs"
                  onSelect={handleLanguageClick}
                  active={chosenLanguage === 'cs'}
                >
                  Česky
                </DropdownItem>
                <DropdownItem
                  eventKey="hu"
                  onSelect={handleLanguageClick}
                  active={chosenLanguage === 'hu'}
                >
                  Magyar
                </DropdownItem>
              </>
            ) : null}
          </ul>
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
