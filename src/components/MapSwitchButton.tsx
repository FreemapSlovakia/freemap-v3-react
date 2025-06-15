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
  FaDownload,
  FaEllipsisV,
  FaExclamationTriangle,
  FaFilter,
  FaGem,
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
import { useBecomePremium } from '../hooks/useBecomePremium.js';
import { useScrollClasses } from '../hooks/useScrollClasses.js';
import { useMessages } from '../l10nInjector.js';
import {
  BaseLayerLetters,
  baseLayers,
  CustomBaseLayerDef,
  CustomOverlayLayerDef,
  defaultMenuLayerLetters,
  defaultToolbarLayerLetters,
  HasScaleWithDpi,
  IsCommonLayerDef,
  IsIntegratedLayerDef,
  IntegratedLayerLetters,
  overlayLayers,
  OverlayLetters,
} from '../mapDefinitions.js';
import { isPremium } from '../premium.js';
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
    Object.values(state.gallery.filter).some((x) => x !== undefined),
  );

  const isAdmin = useAppSelector((state) => !!state.auth.user?.isAdmin);

  const premium = useAppSelector((state) => isPremium(state.auth.user));

  const becomePremium = useBecomePremium();

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
      } else if (selection === 'downloadMap') {
        setShow(false);

        dispatch(setActiveModal('download-map'));
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
      .filter((cl): cl is CustomBaseLayerDef => cl.type.startsWith('.'))
      .map((cl) => ({
        ...cl,
        adminOnly: false,
        icon: <MdDashboardCustomize />,
        key: ['Digit' + cl.type.slice(1), false] as [string, boolean],
        premiumFromZoom: undefined,
        experimental: undefined,
      })),
  ];

  const ovls = [
    ...overlayLayers,
    ...customLayers
      .filter((cl): cl is CustomOverlayLayerDef => cl.type.startsWith(':'))
      .map((cl) => ({
        ...cl,
        adminOnly: false,
        icon: <MdDashboardCustomize />,
        key: ['Digit' + cl.type.slice(1), true] as [string, boolean],
        premiumFromZoom: undefined,
        experimental: undefined,
      })),
  ];

  const handleToggle = useCallback((nextShow: boolean) => {
    setShow(nextShow);
  }, []);

  function commonBadges({
    icon,
    experimental,
    premiumFromZoom,
    scaleWithDpi,
  }: Pick<IsIntegratedLayerDef, 'icon' | 'experimental' | 'premiumFromZoom'> &
    HasScaleWithDpi) {
    return (
      <>
        {icon}

        {experimental && (
          <FaExclamationTriangle
            data-interactive="1"
            title={m?.general.experimentalFunction}
            className="text-warning ms-1"
          />
        )}

        {!premium &&
        premiumFromZoom !== undefined &&
        zoom >= premiumFromZoom - (scaleWithDpi ? 1 : 0) ? (
          <FaGem
            className="ms-1 text-warning"
            title={premium ? undefined : m?.premium.premiumOnly}
            onClick={premium ? undefined : becomePremium}
          />
        ) : null}
      </>
    );
  }

  function menuItemCommons(
    {
      key,
      icon,
      premiumFromZoom,
      scaleWithDpi,
      minZoom,
      experimental,
    }: Pick<
      IsIntegratedLayerDef,
      'icon' | 'key' | 'premiumFromZoom' | 'experimental'
    > &
      HasScaleWithDpi &
      IsCommonLayerDef,
    name = '…',
  ) {
    return (
      <>
        <span className="px-2">{icon}</span>

        <span
          style={{
            textDecoration:
              minZoom !== undefined && zoom < minZoom ? 'line-through' : 'none',
          }}
        >
          {name}
        </span>

        {getKbdShortcut(key)}

        {experimental && (
          <FaExclamationTriangle
            data-interactive="1"
            title={m?.general.experimentalFunction}
            className="text-warning ms-1"
          />
        )}

        {premiumFromZoom !== undefined &&
        zoom >= premiumFromZoom - (scaleWithDpi ? 1 : 0) ? (
          <FaGem
            className={'ms-1 ' + (premium ? 'text-success' : 'text-warning')}
            title={premium ? undefined : m?.premium.premiumOnly}
            onClickCapture={premium ? undefined : becomePremium}
          />
        ) : null}

        {minZoom !== undefined && zoom < minZoom && (
          <FaExclamationTriangle
            title={m?.mapLayers.minZoomWarning(minZoom)}
            className="text-warning ms-1"
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="d-none d-sm-block me-1">{m?.mapLayers.switch}</div>

      <ButtonGroup>
        {(isWide ? bases : [])
          .filter(
            ({ type }) =>
              (layersSettings[type]?.showInToolbar ??
                defaultToolbarLayerLetters.includes(type)) ||
              mapType === type,
          )
          .map(({ type, ...rest }) => (
            <Button
              variant="secondary"
              title={
                type.startsWith('.')
                  ? m?.mapLayers.customBase + ' ' + type.slice(1)
                  : m?.mapLayers.letters[type as IntegratedLayerLetters]
              }
              key={type}
              data-type={type}
              active={mapType === type}
              onClick={handleBaseClick}
            >
              {commonBadges({ scaleWithDpi: false, ...rest })}
            </Button>
          ))}

        {(isWide ? ovls : [])
          .filter(
            (l) =>
              (l.type === 'i' && overlays.includes('i')) ||
              (l.type === 'I' && pictureFilterIsActive) ||
              (layersSettings[l.type]?.showInToolbar ??
                defaultToolbarLayerLetters.includes(l.type)) ||
              overlays.includes(l.type),
          )
          .map(({ type, ...rest }) => (
            <Button
              variant="secondary"
              title={
                type.startsWith(':')
                  ? m?.mapLayers.customOverlay + ' ' + type.slice(1)
                  : m?.mapLayers.letters[type as IntegratedLayerLetters]
              }
              key={type}
              data-type={type}
              active={overlays.includes(type as OverlayLetters)}
              onClick={handleOverlayClick}
            >
              {commonBadges({ scaleWithDpi: false, ...rest })}

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
          show={!!show}
          drop="up-centered"
          onSelect={handleSelect}
          autoClose="outside"
          onToggle={handleToggle}
          as={ButtonGroup}
        >
          <Dropdown.Toggle
            title={m?.mapLayers.layers}
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

              <Dropdown.Item
                key="downloadMap"
                as="button"
                eventKey="downloadMap"
              >
                <FaDownload /> {m?.mapLayers.downloadMap}
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
                  .map(({ type, ...rest }) => (
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
                      )}

                      {menuItemCommons(
                        rest,
                        type.startsWith('.')
                          ? m?.mapLayers.customBase + ' ' + type.slice(1)
                          : m?.mapLayers.letters[
                              type as IntegratedLayerLetters
                            ],
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
                .map(({ type, ...rest }) => {
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
                      <Checkbox value={active} />

                      {menuItemCommons(
                        rest,
                        type.startsWith(':')
                          ? m?.mapLayers.customOverlay + ' ' + type.slice(1)
                          : m?.mapLayers.letters[
                              type as IntegratedLayerLetters
                            ],
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
