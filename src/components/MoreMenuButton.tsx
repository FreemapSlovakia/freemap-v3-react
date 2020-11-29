import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useRef, useCallback, ReactElement } from 'react';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Button from 'react-bootstrap/lib/Button';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import tips from 'fm3/tips/index.json';
import { useTranslator } from 'fm3/l10nInjector';

import { setActiveModal } from 'fm3/actions/mainActions';
import {
  authStartLogout,
  authChooseLoginMethod,
} from 'fm3/actions/authActions';
import { tipsShow } from 'fm3/actions/tipsActions';
import { l10nSetChosenLanguage } from 'fm3/actions/l10nActions';
import { RootState } from 'fm3/storeCreator';
import { OpenInExternalAppMenuItems } from './OpenInExternalAppMenuItems';

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

  const t = useTranslator();

  return (
    <>
      <Button
        ref={button}
        onClick={handleButtonClick}
        title={t('more.more')}
        bsStyle="primary"
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
                <MenuItem eventKey="language" onSelect={setSubmenu}>
                  <FontAwesomeIcon icon="language" /> Language / Jazyk / Nyelv{' '}
                  <FontAwesomeIcon icon="chevron-right" />
                </MenuItem>
                {user ? (
                  <MenuItem
                    onSelect={() => {
                      close();
                      dispatch(authStartLogout());
                    }}
                  >
                    <FontAwesomeIcon icon="sign-out" />{' '}
                    {t('more.logOut', { name: user.name })}
                  </MenuItem>
                ) : (
                  <MenuItem
                    onSelect={() => {
                      close();
                      dispatch(authChooseLoginMethod());
                    }}
                  >
                    <FontAwesomeIcon icon="sign-in" /> {t('more.logIn')}
                  </MenuItem>
                )}
                <MenuItem
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('settings'));
                  }}
                >
                  <FontAwesomeIcon icon="cog" /> {t('more.settings')}{' '}
                  <kbd>e</kbd> <kbd>s</kbd>
                </MenuItem>
                <MenuItem divider />
                <MenuItem onSelect={handleOpenExternally}>
                  <FontAwesomeIcon icon="external-link" />{' '}
                  {t('external.openInExternal')}{' '}
                  <FontAwesomeIcon icon="chevron-right" />
                </MenuItem>
                <MenuItem
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('export-pdf'));
                  }}
                >
                  <FontAwesomeIcon icon="file-pdf-o" /> {t('more.pdfExport')}{' '}
                  <kbd>e</kbd> <kbd>p</kbd>
                </MenuItem>
                <MenuItem
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('export-gpx'));
                  }}
                >
                  <FontAwesomeIcon icon="download" /> {t('more.gpxExport')}{' '}
                  <kbd>e</kbd> <kbd>g</kbd>
                </MenuItem>
                <MenuItem
                  onSelect={close}
                  href="http://wiki.freemap.sk/FileDownload"
                  target="_blank"
                >
                  <FontAwesomeIcon icon="!icon-gps-device" />{' '}
                  {t('more.mapExports')}
                </MenuItem>
                <MenuItem
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('embed'));
                  }}
                >
                  <FontAwesomeIcon icon="code" /> {t('more.embedMap')}{' '}
                  <kbd>e</kbd> <kbd>e</kbd>
                </MenuItem>
                <MenuItem divider />
                <MenuItem
                  onSelect={close}
                  href="http://wiki.freemap.sk/NahlasenieChyby"
                  target="_blank"
                >
                  <FontAwesomeIcon icon="exclamation-triangle" />{' '}
                  {t('more.reportMapError')}
                </MenuItem>
                <MenuItem
                  onSelect={close}
                  href="https://github.com/FreemapSlovakia/freemap-v3-react/issues/new"
                  target="_blank"
                >
                  <FontAwesomeIcon icon="!icon-bug" />{' '}
                  {t('more.reportAppError')}
                </MenuItem>
                <MenuItem divider />
                <MenuItem eventKey="help" onSelect={setSubmenu}>
                  <FontAwesomeIcon icon="book" /> {t('more.help')}{' '}
                  <FontAwesomeIcon icon="chevron-right" />
                </MenuItem>
                <MenuItem
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('supportUs'));
                  }}
                >
                  <FontAwesomeIcon icon="heart" style={{ color: 'red' }} />{' '}
                  {t('more.supportUs')}{' '}
                  <FontAwesomeIcon icon="heart" style={{ color: 'red' }} />
                </MenuItem>
              </>
            ) : submenu === 'help' ? (
              <>
                <MenuItem header>
                  <FontAwesomeIcon icon="book" /> {t('more.help')}
                </MenuItem>
                <MenuItem onSelect={handleBackClick}>
                  <FontAwesomeIcon icon="chevron-left" /> {t('more.back')}{' '}
                  <kbd>Esc</kbd>
                </MenuItem>
                <MenuItem divider />
                {(skCz ? ['A', 'K', 'T', 'C', 'X', 'O'] : ['X', 'O']).includes(
                  mapType,
                ) && (
                  <MenuItem
                    onSelect={() => {
                      close();
                      dispatch(setActiveModal('legend'));
                    }}
                  >
                    <FontAwesomeIcon icon="map-o" /> {t('more.mapLegend')}
                  </MenuItem>
                )}
                <MenuItem
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('about'));
                  }}
                >
                  <FontAwesomeIcon icon="address-card-o" /> {t('more.contacts')}
                </MenuItem>
                {skCz && (
                  <>
                    <MenuItem divider />
                    <MenuItem header>
                      <FontAwesomeIcon icon="lightbulb-o" /> {t('more.tips')}
                    </MenuItem>
                    {tips.map(([key, name, icon]) => (
                      <MenuItem
                        key={key}
                        onSelect={handleTipSelect}
                        eventKey={key}
                      >
                        <FontAwesomeIcon icon={icon} /> {name}
                      </MenuItem>
                    ))}
                  </>
                )}
              </>
            ) : submenu === 'openExternally' ? (
              <>
                <MenuItem header>
                  <FontAwesomeIcon icon="external-link" />{' '}
                  {t('external.openInExternal')}
                </MenuItem>
                <MenuItem onSelect={handleBackClick}>
                  <FontAwesomeIcon icon="chevron-left" /> {t('more.back')}{' '}
                  <kbd>Esc</kbd>
                </MenuItem>
                <MenuItem divider />
                <OpenInExternalAppMenuItems
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
                <MenuItem header>
                  <FontAwesomeIcon icon="language" /> Language / Jazyk / Nyelv
                </MenuItem>
                <MenuItem onSelect={handleBackClick}>
                  <FontAwesomeIcon icon="chevron-left" /> {t('more.back')}{' '}
                  <kbd>Esc</kbd>
                </MenuItem>
                <MenuItem divider />
                <MenuItem
                  eventKey={null}
                  onSelect={handleLanguageClick}
                  active={chosenLanguage === null}
                >
                  {t('more.automaticLanguage')}
                </MenuItem>
                <MenuItem
                  eventKey="en"
                  onSelect={handleLanguageClick}
                  active={chosenLanguage === 'en'}
                >
                  English
                </MenuItem>
                <MenuItem
                  eventKey="sk"
                  onSelect={handleLanguageClick}
                  active={chosenLanguage === 'sk'}
                >
                  Slovensky
                </MenuItem>
                <MenuItem
                  eventKey="cs"
                  onSelect={handleLanguageClick}
                  active={chosenLanguage === 'cs'}
                >
                  Česky
                </MenuItem>
                <MenuItem
                  eventKey="hu"
                  onSelect={handleLanguageClick}
                  active={chosenLanguage === 'hu'}
                >
                  Magyar
                </MenuItem>
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
                title={t('more.facebook')}
              >
                <FontAwesomeIcon icon="facebook-official" />
              </a>{' '}
              <a
                onSelect={close}
                href="https://twitter.com/FreemapSlovakia"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0084b4' }}
                title={t('more.twitter')}
              >
                <FontAwesomeIcon icon="twitter" />
              </a>{' '}
              <a
                onSelect={close}
                href="https://www.youtube.com/channel/UCy0FrRnqJlc96dEpDIpNhIQ"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#ff0000' }}
                title={t('more.youtube')}
              >
                <FontAwesomeIcon icon="youtube-play" />
              </a>{' '}
              <a
                onSelect={close}
                href="https://github.com/FreemapSlovakia"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#333' }}
                title={t('more.github')}
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
