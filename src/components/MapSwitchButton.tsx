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
  FaGem,
  FaRegCheckCircle,
  FaRegCircle,
  FaRegMap,
} from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { setActiveModal } from '../actions/mainActions.js';
import { mapRefocus } from '../actions/mapActions.js';
import { fixedPopperConfig } from '../fixedPopperConfig.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useBecomePremium } from '../hooks/useBecomePremium.js';
import { useScrollClasses } from '../hooks/useScrollClasses.js';
import { useMessages } from '../l10nInjector.js';
import {
  defaultMenuLayerLetters,
  defaultToolbarLayerLetters,
  HasScaleWithDpi,
  integratedLayerDefs,
  IntegratedLayerLetters,
  IsCommonLayerDef,
  IsIntegratedLayerDef,
} from '../mapDefinitions.js';
import { isPremium } from '../premium.js';
import { Checkbox } from './Checkbox.js';
import { ExperimentalFunction } from './ExperimentalFunction.js';
import { LongPressTooltip } from './LongPressTooltip.js';

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

  const activeLayers = useAppSelector((state) => state.map.layers);

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

        dispatch(setActiveModal('map-settings'));
      } else if (selection.startsWith('layer-')) {
        const layer = selection.slice(6);

        // if (baseLayerLetters.includes(layer) || layer.startsWith('.')) {
        // }

        const s = new Set(activeLayers);

        if (s.has(layer)) {
          s.delete(layer);
        } else {
          s.add(layer);
        }

        dispatch(mapRefocus({ layers: [...s] }));
      }
    },
    [dispatch, handlePossibleFilterClick, activeLayers],
  );

  const handleLayerButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (handlePossibleFilterClick(e)) {
      return;
    }

    const { type } = e.currentTarget.dataset;

    if (!type) {
      return;
    }

    const s = new Set(activeLayers);

    if (s.has(type)) {
      s.delete(type);
    } else {
      s.add(type);
    }

    dispatch(mapRefocus({ layers: [...s] }));
  };

  const isWide = useMediaQuery({ query: '(min-width: 576px)' });

  const sc = useScrollClasses('vertical');

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const layerDefs = [
    ...integratedLayerDefs,
    ...customLayers.map((cl) => ({
      ...cl,
      adminOnly: false,
      icon: <MdDashboardCustomize />,
      key: ['Digit' + cl.type.slice(1), false] as [string, boolean],
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
          <ExperimentalFunction data-interactive="1" className="ms-1" />
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
          <ExperimentalFunction data-interactive="1" className="ms-1" />
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

  let lastLayer: undefined | 'base' | 'overlay';

  return (
    <>
      <div className="d-none d-sm-block me-1">{m?.mapLayers.switch}</div>

      <ButtonGroup>
        {(isWide ? layerDefs : [])
          .filter(
            ({ type }) =>
              (layersSettings[type]?.showInToolbar ??
                defaultToolbarLayerLetters.includes(type)) ||
              activeLayers.includes(type),
          )
          .map(({ type, ...rest }) => (
            <LongPressTooltip
              key={type}
              label={
                type.startsWith('.')
                  ? m?.mapLayers.customBase + ' ' + type.slice(1)
                  : type.startsWith(':')
                    ? m?.mapLayers.customOverlay + ' ' + type.slice(1)
                    : m?.mapLayers.letters[type as IntegratedLayerLetters]
              }
            >
              {({ props }) => (
                <Button
                  variant="secondary"
                  title={
                    type.startsWith('.')
                      ? m?.mapLayers.customBase + ' ' + type.slice(1)
                      : type.startsWith(':')
                        ? m?.mapLayers.customOverlay + ' ' + type.slice(1)
                        : m?.mapLayers.letters[type as IntegratedLayerLetters]
                  }
                  key={type}
                  data-type={type}
                  active={activeLayers.includes(type)}
                  onClick={handleLayerButtonClick}
                  {...props}
                >
                  {commonBadges({ scaleWithDpi: false, ...rest })}

                  {pictureFilterIsActive && type === 'I' && (
                    <FaFilter
                      data-filter="1"
                      title={m?.mapLayers.photoFilterWarning}
                      className="text-warning ms-2"
                    />
                  )}

                  {activeLayers.includes('i') && type === 'i' && (
                    <FaExclamationTriangle
                      data-interactive="1"
                      title={m?.mapLayers.interactiveLayerWarning}
                      className="text-warning ms-2"
                    />
                  )}
                </Button>
              )}
            </LongPressTooltip>
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

              <Dropdown.Divider />

              {layerDefs
                .filter(({ adminOnly }) => isAdmin || !adminOnly)
                .filter(
                  (l) =>
                    show === 'all' ||
                    activeLayers.includes(l.type) ||
                    (layersSettings[l.type]?.showInMenu ??
                      defaultMenuLayerLetters.includes(l.type)),
                )
                .map(({ type, layer, ...rest }) => {
                  const active = (type === 'i') !== activeLayers.includes(type);

                  const oldLastLayer = lastLayer;

                  lastLayer = layer;

                  return (
                    <>
                      {oldLastLayer && oldLastLayer !== lastLayer && (
                        <Dropdown.Divider />
                      )}

                      <Dropdown.Item
                        href={`?layers=${type}`}
                        key={type}
                        eventKey={'layer-' + type}
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
                        {layer === 'base' ? (
                          <Checkbox value={active} />
                        ) : active ? (
                          <FaRegCheckCircle />
                        ) : (
                          <FaRegCircle />
                        )}

                        {menuItemCommons(
                          rest,
                          type.startsWith('.')
                            ? m?.mapLayers.customBase + ' ' + type.slice(1)
                            : type.startsWith(':')
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
                    </>
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
