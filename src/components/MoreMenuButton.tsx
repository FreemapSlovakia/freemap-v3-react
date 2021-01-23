import {
  authChooseLoginMethod,
  authStartLogout,
} from 'fm3/actions/authActions';
import {
  galleryList,
  galleryShowFilter,
  galleryShowUploadModal,
} from 'fm3/actions/galleryActions';
import { l10nSetChosenLanguage } from 'fm3/actions/l10nActions';
import {
  clearMap,
  setActiveModal,
  setTool,
  Tool,
} from 'fm3/actions/mainActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { tipsShow } from 'fm3/actions/tipsActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import tips from 'fm3/tips/index.json';
import { toolDefinitions } from 'fm3/toolDefinitions';
import {
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';
import { useDispatch, useSelector } from 'react-redux';
import { is } from 'typescript-is';
import { OpenInExternalAppDropdownItems } from './OpenInExternalAppMenuItems';

type Submenu =
  | 'openExternally'
  | 'help'
  | 'language'
  | 'photos'
  | 'tracking'
  | 'drawing'
  | null;

export function MoreMenuButton(): ReactElement {
  const user = useSelector((state: RootState) => state.auth.user);

  const chosenLanguage = useSelector(
    (state: RootState) => state.l10n.chosenLanguage,
  );

  const language = useSelector((state: RootState) => state.l10n.language);

  const mapType = useSelector((state: RootState) => state.map.mapType);

  const overlays = useSelector((state: RootState) => state.map.overlays);

  const lat = useSelector((state: RootState) => state.map.lat);

  const lon = useSelector((state: RootState) => state.map.lon);

  const zoom = useSelector((state: RootState) => state.map.zoom);

  const expertMode = useSelector((state: RootState) => state.main.expertMode);

  const [show, setShow] = useState(false);

  const [submenu, setSubmenu] = useState<Submenu>(null);

  const button = useRef<HTMLButtonElement | null>(null);

  const handleButtonClick = useCallback(() => {
    setShow(true);
  }, []);

  useEffect(() => {
    if (show) {
      setSubmenu(null);
    }
  }, [show]);

  const dispatch = useDispatch();

  const handleLanguageClick = useCallback(
    (language: string | null) => {
      close();

      dispatch(l10nSetChosenLanguage(language));
    },
    [dispatch],
  );

  const handleTipSelect = useCallback(
    (tip: string | null) => {
      close();

      if (tip !== null) {
        dispatch(tipsShow(tip));
      }
    },
    [dispatch],
  );

  const handleBackClick = useCallback(() => {
    setSubmenu(null);
  }, []);

  const skCz = ['sk', 'cs'].includes(language);

  const m = useMessages();

  const eh = useCallback(
    (e) => {
      if (e.code === 'Escape') {
        e.stopPropagation();
        e.preventDefault();

        if (submenu) {
          setSubmenu(null);
        } else {
          close();
        }
      }
    },
    [submenu],
  );

  useEffect(() => {
    document.body.removeEventListener('keyup', eh);

    if (submenu && show) {
      document.body.addEventListener('keyup', eh);
    }
  }, [eh, submenu, show]);

  const tool = useSelector((state: RootState) => state.main.tool);

  const handleToolSelect = useCallback(
    (tool: string | null) => {
      if (is<Tool | null>(tool)) {
        close();

        dispatch(setTool(tool));
      }
    },
    [dispatch],
  );

  const toolDef = toolDefinitions.find(
    (t) =>
      t.tool ===
      (tool === 'draw-polygons' || tool === 'draw-points'
        ? 'draw-lines'
        : tool),
  ) || { tool: null, icon: 'briefcase', msgKey: 'none' };

  const filterIsActive = useSelector(
    (state: RootState) =>
      Object.values(state.gallery.filter).filter((v) => v !== undefined)
        .length > 0,
  );

  function SubmenuHeader({ icon, title }: { icon: string; title?: string }) {
    return (
      <>
        <Dropdown.Header>
          <FontAwesomeIcon icon={icon} /> {title}
        </Dropdown.Header>
        <Dropdown.Item onSelect={handleBackClick}>
          <FontAwesomeIcon icon="chevron-left" /> {m?.more.back} <kbd>Esc</kbd>
        </Dropdown.Item>
        <Dropdown.Divider />
      </>
    );
  }

  function setToolAndClose(tool: Tool | null) {
    dispatch(setTool(tool));
    close();
  }

  function close() {
    setShow(false);
  }

  const trackingDisplay = useSelector(
    (state: RootState) =>
      state.tracking.showPoints + ',' + state.tracking.showLine,
  );

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
              <Fragment key="main">
                <Dropdown.Item
                  onSelect={() => {
                    setSubmenu('language');
                  }}
                >
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

                <Dropdown.Item
                  onSelect={() => {
                    close();
                    dispatch(clearMap());
                  }}
                >
                  <FontAwesomeIcon icon="eraser" /> {m?.main.clearMap}{' '}
                  <kbd>g</kbd> <kbd>c</kbd>
                </Dropdown.Item>

                <Dropdown.Item
                  onSelect={() => {
                    setSubmenu('drawing');
                  }}
                >
                  <FontAwesomeIcon icon="object-ungroup" />{' '}
                  {m?.tools.measurement}
                  <FontAwesomeIcon icon="chevron-right" />
                </Dropdown.Item>

                <Dropdown.Item
                  onSelect={() => {
                    setSubmenu('photos');
                  }}
                >
                  <FontAwesomeIcon icon="picture-o" /> {m?.tools.photos}
                  <FontAwesomeIcon icon="chevron-right" />
                </Dropdown.Item>

                {toolDefinitions
                  .filter(
                    ({ expertOnly, draw }) =>
                      !draw && (expertMode || !expertOnly),
                  )
                  .map(
                    ({ tool: newTool, icon, msgKey, kbd }) =>
                      newTool && (
                        <Dropdown.Item
                          key={newTool}
                          eventKey={newTool}
                          onSelect={handleToolSelect}
                          active={toolDef?.tool === newTool}
                        >
                          <FontAwesomeIcon icon={icon} /> {m?.tools[msgKey]}{' '}
                          {kbd && (
                            <>
                              <kbd>g</kbd>{' '}
                              <kbd>{kbd.replace(/Key/, '').toLowerCase()}</kbd>
                            </>
                          )}
                        </Dropdown.Item>
                      ),
                  )}

                <Dropdown.Item
                  onSelect={() => {
                    setSubmenu('tracking');
                  }}
                >
                  <FontAwesomeIcon icon="bullseye" /> {m?.tools.tracking}
                  <FontAwesomeIcon icon="chevron-right" />
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item
                  onSelect={() => {
                    setSubmenu('openExternally');
                  }}
                >
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
                  onSelect={() => {
                    setSubmenu('help');
                  }}
                >
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
              </Fragment>
            ) : submenu === 'help' ? (
              <Fragment key="help">
                <SubmenuHeader icon="book" title={m?.more.help} />

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
              </Fragment>
            ) : submenu === 'openExternally' ? (
              <Fragment key="openExternally">
                <SubmenuHeader
                  icon="external-link"
                  title={m?.external.openInExternal}
                />

                <OpenInExternalAppDropdownItems
                  lat={lat}
                  lon={lon}
                  zoom={zoom}
                  mapType={mapType}
                  onSelect={close}
                  pointTitle={document.title}
                  pointDescription={document.title}
                  showKbdShortcut
                />
              </Fragment>
            ) : submenu === 'language' ? (
              <Fragment key="language">
                <SubmenuHeader
                  icon="language"
                  title="Language / Jazyk / Nyelv"
                />

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
              </Fragment>
            ) : submenu === 'photos' ? (
              <Fragment key="photos">
                <SubmenuHeader icon="picture-o" title={m?.tools.photos} />

                <Dropdown.Item
                  onSelect={() => {
                    dispatch(galleryShowFilter());
                    close();
                  }}
                  active={filterIsActive}
                >
                  <FontAwesomeIcon icon="filter" /> {m?.gallery.filter}{' '}
                  <kbd>p</kbd> <kbd>f</kbd>
                </Dropdown.Item>

                <Dropdown.Item
                  onSelect={() => {
                    dispatch(galleryShowUploadModal());
                    close();
                  }}
                >
                  <FontAwesomeIcon icon="upload" /> {m?.gallery.upload}{' '}
                  <kbd>p</kbd> <kbd>u</kbd>
                </Dropdown.Item>

                <Dropdown.Item
                  onSelect={() => {
                    dispatch(
                      mapRefocus({
                        overlays: overlays.includes('I')
                          ? overlays.filter((o) => o !== 'I')
                          : [...overlays, 'I'],
                      }),
                    );
                    close();
                  }}
                  active={overlays.includes('I')}
                >
                  <FontAwesomeIcon
                    icon={
                      overlays.includes('I') ? 'check-square-o' : 'square-o'
                    }
                  />{' '}
                  {m?.gallery.showLayer} <kbd>shift + p</kbd>
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Header>
                  <FontAwesomeIcon icon="book" /> {m?.gallery.showPhotosFrom}
                </Dropdown.Header>

                <Dropdown.Item
                  onSelect={() => {
                    dispatch(galleryList('-createdAt'));
                    close();
                  }}
                >
                  {m?.gallery.f.lastUploaded} <kbd>p</kbd> <kbd>l</kbd>
                </Dropdown.Item>

                <Dropdown.Item
                  onSelect={() => {
                    dispatch(galleryList('-takenAt'));
                    close();
                  }}
                >
                  {m?.gallery.f.lastCaptured}
                </Dropdown.Item>

                <Dropdown.Item
                  onSelect={() => {
                    dispatch(galleryList('-rating'));
                    close();
                  }}
                >
                  {m?.gallery.f.mostRated}
                </Dropdown.Item>
              </Fragment>
            ) : submenu === 'tracking' ? (
              <Fragment key="tracking">
                <SubmenuHeader icon="bullseye" title={m?.tools.tracking} />

                <Dropdown.Item
                  onSelect={() => {
                    dispatch(setActiveModal('tracking-watched'));
                    close();
                  }}
                >
                  <FontAwesomeIcon icon="eye" />{' '}
                  {m?.tracking.trackedDevices.button}
                </Dropdown.Item>

                <Dropdown.Item
                  onSelect={() => {
                    dispatch(setActiveModal('tracking-my'));
                    close();
                  }}
                >
                  <FontAwesomeIcon icon="mobile" /> {m?.tracking.devices.button}
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Header>
                  <FontAwesomeIcon icon="paint-brush" /> {m?.general.visual}
                </Dropdown.Header>

                <Dropdown.Item
                  active={trackingDisplay === 'true,false'}
                  onSelect={() => {
                    dispatch(trackingActions.setShowPoints(true));
                    dispatch(trackingActions.setShowLine(false));
                  }}
                >
                  <FontAwesomeIcon
                    icon={
                      trackingDisplay === 'true,false'
                        ? 'check-circle-o'
                        : 'circle-o'
                    }
                  />{' '}
                  {m?.tracking.visual.points}
                </Dropdown.Item>

                <Dropdown.Item
                  active={trackingDisplay === 'false,true'}
                  onSelect={() => {
                    dispatch(trackingActions.setShowPoints(false));
                    dispatch(trackingActions.setShowLine(true));
                  }}
                >
                  <FontAwesomeIcon
                    icon={
                      trackingDisplay === 'false,true'
                        ? 'check-circle-o'
                        : 'circle-o'
                    }
                  />{' '}
                  {m?.tracking.visual.line}
                </Dropdown.Item>

                <Dropdown.Item
                  active={trackingDisplay === 'true,true'}
                  onSelect={() => {
                    dispatch(trackingActions.setShowPoints(true));
                    dispatch(trackingActions.setShowLine(true));
                  }}
                >
                  <FontAwesomeIcon
                    icon={
                      trackingDisplay === 'true,true'
                        ? 'check-circle-o'
                        : 'circle-o'
                    }
                  />{' '}
                  {m?.tracking.visual['line+points']}
                </Dropdown.Item>
              </Fragment>
            ) : submenu === 'drawing' ? (
              <Fragment key="drawing">
                <SubmenuHeader
                  icon="object-ungroup"
                  title={m?.tools.measurement}
                />

                <Dropdown.Item
                  onSelect={() => setToolAndClose('draw-points')}
                  active={tool === 'draw-points'}
                >
                  <FontAwesomeIcon icon="map-marker" />{' '}
                  {m?.measurement.elevation} <kbd>g</kbd> <kbd>p</kbd>
                </Dropdown.Item>

                <Dropdown.Item
                  onSelect={() => setToolAndClose('draw-lines')}
                  active={tool === 'draw-lines'}
                >
                  <FontAwesomeIcon icon="arrows-h" /> {m?.measurement.distance}{' '}
                  <kbd>g</kbd> <kbd>l</kbd>
                </Dropdown.Item>

                <Dropdown.Item
                  onSelect={() => setToolAndClose('draw-polygons')}
                  active={tool === 'draw-polygons'}
                >
                  <FontAwesomeIcon icon="square-o" /> {m?.measurement.area}{' '}
                  <kbd>g</kbd> <kbd>n</kbd>
                </Dropdown.Item>
              </Fragment>
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
