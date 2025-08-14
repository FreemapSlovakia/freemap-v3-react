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
  FaHistory,
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
import { Shortcut } from '../types/common.js';
import { Checkbox } from './Checkbox.js';
import { countryCodeToFlag, Emoji } from './Emoji.js';
import { ExperimentalFunction } from './ExperimentalFunction.js';
import { LongPressTooltip } from './LongPressTooltip.js';
import { formatShortcut } from './ShortcutRecorder.js';

function getKbdShortcut(shortcut?: Shortcut | null) {
  return shortcut && <kbd className="ms-1">{formatShortcut(shortcut)}</kbd>;
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

  const [show, setShow] = useState<boolean | 'more' | 'all'>(false);

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

      if (selection === 'show-all') {
        setShow('all');
      } else if (selection === 'show-more') {
        setShow('more');
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

  const customLayerDefs = useAppSelector((state) => state.map.customLayers);

  const countries = useAppSelector((state) => state.map.countries);

  const countriesSet = countries && new Set(countries);

  const layerDefs = [
    ...integratedLayerDefs.map((def) => ({
      ...def,
      custom: false,
      name: undefined,
    })),
    ...customLayerDefs.map((def) => ({
      ...def,
      custom: true,
      icon: <MdDashboardCustomize />,
      kbd: undefined,
      adminOnly: false,
      premiumFromZoom: undefined,
      experimental: undefined,
      countries: undefined,
      defaultInToolbar: false,
      defaultInMenu: false,
      superseededBy: undefined,
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

  function commonBadges(
    def: (typeof layerDefs)[number],
    place: 'menu' | 'toolbar' | 'tooltip',
  ) {
    return (
      <>
        {place === 'toolbar' &&
        !premium &&
        def.premiumFromZoom !== undefined &&
        zoom >= def.premiumFromZoom - (def.scaleWithDpi ? 1 : 0) ? (
          <FaGem
            className="ms-1 text-warning"
            title={premium ? undefined : m?.premium.premiumOnly}
            onClick={premium ? undefined : becomePremium}
          />
        ) : null}

        {place !== 'toolbar' &&
          def.type !== 'X' &&
          def.countries?.map((country) => (
            <Emoji className="ms-1" key={country}>
              {countryCodeToFlag(country)}
            </Emoji>
          ))}

        {place !== 'toolbar' &&
          getKbdShortcut(
            layersSettings[def.type]?.shortcut === undefined
              ? def.shortcut
              : layersSettings[def.type].shortcut,
          )}

        {(place === 'menu' || (place === 'tooltip' && premium)) &&
        def.premiumFromZoom !== undefined &&
        zoom >= def.premiumFromZoom - (def.scaleWithDpi ? 1 : 0) ? (
          <FaGem
            className={'ms-1 ' + (premium ? 'text-success' : 'text-warning')}
            title={premium ? undefined : m?.premium.premiumOnly}
            onClickCapture={premium ? undefined : becomePremium}
          />
        ) : null}

        {place !== 'toolbar' && def.superseededBy && (
          <FaHistory className="text-warning ms-1" title={m?.maps.legacy} />
        )}

        {place !== 'toolbar' && def.experimental && (
          <ExperimentalFunction data-interactive="1" className="ms-1" />
        )}

        {place !== 'tooltip' && !def.zoomOk && (
          <FaSearchPlus
            title={m?.mapLayers.minZoomWarning(def.minZoom!)}
            className="text-warning ms-1"
          />
        )}

        {place !== 'tooltip' && !def.countryOk && (
          <BiWorld
            title={m?.mapLayers.countryWarning(def.countries!)}
            className="text-warning ms-1"
          />
        )}

        {place !== 'tooltip' && def.type === 'I' && pictureFilterIsActive && (
          <FaFilter
            data-filter="1"
            title={m?.mapLayers.photoFilterWarning}
            className="text-warning ms-1"
          />
        )}

        {place !== 'tooltip' &&
          activeLayers.includes('i') &&
          def.type === 'i' && (
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

        const showInToolbar =
          layersSettings[type]?.showInToolbar ?? !!def.defaultInToolbar;

        if (
          show !== 'all' &&
          !activeLayers.includes(type) &&
          (!(show === true && !isWide ? showInToolbar : showInMenu) ||
            !def.countryOk ||
            !def.zoomOk)
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
                {def.custom
                  ? def.name || m?.mapLayers.customBase + ' ' + type
                  : (m?.mapLayers.letters[type] ?? '…')}
              </span>

              {commonBadges(def, 'menu')}
            </Dropdown.Item>
          </Fragment>
        );
      });
  }

  let showsOfm = false;

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
            (!def.countryOk ||
              !def.zoomOk ||
              !showInToolbar ||
              (type === 'S' &&
                showsOfm &&
                countries?.every(
                  (country) => country === 'sk' || country === 'cz',
                )))
          ) {
            return null;
          }

          if (type === 'Z') {
            showsOfm = true;
          }

          return (
            <LongPressTooltip
              key={type}
              label={
                <>
                  {def.custom
                    ? def.name || m?.mapLayers.customBase + ' ' + type
                    : (m?.mapLayers.letters[type] ?? '…')}

                  {commonBadges(def, 'tooltip')}
                </>
              }
            >
              {({ props }) => (
                <Button
                  variant="secondary"
                  key={type}
                  data-type={type}
                  active={(type === 'i') !== activeLayers.includes(type)}
                  onClick={handleLayerButtonClick}
                  {...props}
                >
                  {def.icon}

                  {commonBadges(def, 'toolbar')}
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
                <FaCog /> {m?.mapLayers.settings} <kbd>g</kbd> <kbd>s</kbd>
              </Dropdown.Item>

              {layersMemuItems('base')}

              {layersMemuItems('overlay')}

              {(show === true || show === 'more') && (
                <>
                  <Dropdown.Divider />

                  {!isWide && show === true ? (
                    <Dropdown.Item eventKey="show-more">
                      {m?.mapLayers.showMore}
                    </Dropdown.Item>
                  ) : (
                    <Dropdown.Item eventKey="show-all">
                      {m?.mapLayers.showAll}
                    </Dropdown.Item>
                  )}
                </>
              )}
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </ButtonGroup>
    </>
  );
}
