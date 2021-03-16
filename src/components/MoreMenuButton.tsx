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
import { useScrollClasses } from 'fm3/hooks/scrollClassesHook';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { tips } from 'fm3/tips';
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
import {
  FaBars,
  FaBook,
  FaBullseye,
  FaCamera,
  FaChevronLeft,
  FaChevronRight,
  FaCode,
  FaCog,
  FaDownload,
  FaDrawPolygon,
  FaEraser,
  FaExternalLinkAlt,
  FaFacebook,
  FaFilter,
  FaGithub,
  FaHeart,
  FaLanguage,
  FaMapMarkerAlt,
  FaMobileAlt,
  FaPaintBrush,
  FaPencilRuler,
  FaRegAddressCard,
  FaRegCheckCircle,
  FaRegCheckSquare,
  FaRegCircle,
  FaRegEye,
  FaRegFilePdf,
  FaRegLightbulb,
  FaRegMap,
  FaRegSquare,
  FaSignInAlt,
  FaSignOutAlt,
  FaTwitter,
  FaUpload,
  FaUsers,
  FaYoutube,
} from 'react-icons/fa';
import { MdTimeline } from 'react-icons/md';
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

  function SubmenuHeader({
    icon,
    title,
  }: {
    icon: ReactElement;
    title?: string;
  }) {
    return (
      <>
        <Dropdown.Header>
          {icon} {title}
        </Dropdown.Header>
        <Dropdown.Item onSelect={handleBackClick}>
          <FaChevronLeft /> {m?.more.back} <kbd>Esc</kbd>
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

  const sc = useScrollClasses('vertical');

  return (
    <>
      <Button
        ref={button}
        onClick={handleButtonClick}
        title={m?.more.more}
        variant="primary"
        className="mr-1"
      >
        <FaBars />
      </Button>
      <Overlay
        rootClose
        placement="bottom"
        show={show}
        onHide={close}
        target={button.current}
      >
        <Popover id="popover-trigger-click-root-close" className="fm-menu">
          <Popover.Content className="fm-menu-scroller" ref={sc}>
            <div />

            {submenu === null ? (
              <Fragment key="main">
                <Dropdown.Item
                  onSelect={() => {
                    setSubmenu('language');
                  }}
                >
                  <FaLanguage /> Language / Jazyk / Nyelv <FaChevronRight />
                </Dropdown.Item>

                {user ? (
                  <Dropdown.Item
                    onSelect={() => {
                      close();
                      dispatch(authStartLogout());
                    }}
                  >
                    <FaSignOutAlt /> {m?.more.logOut(user.name)}
                  </Dropdown.Item>
                ) : (
                  <Dropdown.Item
                    onSelect={() => {
                      close();
                      dispatch(authChooseLoginMethod());
                    }}
                  >
                    <FaSignInAlt /> {m?.more.logIn}
                  </Dropdown.Item>
                )}

                <Dropdown.Item
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('settings'));
                  }}
                >
                  <FaCog /> {m?.more.settings} <kbd>e</kbd> <kbd>s</kbd>
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item
                  onSelect={() => {
                    close();
                    dispatch(clearMap());
                  }}
                >
                  <FaEraser /> {m?.main.clearMap} <kbd>g</kbd> <kbd>c</kbd>
                </Dropdown.Item>

                <Dropdown.Item
                  onSelect={() => {
                    setSubmenu('drawing');
                  }}
                >
                  <FaPencilRuler /> {m?.tools.measurement}
                  <FaChevronRight />
                </Dropdown.Item>

                <Dropdown.Item
                  onSelect={() => {
                    setSubmenu('photos');
                  }}
                >
                  <FaCamera /> {m?.tools.photos}
                  <FaChevronRight />
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
                          {icon} {m?.tools[msgKey]}{' '}
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
                  <FaBullseye /> {m?.tools.tracking}
                  <FaChevronRight />
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item
                  onSelect={() => {
                    setSubmenu('openExternally');
                  }}
                >
                  <FaExternalLinkAlt /> {m?.external.openInExternal}{' '}
                  <FaChevronRight />
                </Dropdown.Item>

                <Dropdown.Item
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('export-pdf'));
                  }}
                >
                  <FaRegFilePdf /> {m?.more.pdfExport} <kbd>e</kbd> <kbd>p</kbd>
                </Dropdown.Item>

                <Dropdown.Item
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('export-gpx'));
                  }}
                >
                  <FaDownload /> {m?.more.gpxExport} <kbd>e</kbd> <kbd>g</kbd>
                </Dropdown.Item>

                <Dropdown.Item
                  onSelect={() => {
                    dispatch(tipsShow('exports'));
                    close();
                  }}
                >
                  <FaMobileAlt /> {m?.more.mapExports}
                </Dropdown.Item>

                <Dropdown.Item
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('embed'));
                  }}
                >
                  <FaCode /> {m?.more.embedMap} <kbd>e</kbd> <kbd>e</kbd>
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item
                  onSelect={() => {
                    setSubmenu('help');
                  }}
                >
                  <FaBook /> {m?.more.help} <FaChevronRight />
                </Dropdown.Item>

                <Dropdown.Item
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('supportUs'));
                  }}
                >
                  <FaHeart color="red" /> {m?.more.supportUs}{' '}
                  <FaHeart color="red" />
                </Dropdown.Item>
              </Fragment>
            ) : submenu === 'help' ? (
              <Fragment key="help">
                <SubmenuHeader icon={<FaBook />} title={m?.more.help} />

                {(skCz ? ['A', 'K', 'T', 'C', 'X', 'O'] : ['X', 'O']).includes(
                  mapType,
                ) && (
                  <Dropdown.Item
                    onSelect={() => {
                      close();
                      dispatch(setActiveModal('legend'));
                    }}
                  >
                    <FaRegMap /> {m?.more.mapLegend}
                  </Dropdown.Item>
                )}

                <Dropdown.Item
                  onSelect={() => {
                    close();
                    dispatch(setActiveModal('about'));
                  }}
                >
                  <FaRegAddressCard /> {m?.more.contacts}
                </Dropdown.Item>

                {skCz && (
                  <Dropdown.Item
                    onSelect={close}
                    href="https://groups.google.com/forum/#!forum/osm_sk"
                    target="_blank"
                  >
                    <FaUsers /> Fórum slovenskej OSM komunity
                  </Dropdown.Item>
                )}

                {skCz && (
                  <>
                    <Dropdown.Divider />
                    <Dropdown.Header>
                      <FaRegLightbulb /> {m?.more.tips}
                    </Dropdown.Header>
                    {tips.map(([key, name, icon]) => (
                      <Dropdown.Item
                        key={key}
                        onSelect={handleTipSelect}
                        eventKey={key}
                      >
                        {icon} {name}
                      </Dropdown.Item>
                    ))}
                  </>
                )}
              </Fragment>
            ) : submenu === 'openExternally' ? (
              <Fragment key="openExternally">
                <SubmenuHeader
                  icon={<FaExternalLinkAlt />}
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
                  icon={<FaLanguage />}
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
                <SubmenuHeader icon={<FaCamera />} title={m?.tools.photos} />

                <Dropdown.Item
                  onSelect={() => {
                    dispatch(galleryShowFilter());
                    close();
                  }}
                  active={filterIsActive}
                >
                  <FaFilter /> {m?.gallery.filter} <kbd>p</kbd> <kbd>f</kbd>
                </Dropdown.Item>

                <Dropdown.Item
                  onSelect={() => {
                    dispatch(galleryShowUploadModal());
                    close();
                  }}
                >
                  <FaUpload /> {m?.gallery.upload} <kbd>p</kbd> <kbd>u</kbd>
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
                  }}
                  active={overlays.includes('I')}
                >
                  {overlays.includes('I') ? (
                    <FaRegCheckSquare />
                  ) : (
                    <FaRegSquare />
                  )}{' '}
                  {m?.gallery.showLayer} <kbd>shift + p</kbd>
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Header>
                  <FaBook /> {m?.gallery.showPhotosFrom}
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
                <SubmenuHeader
                  icon={<FaBullseye />}
                  title={m?.tools.tracking}
                />

                <Dropdown.Item
                  onSelect={() => {
                    dispatch(setActiveModal('tracking-watched'));
                    close();
                  }}
                >
                  <FaRegEye /> {m?.tracking.trackedDevices.button}
                </Dropdown.Item>

                <Dropdown.Item
                  onSelect={() => {
                    dispatch(setActiveModal('tracking-my'));
                    close();
                  }}
                >
                  <FaMobileAlt /> {m?.tracking.devices.button}
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Header>
                  <FaPaintBrush /> {m?.general.visual}
                </Dropdown.Header>

                <Dropdown.Item
                  active={trackingDisplay === 'true,false'}
                  onSelect={() => {
                    dispatch(trackingActions.setShowPoints(true));
                    dispatch(trackingActions.setShowLine(false));
                  }}
                >
                  {trackingDisplay === 'true,false' ? (
                    <FaRegCheckCircle />
                  ) : (
                    <FaRegCircle />
                  )}{' '}
                  {m?.tracking.visual.points}
                </Dropdown.Item>

                <Dropdown.Item
                  active={trackingDisplay === 'false,true'}
                  onSelect={() => {
                    dispatch(trackingActions.setShowPoints(false));
                    dispatch(trackingActions.setShowLine(true));
                  }}
                >
                  {trackingDisplay === 'false,true' ? (
                    <FaRegCheckCircle />
                  ) : (
                    <FaRegCircle />
                  )}{' '}
                  {m?.tracking.visual.line}
                </Dropdown.Item>

                <Dropdown.Item
                  active={trackingDisplay === 'true,true'}
                  onSelect={() => {
                    dispatch(trackingActions.setShowPoints(true));
                    dispatch(trackingActions.setShowLine(true));
                  }}
                >
                  {trackingDisplay === 'true,true' ? (
                    <FaRegCheckCircle />
                  ) : (
                    <FaRegCircle />
                  )}{' '}
                  {m?.tracking.visual['line+points']}
                </Dropdown.Item>
              </Fragment>
            ) : submenu === 'drawing' ? (
              <Fragment key="drawing">
                <SubmenuHeader
                  icon={<FaPencilRuler />}
                  title={m?.tools.measurement}
                />

                <Dropdown.Item
                  onSelect={() => setToolAndClose('draw-points')}
                  active={tool === 'draw-points'}
                >
                  <FaMapMarkerAlt /> {m?.measurement.elevation} <kbd>g</kbd>{' '}
                  <kbd>p</kbd>
                </Dropdown.Item>

                <Dropdown.Item
                  onSelect={() => setToolAndClose('draw-lines')}
                  active={tool === 'draw-lines'}
                >
                  <MdTimeline /> {m?.measurement.distance} <kbd>g</kbd>{' '}
                  <kbd>l</kbd>
                </Dropdown.Item>

                <Dropdown.Item
                  onSelect={() => setToolAndClose('draw-polygons')}
                  active={tool === 'draw-polygons'}
                >
                  <FaDrawPolygon /> {m?.measurement.area} <kbd>g</kbd>{' '}
                  <kbd>n</kbd>
                </Dropdown.Item>
              </Fragment>
            ) : null}

            {submenu === null && (
              <>
                <Dropdown.Divider />
                <div style={{ fontSize: '1.2rem' }} className="mx-2">
                  <a
                    onSelect={close}
                    href="https://www.facebook.com/FreemapSlovakia"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#3b5998' }}
                    title={m?.more.facebook}
                  >
                    <FaFacebook />
                  </a>{' '}
                  <a
                    onSelect={close}
                    href="https://twitter.com/FreemapSlovakia"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#0084b4' }}
                    title={m?.more.twitter}
                  >
                    <FaTwitter />
                  </a>{' '}
                  <a
                    onSelect={close}
                    href="https://www.youtube.com/channel/UCy0FrRnqJlc96dEpDIpNhIQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#ff0000' }}
                    title={m?.more.youtube}
                  >
                    <FaYoutube />
                  </a>{' '}
                  <a
                    onSelect={close}
                    href="https://github.com/FreemapSlovakia"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#333' }}
                    title={m?.more.github}
                  >
                    <FaGithub />
                  </a>
                </div>
              </>
            )}
          </Popover.Content>
        </Popover>
      </Overlay>
    </>
  );
}
