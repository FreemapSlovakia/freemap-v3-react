import {
  Fragment,
  MouseEvent,
  ReactElement,
  SyntheticEvent,
  useCallback,
  useState,
} from 'react';
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import { BiWorld } from 'react-icons/bi';
import {
  FaCog,
  FaEllipsisV,
  FaEyeSlash,
  FaFilter,
  FaGem,
  FaRegCheckCircle,
  FaRegCircle,
  FaRegMap,
  FaSearchPlus,
} from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { setActiveModal } from '../actions/mainActions.js';
import { mapToggleLayer } from '../actions/mapActions.js';
import { fixedPopperConfig } from '../fixedPopperConfig.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useBecomePremium } from '../hooks/useBecomePremium.js';
import { useScrollClasses } from '../hooks/useScrollClasses.js';
import { useMessages } from '../l10nInjector.js';
import { integratedLayerDefs } from '../mapDefinitions.js';
import { isPremium } from '../premium.js';
import { Checkbox } from './Checkbox.js';
import { countryCodeToFlag, Emoji } from './Emoji.js';
import { ExperimentalFunction } from './ExperimentalFunction.js';
import { LongPressTooltip } from './LongPressTooltip.js';

function getKbdShortcut(kbd?: readonly [string, boolean]) {
  return (
    kbd && (
      <kbd className="ms-1">
        {kbd[1] ? '⇧' : ''}
        {kbd[0].replace(/Key|Digit/, '').toLowerCase()}
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
        dispatch(mapToggleLayer({ type: selection.slice(6) }));
      }
    },
    [dispatch, handlePossibleFilterClick],
  );

  const handleLayerButtonClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (handlePossibleFilterClick(e)) {
        return;
      }

      const { type } = e.currentTarget.dataset;

      if (type) {
        dispatch(mapToggleLayer({ type }));
      }
    },
    [dispatch, handlePossibleFilterClick],
  );

  const isWide = useMediaQuery({ query: '(min-width: 576px)' });

  const sc = useScrollClasses('vertical');

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const countries = useAppSelector((state) => state.map.countries);

  const countriesSet = countries && new Set(countries);

  const layerDefs = [
    ...integratedLayerDefs,
    ...customLayers.map((cl) => ({
      icon: <MdDashboardCustomize />,
      kbd: ['Digit' + cl.type.slice(1), false] as [string, boolean],
      adminOnly: false,
      premiumFromZoom: undefined,
      experimental: undefined,
      countries: undefined,
      defaultInToolbar: false,
      defaultInMenu: false,
      ...cl,
    })),
  ].map((def) => ({
    scaleWithDpi: false,
    ...def,
    countryOk:
      !countriesSet ||
      !def.countries ||
      def.countries.some((c) => countriesSet.has(c)),
    zoomOk: def.minZoom === undefined || zoom >= def.minZoom,
  }));

  const handleToggle = useCallback((nextShow: boolean) => {
    setShow(nextShow);
  }, []);

  function commonBadges(def: (typeof layerDefs)[number]) {
    return (
      <>
        {def.experimental && (
          <ExperimentalFunction data-interactive="1" className="ms-1" />
        )}

        {!def.zoomOk && (
          <FaSearchPlus
            title={m?.mapLayers.minZoomWarning(def.minZoom!)}
            className="text-warning ms-1"
          />
        )}

        {!def.countryOk && (
          <BiWorld
            // title={m?.mapLayers.countryWarning(rest.countries)} // TODO
            className="text-warning ms-1"
          />
        )}

        {def.type === 'I' && pictureFilterIsActive && (
          <FaFilter
            data-filter="1"
            title={m?.mapLayers.photoFilterWarning}
            className="text-warning ms-1"
          />
        )}

        {activeLayers.includes('i') && def.type === 'i' && (
          <FaEyeSlash
            data-interactive="1"
            title={m?.mapLayers.interactiveLayerWarning}
            className="text-warning ms-1"
          />
        )}
      </>
    );
  }

  function layersMemuItems(layer: 'base' | 'overlay') {
    let first = true;

    return layerDefs
      .filter((def) => def.layer === layer)
      .map((def) => {
        if (!isAdmin && def.adminOnly) {
          return null;
        }

        const { type } = def;

        const showInMenu =
          layersSettings[type]?.showInMenu ?? !!def.defaultInMenu;

        if (
          show !== 'all' &&
          !activeLayers.includes(type) &&
          (!showInMenu || !def.countryOk || !def.zoomOk)
        ) {
          return null;
        }

        const active = (type === 'i') !== activeLayers.includes(type);

        const wasFirst = first;

        first = false;

        return (
          <Fragment key={type}>
            {wasFirst && <Dropdown.Divider />}

            <Dropdown.Item
              href={`?layers=${type}`}
              eventKey={'layer-' + type}
              active={active}
              className={showInMenu ? '' : 'text-secondary'}
            >
              {def.layer === 'base' ? (
                <Checkbox value={active} />
              ) : active ? (
                <FaRegCheckCircle />
              ) : (
                <FaRegCircle />
              )}

              <span className="px-2">{def.icon}</span>

              <span
                className={
                  !def.zoomOk || !def.countryOk
                    ? 'text-decoration-line-through'
                    : ''
                }
              >
                {(type.startsWith('.')
                  ? m?.mapLayers.customBase + ' ' + type.slice(1)
                  : type.startsWith(':')
                    ? m?.mapLayers.customOverlay + ' ' + type.slice(1)
                    : m?.mapLayers.letters[type]) ?? '…'}

                {def.type !== 'X' &&
                  def.countries?.map((country) => (
                    <Emoji className="ms-1" key="country">
                      {countryCodeToFlag(country)}
                    </Emoji>
                  ))}
              </span>

              {getKbdShortcut(def.kbd)}

              {def.premiumFromZoom !== undefined &&
              zoom >= def.premiumFromZoom - (def.scaleWithDpi ? 1 : 0) ? (
                <FaGem
                  className={
                    'ms-1 ' + (premium ? 'text-success' : 'text-warning')
                  }
                  title={premium ? undefined : m?.premium.premiumOnly}
                  onClickCapture={premium ? undefined : becomePremium}
                />
              ) : null}

              {commonBadges(def)}
            </Dropdown.Item>
          </Fragment>
        );
      });
  }

  return (
    <>
      <div className="d-none d-sm-block me-1">{m?.mapLayers.switch}</div>

      <ButtonGroup>
        {(isWide ? layerDefs : []).map((def) => {
          const { type } = def;

          const showInToolbar =
            layersSettings[def.type]?.showInToolbar ?? !!def.defaultInToolbar;

          if (
            !activeLayers.includes(def.type) &&
            (!def.countryOk || !def.zoomOk || !showInToolbar)
          ) {
            return null;
          }

          return (
            <LongPressTooltip
              key={type}
              label={
                type.startsWith('.')
                  ? m?.mapLayers.customBase + ' ' + type.slice(1)
                  : type.startsWith(':')
                    ? m?.mapLayers.customOverlay + ' ' + type.slice(1)
                    : m?.mapLayers.letters[type]
              }
            >
              {({ props }) => (
                <Button
                  variant="secondary"
                  key={type}
                  data-type={type}
                  active={activeLayers.includes(type)}
                  onClick={handleLayerButtonClick}
                  {...props}
                >
                  {def.icon}

                  {!premium &&
                  def.premiumFromZoom !== undefined &&
                  zoom >= def.premiumFromZoom - (def.scaleWithDpi ? 1 : 0) ? (
                    <FaGem
                      className="ms-1 text-warning"
                      title={premium ? undefined : m?.premium.premiumOnly}
                      onClick={premium ? undefined : becomePremium}
                    />
                  ) : null}

                  {commonBadges(def)}
                </Button>
              )}
            </LongPressTooltip>
          );
        })}

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

              {layersMemuItems('base')}

              {layersMemuItems('overlay')}

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
