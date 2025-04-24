import {
  MouseEvent,
  ReactElement,
  SyntheticEvent,
  useCallback,
  useState,
} from 'react';
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import {
  FaCog,
  FaEllipsisV,
  FaExclamationTriangle,
  FaFilter,
  FaRegCheckCircle,
  FaRegCircle,
  FaRegMap,
} from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { is } from 'typia';
import { setActiveModal } from '../actions/mainActions.js';
import { mapRefocus } from '../actions/mapActions.js';
import { fixedPopperConfig } from '../fixedPopperConfig.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { useScrollClasses } from '../hooks/useScrollClasses.js';
import { useMessages } from '../l10nInjector.js';
import {
  BaseLayerLetters,
  baseLayers,
  defaultMenuLayerLetters,
  defaultToolbarLayerLetters,
  NoncustomLayerLetters,
  overlayLayers,
  OverlayLetters,
} from '../mapDefinitions.js';
import { Checkbox } from './Checkbox.js';

function getKbdShortcut(key?: readonly [string, boolean]) {
  return (
    key && (
      <kbd className="ms-1">
        {key[1] ? '⇧' : ''}
        {key[0].replace(/Key|Digit/, '').toLowerCase()}
      </kbd>
    )
  );
}

export function MapSwitchButton(): ReactElement {
  const m = useMessages();

  const zoom = useAppSelector((state) => state.map.zoom);

  const mapType = useAppSelector((state) => state.map.mapType);

  const overlays = useAppSelector((state) => state.map.overlays);

  const pictureFilterIsActive = useAppSelector((state) =>
    Object.values(state.gallery.filter).some((x) => x),
  );

  const isAdmin = useAppSelector((state) => !!state.auth.user?.isAdmin);

  const dispatch = useDispatch();

  const [show, setShow] = useState<boolean | 'all'>(false);

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

  const handleSelect = useCallback(
    (selection: string | null, e: SyntheticEvent<unknown>) => {
      e.preventDefault();

      if (selection === null || handlePossibleFilterClick(e)) {
        setShow(false);

        return;
      }

      if (selection === 'all') {
        setShow('all');
      } else if (selection === 'mapSettings') {
        setShow(false);

        dispatch(setActiveModal('mapSettings'));
      } else if (selection.startsWith('b')) {
        const base = selection.slice(1);

        if (mapType !== base && is<BaseLayerLetters>(base)) {
          dispatch(mapRefocus({ mapType: base }));
        }
      } else if (selection.startsWith('o')) {
        const overlay = selection.slice(1);

        const s = new Set(overlays);

        if (!is<OverlayLetters>(overlay)) {
          // uh-oh
        } else if (s.has(overlay)) {
          s.delete(overlay);
        } else {
          s.add(overlay);
        }

        dispatch(mapRefocus({ overlays: [...s] }));
      }
    },
    [dispatch, handlePossibleFilterClick, mapType, overlays],
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

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const bases = [
    ...baseLayers,
    ...customLayers
      .filter((cl) => cl.type.startsWith('.'))
      .map((cl) => ({
        ...cl,
        adminOnly: false,
        icon: <MdDashboardCustomize />,
        key: ['Digit' + cl.type.slice(1), false] as const,
      })),
  ];

  const ovls = [
    ...overlayLayers,
    ...customLayers
      .filter((cl) => cl.type.startsWith(':'))
      .map((cl) => ({
        ...cl,
        adminOnly: false,
        icon: <MdDashboardCustomize />,
        key: ['Digit' + cl.type.slice(1), true] as const,
      })),
  ];

  const handleToggle = useCallback((nextShow: boolean) => {
    setShow(nextShow);
  }, []);

  return (
    <>
      <div className="d-none d-sm-block me-1">{m?.mapLayers.switch}</div>

      <ButtonGroup>
        {(isWide ? bases : [])
          .filter(
            ({ type }) =>
              layersSettings[type]?.showInToolbar ??
              defaultToolbarLayerLetters.includes(type),
          )
          .map(({ type, icon }) => (
            <Button
              variant="secondary"
              title={
                type.startsWith('.')
                  ? m?.mapLayers.customBase + ' ' + type.slice(1)
                  : m?.mapLayers.letters[type as NoncustomLayerLetters]
              }
              key={type}
              data-type={type}
              active={mapType === type}
              onClick={handleBaseClick}
            >
              {icon}
            </Button>
          ))}

        {(isWide ? ovls : [])
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
              title={
                type.startsWith(':')
                  ? m?.mapLayers.customOverlay + ' ' + type.slice(1)
                  : m?.mapLayers.letters[type as NoncustomLayerLetters]
              }
              key={type}
              data-type={type}
              active={overlays.includes(type as OverlayLetters)}
              onClick={handleOverlayClick}
            >
              {icon}

              {pictureFilterIsActive && type === 'I' && (
                <FaFilter
                  data-filter="1"
                  title={m?.mapLayers.photoFilterWarning}
                  className="text-warning ms-2"
                />
              )}

              {overlays.includes('i') && type === 'i' && (
                <FaExclamationTriangle
                  data-interactive="1"
                  title={m?.mapLayers.interactiveLayerWarning}
                  className="text-warning ms-2"
                />
              )}
            </Button>
          ))}

        <Dropdown
          title={m?.mapLayers.layers}
          show={!!show}
          drop="up-centered"
          onSelect={handleSelect}
          autoClose="outside"
          onToggle={handleToggle}
          as={ButtonGroup}
        >
          <Dropdown.Toggle
            bsPrefix="fm-dropdown-toggle-nocaret"
            variant={isWide ? 'secondary' : 'primary'}
          >
            <FaEllipsisV className="d-none d-sm-block" />
            <FaRegMap className="d-sm-none" />
          </Dropdown.Toggle>

          <Dropdown.Menu popperConfig={fixedPopperConfig}>
            <div className="fm-menu-scroller" ref={sc}>
              <div />

              <Dropdown.Item
                key="mapSettings"
                as="button"
                eventKey="mapSettings"
              >
                <FaCog /> {m?.mapLayers.settings}
              </Dropdown.Item>

              <Dropdown.Divider />

              {
                // TODO base and overlay layers have too much duplicate code
                bases
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
                      eventKey={'b' + type}
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
                      {mapType === type ? (
                        <FaRegCheckCircle />
                      ) : (
                        <FaRegCircle />
                      )}{' '}
                      {icon}{' '}
                      <span
                        style={{
                          textDecoration:
                            minZoom !== undefined && zoom < minZoom
                              ? 'line-through'
                              : 'none',
                        }}
                      >
                        {type.startsWith('.')
                          ? m?.mapLayers.customBase + ' ' + type.slice(1)
                          : m?.mapLayers.letters[type as NoncustomLayerLetters]}
                      </span>
                      {getKbdShortcut(key)}
                      {minZoom !== undefined && zoom < minZoom && (
                        <FaExclamationTriangle
                          title={m?.mapLayers.minZoomWarning(minZoom)}
                          className="text-warning ms-1"
                        />
                      )}
                    </Dropdown.Item>
                  ))
              }

              <Dropdown.Divider />

              {ovls
                .filter(({ adminOnly }) => isAdmin || !adminOnly)
                .filter(
                  (l) =>
                    overlays.includes(l.type as OverlayLetters) ||
                    show === 'all' ||
                    (layersSettings[l.type]?.showInMenu ??
                      defaultMenuLayerLetters.includes(l.type)),
                )
                .map(({ type, icon, minZoom, key }) => {
                  const active =
                    (type === 'i') !==
                    overlays.includes(type as OverlayLetters);

                  return (
                    <Dropdown.Item
                      key={type}
                      as="button"
                      eventKey={'o' + type}
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
                      <Checkbox value={active} /> {icon}{' '}
                      <span
                        style={{
                          textDecoration:
                            minZoom !== undefined && zoom < minZoom
                              ? 'line-through'
                              : 'none',
                        }}
                      >
                        {type.startsWith(':')
                          ? m?.mapLayers.customOverlay + ' ' + type.slice(1)
                          : m?.mapLayers.letters[type as NoncustomLayerLetters]}
                      </span>
                      {getKbdShortcut(key)}
                      {minZoom !== undefined && zoom < minZoom && (
                        <FaExclamationTriangle
                          title={m?.mapLayers.minZoomWarning(minZoom)}
                          className="text-warning ms-1"
                        />
                      )}
                      {type === 'I' && pictureFilterIsActive && (
                        <FaFilter
                          data-filter="1"
                          title={m?.mapLayers.photoFilterWarning}
                          className="text-warning ms-1"
                        />
                      )}
                    </Dropdown.Item>
                  );
                })}

              {show !== 'all' && (
                <>
                  <Dropdown.Divider />

                  <Dropdown.Item eventKey="all">
                    {m?.mapLayers.showAll}
                  </Dropdown.Item>
                </>
              )}
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </ButtonGroup>
    </>
  );
}
