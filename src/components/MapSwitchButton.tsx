import { setActiveModal } from 'fm3/actions/mainActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { useScrollClasses } from 'fm3/hooks/useScrollClasses';
import { useMessages } from 'fm3/l10nInjector';
import {
  BaseLayerLetters,
  baseLayers,
  defaultMenuLayerLetters,
  defaultToolbarLayerLetters,
  overlayLayers,
  OverlayLetters,
} from 'fm3/mapDefinitions';
import {
  MouseEvent,
  ReactElement,
  SyntheticEvent,
  useCallback,
  useRef,
  useState,
} from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';
import {
  FaCog,
  FaEllipsisV,
  FaExclamationTriangle,
  FaFilter,
  FaRegCheckCircle,
  FaRegCheckSquare,
  FaRegCircle,
  FaRegMap,
  FaRegSquare,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { is } from 'typescript-is';

function getKbdShortcut(key?: [string, boolean]) {
  return (
    key && (
      <kbd className="ml-1">
        {key[1] ? '⇧' : ''}
        {key[0].replace(/Key|Digit/, '').toLowerCase()}
      </kbd>
    )
  );
}

export function MapSwitchButton(): ReactElement {
  const m = useMessages();

  const zoom = useSelector((state) => state.map.zoom);

  const mapType = useSelector((state) => state.map.mapType);

  const overlays = useSelector((state) => state.map.overlays);

  const pictureFilterIsActive = useSelector((state) =>
    Object.values(state.gallery.filter).some((x) => x),
  );

  const isAdmin = useSelector((state) => !!state.auth.user?.isAdmin);

  const dispatch = useDispatch();

  const [show, setShow] = useState<boolean | 'all'>(false);

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const button2Ref = useRef<HTMLButtonElement | null>(null);

  const handleButtonClick = useCallback(() => {
    setShow(true);
  }, []);

  const handleHide = useCallback(() => {
    setShow(false);
  }, []);

  const handleMapSelect = useCallback(
    (mapType1: string | null, e: SyntheticEvent<unknown>) => {
      e.preventDefault();

      setShow(false);

      if (mapType !== mapType1 && is<BaseLayerLetters>(mapType1)) {
        dispatch(mapRefocus({ mapType: mapType1 }));
      }
    },
    [dispatch, mapType],
  );

  const handlePossibleFilterClick = useCallback(
    (e: SyntheticEvent<unknown, unknown>) => {
      let x: unknown = e.target;

      while (x instanceof Element) {
        if (x === e.currentTarget) {
          break;
        }

        if (x instanceof SVGElement && x.dataset['filter']) {
          dispatch(setActiveModal('gallery-filter'));
          return true;
        }

        x = x.parentNode;
      }

      return false;
    },
    [dispatch],
  );

  const handleOverlaySelect = useCallback(
    (overlay: string | null, e: SyntheticEvent<unknown>) => {
      if (handlePossibleFilterClick(e)) {
        setShow(false);

        return;
      }

      const s = new Set(overlays);

      if (!is<OverlayLetters>(overlay)) {
        // uh-oh
      } else if (s.has(overlay)) {
        s.delete(overlay);
      } else {
        s.add(overlay);
      }

      dispatch(mapRefocus({ overlays: [...s] }));
    },
    [dispatch, handlePossibleFilterClick, overlays],
  );

  const handleBaseClick = (e: MouseEvent<HTMLButtonElement>) => {
    dispatch(
      mapRefocus({
        mapType: e.currentTarget.dataset['type'] as BaseLayerLetters,
      }),
    );
  };

  const handleOverlayClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (handlePossibleFilterClick(e)) {
      return;
    }

    const { type } = e.currentTarget.dataset;

    if (!is<OverlayLetters>(type)) {
      return;
    }

    const s = new Set(overlays);

    if (s.has(type)) {
      s.delete(type);
    } else {
      s.add(type);
    }

    dispatch(mapRefocus({ overlays: [...s] }));
  };

  const isWide = useMediaQuery({ query: '(min-width: 576px)' });

  const sc = useScrollClasses('vertical');

  const layersSettings = useSelector((state) => state.map.layersSettings);

  return (
    <>
      <ButtonGroup className="dropup d-none d-sm-inline-flex">
        {baseLayers
          .filter(
            (l) =>
              layersSettings[l.type]?.showInToolbar ??
              defaultToolbarLayerLetters.includes(l.type),
          )
          .map(({ type, icon }) => (
            <Button
              variant="secondary"
              title={m?.mapLayers.letters[type]}
              key={type}
              data-type={type}
              active={mapType === type}
              onClick={handleBaseClick}
            >
              {icon}
            </Button>
          ))}

        {overlayLayers
          .filter(
            (l) =>
              (l.type === 'i' && overlays.includes('i')) ||
              (l.type === 'I' && pictureFilterIsActive) ||
              (layersSettings[l.type]?.showInToolbar ??
                defaultToolbarLayerLetters.includes(l.type)),
          )
          .map(({ type, icon }) => (
            <Button
              variant="secondary"
              title={m?.mapLayers.letters[type]}
              key={type}
              data-type={type}
              active={overlays.includes(type)}
              onClick={handleOverlayClick}
            >
              {icon}

              {pictureFilterIsActive && type === 'I' && (
                <FaFilter
                  data-filter="1"
                  title={m?.mapLayers.photoFilterWarning}
                  className="text-warning ml-2"
                />
              )}

              {overlays.includes('i') && type === 'i' && (
                <FaExclamationTriangle
                  data-interactive="1"
                  title={m?.mapLayers.interactiveLayerWarning}
                  className="text-warning ml-2"
                />
              )}
            </Button>
          ))}

        <Button
          variant="secondary"
          ref={buttonRef}
          onClick={handleButtonClick}
          title={m?.mapLayers.layers}
          active={[mapType, ...overlays.filter((o) => o !== 'i')].some(
            (type) =>
              !(
                layersSettings[type]?.showInToolbar ??
                defaultToolbarLayerLetters.includes(type)
              ),
          )}
        >
          <FaEllipsisV />
        </Button>
      </ButtonGroup>

      <Button
        className="d-sm-none"
        ref={button2Ref}
        onClick={handleButtonClick}
        title={m?.mapLayers.layers}
        variant="primary"
      >
        <FaRegMap />
      </Button>

      <Overlay
        rootClose
        placement="top"
        show={!!show}
        onHide={handleHide}
        target={(isWide ? buttonRef.current : button2Ref.current) ?? null}
      >
        <Popover id="popover-map-switch" className="fm-menu">
          <Popover.Content className="fm-menu-scroller" ref={sc}>
            <div />

            <Dropdown.Item
              key="settings"
              as="button"
              onSelect={() => {
                setShow(false);

                dispatch(setActiveModal('mapSettings'));
              }}
            >
              <FaCog /> {m?.mapLayers.settings}
            </Dropdown.Item>

            <Dropdown.Divider />

            {
              // TODO base and overlay layers have too much duplicate code
              baseLayers
                .filter(({ adminOnly }) => isAdmin || !adminOnly)
                .filter(
                  (l) =>
                    mapType === l.type ||
                    show === 'all' ||
                    (layersSettings[l.type]?.showInMenu ??
                      defaultMenuLayerLetters.includes(l.type)),
                )
                .map(({ type, icon, minZoom, key }) => (
                  <Dropdown.Item
                    href={`?layers=${type}`}
                    key={type}
                    eventKey={type}
                    onSelect={handleMapSelect}
                    active={mapType === type}
                    style={{
                      opacity:
                        show === 'all' ||
                        (layersSettings[type]?.showInMenu ??
                          defaultMenuLayerLetters.includes(type))
                          ? 1
                          : 0.5,
                    }}
                  >
                    {mapType === type ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
                    {icon}{' '}
                    <span
                      style={{
                        textDecoration:
                          minZoom !== undefined && zoom < minZoom
                            ? 'line-through'
                            : 'none',
                      }}
                    >
                      {m?.mapLayers.letters[type]}
                    </span>
                    {getKbdShortcut(key)}
                    {minZoom !== undefined && zoom < minZoom && (
                      <FaExclamationTriangle
                        title={m?.mapLayers.minZoomWarning(minZoom)}
                        className="text-warning ml-1"
                      />
                    )}
                  </Dropdown.Item>
                ))
            }

            <Dropdown.Divider />

            {overlayLayers
              .filter(({ adminOnly }) => isAdmin || !adminOnly)
              .filter(
                (l) =>
                  overlays.includes(l.type) ||
                  show === 'all' ||
                  (layersSettings[l.type]?.showInMenu ??
                    defaultMenuLayerLetters.includes(l.type)),
              )
              .map(({ type, icon, minZoom, key }) => {
                const active =
                  type === 'i'
                    ? !overlays.includes(type)
                    : overlays.includes(type);

                return (
                  <Dropdown.Item
                    key={type}
                    as="button"
                    eventKey={type}
                    onSelect={handleOverlaySelect}
                    active={active}
                    style={{
                      opacity:
                        type === 'i' ||
                        show === 'all' ||
                        (layersSettings[type]?.showInMenu ??
                          defaultMenuLayerLetters.includes(type))
                          ? 1
                          : 0.5,
                    }}
                  >
                    {active ? <FaRegCheckSquare /> : <FaRegSquare />} {icon}{' '}
                    <span
                      style={{
                        textDecoration:
                          minZoom !== undefined && zoom < minZoom
                            ? 'line-through'
                            : 'none',
                      }}
                    >
                      {m?.mapLayers.letters[type]}
                    </span>
                    {getKbdShortcut(key)}
                    {minZoom !== undefined && zoom < minZoom && (
                      <FaExclamationTriangle
                        title={m?.mapLayers.minZoomWarning(minZoom)}
                        className="text-warning ml-1"
                      />
                    )}
                    {type === 'I' && pictureFilterIsActive && (
                      <FaFilter
                        data-filter="1"
                        title={m?.mapLayers.photoFilterWarning}
                        className="text-warning ml-1"
                      />
                    )}
                  </Dropdown.Item>
                );
              })}

            {show !== 'all' && (
              <>
                <Dropdown.Divider />
                <Dropdown.Item
                  onSelect={() => {
                    setShow('all');
                  }}
                >
                  {m?.mapLayers.showAll}
                </Dropdown.Item>
              </>
            )}
          </Popover.Content>
        </Popover>
      </Overlay>
    </>
  );
}
