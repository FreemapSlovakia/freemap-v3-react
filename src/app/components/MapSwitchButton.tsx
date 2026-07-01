import { hasRole } from '@features/auth/model/types.js';
import { cachedMapsSetView } from '@features/cachedMaps/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { SubmenuHeader } from '@features/mainMenu/components/SubmenuHeader.js';
import {
  mapFitBbox,
  mapRefocus,
  mapToggleLayer,
} from '@features/map/model/actions.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { useBecomePremium } from '@features/premium/hooks/useBecomePremium.js';
import { isPremium } from '@features/premium/premium.js';
import { usePremiumMessages } from '@features/premium/translations/usePremiumMessages.js';
import { Checkbox } from '@shared/components/Checkbox.js';
import { countryCodeToFlag, Emoji } from '@shared/components/Emoji.js';
import { ExperimentalFunction } from '@shared/components/ExperimentalFunction.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { formatShortcut } from '@shared/components/ShortcutRecorder.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { formatSize } from '@shared/formatSize.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import {
  modalMenuItemProps,
  useMenuHandler,
} from '@shared/hooks/useMenuHandler.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import {
  getCountriesBbox,
  getLayerBbox,
  integratedLayerDefs,
} from '@shared/mapDefinitions.js';
import { removeAccents } from '@shared/stringUtils.js';
import { Shortcut } from '@shared/types/common.js';
import clsx from 'clsx';
import {
  ChangeEvent,
  Fragment,
  MouseEvent,
  ReactElement,
  ReactNode,
  SyntheticEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Button, ButtonGroup, Dropdown, Form } from 'react-bootstrap';
import { BiWifiOff, BiWorld } from 'react-icons/bi';
import {
  FaChevronRight,
  FaCog,
  FaEllipsisV,
  FaEyeSlash,
  FaFilter,
  FaGem,
  FaHistory,
  FaLayerGroup,
  FaRegCheckCircle,
  FaRegCircle,
  FaRegMap,
  FaSearchPlus,
} from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { setActiveModal } from '../store/actions.js';

function getKbdShortcut(shortcut?: Shortcut | null) {
  return shortcut && <kbd className="ms-1">{formatShortcut(shortcut)}</kbd>;
}

export function MapSwitchButton(): ReactElement {
  const m = useMessages();

  const zoom = useAppSelector((state) => state.map.zoom);

  const lat = useAppSelector((state) => state.map.lat);

  const lon = useAppSelector((state) => state.map.lon);

  const activeLayers = useAppSelector((state) => state.map.layers);

  const pictureFilterIsActive = useAppSelector((state) =>
    Object.values(state.gallery.filter).some((x) => x !== undefined),
  );

  // while picking a photo position or drawing a map-area rectangle, restrict the
  // map switcher to plain layer switching (no offline maps / settings)
  const restrictToMapSwitching = useAppSelector(
    (state) =>
      state.gallery.pickingPositionForId !== null ||
      state.mapArea.selecting !== null,
  );

  const canPreviewLayers = useAppSelector((state) =>
    hasRole(state.auth.user, 'layerPreview'),
  );

  const premium = useAppSelector((state) => isPremium(state.auth.user));

  // undefined when the user is already premium
  const becomePremium = useBecomePremium();

  const prm = usePremiumMessages();

  const dispatch = useDispatch();

  const {
    handleSelect: baseHandleSelect,
    menuShown,
    handleMenuToggle,
    closeMenu,
    submenu,
    extraHandler,
  } = useMenuHandler();

  const [expand, setExpand] = useState<false | 'more' | 'all'>(false);

  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!menuShown) {
      setExpand(false);
      setFilter('');
    }
  }, [menuShown]);

  const handleFilterChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFilter(e.currentTarget.value);
  }, []);

  const normalizedFilter = removeAccents(filter.trim().toLowerCase());

  // A click on an interactive badge inside a layer button / menu item acts on
  // the badge (open the photo filter, zoom to the layer's coverage) instead of
  // toggling the layer; returns true when such a badge was hit.
  const handlePossibleBadgeClick = useCallback(
    (e: SyntheticEvent<unknown, unknown>) => {
      let x: unknown = e.target;

      while (x instanceof Element) {
        if (x === e.currentTarget) {
          break;
        }

        if (x instanceof SVGElement && x.dataset['filter']) {
          dispatch(setActiveModal({ type: 'gallery-filter' }));

          return true;
        }

        if (x instanceof SVGElement && x.dataset['focusBbox']) {
          const bbox = x.dataset['focusBbox'].split(',').map(Number) as [
            number,
            number,
            number,
            number,
          ];

          const maxZoom = x.dataset['focusMaxZoom'];

          dispatch(
            mapFitBbox({
              bbox,
              maxZoom: maxZoom ? Number(maxZoom) : undefined,
            }),
          );

          return true;
        }

        if (x instanceof SVGElement && x.dataset['refocusZoom']) {
          dispatch(mapRefocus({ zoom: Number(x.dataset['refocusZoom']) }));

          return true;
        }

        x = x.parentNode;
      }

      return false;
    },
    [dispatch],
  );

  extraHandler.current = useCallback(
    (eventKey: string) => {
      if (eventKey === 'show-all') {
        setExpand('all');
      } else if (eventKey === 'show-more') {
        setExpand('more');
      } else if (eventKey === 'offlineMaps') {
        closeMenu();

        dispatch(cachedMapsSetView('list'));

        dispatch(setActiveModal({ type: 'offline-maps' }));
      } else if (eventKey.startsWith('layer-')) {
        dispatch(mapToggleLayer({ type: eventKey.slice(6) }));
      } else {
        return false;
      }

      return true;
    },
    [closeMenu, dispatch],
  );

  const handleSelect = useCallback(
    (selection: string | null, e: SyntheticEvent<unknown>) => {
      if (selection === null || handlePossibleBadgeClick(e)) {
        e.preventDefault();

        closeMenu();

        return;
      }

      baseHandleSelect(selection, e);
    },
    [baseHandleSelect, closeMenu, handlePossibleBadgeClick],
  );

  const handleLayerButtonClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (handlePossibleBadgeClick(e)) {
        return;
      }

      const { type } = e.currentTarget.dataset;

      if (type) {
        dispatch(mapToggleLayer({ type }));
      }
    },
    [dispatch, handlePossibleBadgeClick],
  );

  const isWide = useMediaQuery({ query: '(min-width: 576px)' });

  const sc = useScrollClasses('vertical');

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  const customLayerDefs = useAppSelector((state) => state.map.customLayers);

  const cachedMaps = useAppSelector((state) => state.map.cachedMaps);

  const cachedMapsTotalSize = cachedMaps.reduce(
    (sum, cm) => sum + cm.sizeBytes,
    0,
  );

  const countries = useAppSelector((state) => state.map.countries);

  const countriesSet = countries && new Set(countries);

  const layerDefs = [
    ...integratedLayerDefs.map((def) => ({ ...def, custom: false as const })),
    ...customLayerDefs.map((def) => ({ ...def, custom: true as const })),
    ...cachedMaps
      .filter((cm) => cm.downloadedCount === cm.tileCount)
      .map((cm) => ({ ...cm, custom: true as const })),
  ].map((def) => ({
    scaleWithDpi: false,
    ...def,
    countryOk:
      !countriesSet ||
      def.custom ||
      !def.countries ||
      def.countries.some((c) => countriesSet.has(c)),
    zoomOk: def.minZoom === undefined || zoom >= def.minZoom,
  }));

  // The extent to zoom to when a layer's tiles aren't in the current view, or
  // undefined when they are. Country-limited integrated layers use the
  // border-accurate `countryOk` (target: their bbox or per-country boxes);
  // layers with an explicit rectangular extent (cached maps' `bounds`, or a
  // declared `bbox`) test whether the map centre sits outside that extent.
  const getOutOfCoverageBbox = (
    def: (typeof layerDefs)[number],
  ): [number, number, number, number] | undefined => {
    if (!def.custom) {
      return def.countryOk
        ? undefined
        : (def.bbox ?? getCountriesBbox(def.countries));
    }

    const box = getLayerBbox(def);

    return box && (lon < box[0] || lon > box[2] || lat < box[1] || lat > box[3])
      ? box
      : undefined;
  };

  function commonBadges(
    def: (typeof layerDefs)[number],
    place: 'menu' | 'toolbar' | 'tooltip',
  ) {
    return (
      <>
        {place !== 'toolbar' &&
          def.type !== 'X' &&
          !def.custom &&
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
        !def.custom &&
        def.premiumFromZoom !== undefined &&
        zoom >= def.premiumFromZoom - (def.scaleWithDpi ? 1 : 0) ? (
          <PremiumGem className="ms-1" capture nested />
        ) : null}

        {place !== 'toolbar' && !def.custom && def.superseededBy && (
          <FaHistory
            className="text-warning ms-1"
            title={m?.mapLayers.legacy}
          />
        )}

        {place !== 'toolbar' && !def.custom && def.experimental && (
          <ExperimentalFunction data-interactive="1" className="ms-1" />
        )}

        {place === 'menu' && !def.zoomOk && (
          <FaSearchPlus
            data-refocus-zoom={def.minZoom}
            title={m?.mapLayers.minZoomWarning(def.minZoom!)}
            className="text-warning ms-1"
            style={{ cursor: 'pointer' }}
          />
        )}

        {place === 'menu' &&
          (() => {
            const box = getOutOfCoverageBbox(def);

            return box ? (
              <BiWorld
                data-focus-bbox={box.join(',')}
                data-focus-max-zoom={
                  'maxNativeZoom' in def ? def.maxNativeZoom : undefined
                }
                title={m?.mapLayers.outsideViewWarning}
                className="text-warning ms-1"
                style={{ cursor: 'pointer' }}
              />
            ) : null;
          })()}

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

  function layersMemuItems(
    layer: 'base' | 'overlay',
    showLeadingDivider: boolean,
  ) {
    let first = true;

    return layerDefs
      .filter((def) => def.layer === layer)
      .map((def) => {
        if (!canPreviewLayers && !def.custom && def.layerPreview) {
          return null;
        }

        const { type } = def;

        const showInMenu =
          layersSettings[type]?.showInMenu ??
          (def.custom || Boolean(def.defaultInMenu));

        const showInToolbar =
          layersSettings[type]?.showInToolbar ??
          (!def.custom && Boolean(def.defaultInToolbar));

        const layerName = def.custom
          ? def.name || (m?.mapLayers.customBase ?? '') + ' ' + type
          : (m?.mapLayers.letters[type] ?? '');

        if (normalizedFilter) {
          if (
            !removeAccents(layerName.toLowerCase()).includes(normalizedFilter)
          ) {
            return null;
          }
        } else if (
          expand !== 'all' &&
          !activeLayers.includes(type) &&
          (!(expand === false && !isWide ? showInToolbar : showInMenu) ||
            !def.zoomOk)
        ) {
          return null;
        }

        const active = (type === 'i') !== activeLayers.includes(type);

        const wasFirst = first;

        first = false;

        return (
          <Fragment key={type}>
            {wasFirst && showLeadingDivider && <Dropdown.Divider />}

            <Dropdown.Item
              href={`?layers=${type}`}
              eventKey={'layer-' + type}
              active={active}
              // className={clsx(showInMenu || 'text-secondary')}
            >
              {def.layer === 'base' ? (
                <Checkbox value={active} />
              ) : active ? (
                <FaRegCheckCircle />
              ) : (
                <FaRegCircle />
              )}

              <span className="px-2">
                {def.custom ? <MdDashboardCustomize /> : def.icon}
              </span>

              <span>
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
            layersSettings[def.type]?.showInToolbar ??
            (!def.custom && Boolean(def.defaultInToolbar));

          if (
            !activeLayers.includes(def.type) &&
            (!def.zoomOk ||
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

          const active = (type === 'i') !== activeLayers.includes(type);

          // Accessories are buttons joined to the layer button, each with its
          // own fix-up action, so clicking the layer button itself only toggles
          // the layer.
          const accessories: {
            key: string;
            icon: ReactElement;
            tooltip: ReactNode;
            onClick: (e: MouseEvent<HTMLButtonElement>) => void;
          }[] = [];

          if (!def.zoomOk) {
            accessories.push({
              key: 'zoom',
              icon: <FaSearchPlus className="text-warning" />,
              tooltip: m?.mapLayers.minZoomWarning(def.minZoom!),
              onClick: () => dispatch(mapRefocus({ zoom: def.minZoom })),
            });
          }

          // a layer whose tiles aren't in view gets a button that zooms to its
          // coverage
          const outOfCoverageBbox = getOutOfCoverageBbox(def);

          if (outOfCoverageBbox) {
            accessories.push({
              key: 'coverage',
              icon: <BiWorld className="text-warning" />,
              tooltip: m?.mapLayers.outsideViewWarning,
              onClick: () =>
                dispatch(
                  mapFitBbox({
                    bbox: outOfCoverageBbox,
                    maxZoom:
                      'maxNativeZoom' in def ? def.maxNativeZoom : undefined,
                  }),
                ),
            });
          }

          if (
            becomePremium &&
            !def.custom &&
            def.premiumFromZoom !== undefined &&
            zoom >= def.premiumFromZoom - (def.scaleWithDpi ? 1 : 0)
          ) {
            accessories.push({
              key: 'premium',
              icon: <FaGem className="text-warning" />,
              tooltip: (
                <>
                  {prm?.premiumOnly} {prm?.clickToActivate}
                </>
              ),
              onClick: (e) => becomePremium(e),
            });
          }

          const joined = accessories.length > 0;

          return (
            <Fragment key={type}>
              <LongPressTooltip
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
                    data-type={type}
                    active={active}
                    onClick={handleLayerButtonClick}
                    {...props}
                    className={
                      joined ? 'pe-1 border-end-0 fm-btn-joined' : undefined
                    }
                  >
                    {def.custom ? <MdDashboardCustomize /> : def.icon}

                    {commonBadges(def, 'toolbar')}
                  </Button>
                )}
              </LongPressTooltip>

              {accessories.map((acc, i) => (
                <LongPressTooltip key={acc.key} label={acc.tooltip}>
                  {({ props }) => (
                    <Button
                      variant="secondary"
                      active={active}
                      onClick={acc.onClick}
                      {...props}
                      className={clsx(
                        'fm-btn-joined border-start-0',
                        i === accessories.length - 1
                          ? 'ps-1'
                          : 'px-1 border-end-0',
                      )}
                    >
                      {acc.icon}
                    </Button>
                  )}
                </LongPressTooltip>
              ))}
            </Fragment>
          );
        })}

        <Dropdown
          show={menuShown}
          drop="up-centered"
          onSelect={handleSelect}
          autoClose="outside"
          onToggle={handleMenuToggle}
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

              {submenu === 'mapSettings' ? (
                <>
                  <SubmenuHeader
                    icon={<FaCog />}
                    title={m?.mapLayers.settings}
                  />

                  <Dropdown.Item {...modalMenuItemProps('map-layers-config')}>
                    <FaLayerGroup /> {m?.mapLayers.configureLayers} <kbd>m</kbd>{' '}
                    <kbd>y</kbd>
                  </Dropdown.Item>

                  <Dropdown.Item {...modalMenuItemProps('custom-maps')}>
                    <MdDashboardCustomize /> {m?.mapLayers.customMaps}{' '}
                    <kbd>m</kbd> <kbd>c</kbd>
                  </Dropdown.Item>

                  <Dropdown.Item
                    as="button"
                    {...modalMenuItemProps('map-preferences')}
                  >
                    <FaCog /> {m?.mapLayers.preferences} <kbd>m</kbd>{' '}
                    <kbd>p</kbd>
                  </Dropdown.Item>
                </>
              ) : (
                <>
                  {!normalizedFilter && !restrictToMapSwitching && (
                    <>
                      <Dropdown.Item
                        key="offlineMaps"
                        as="button"
                        eventKey="offlineMaps"
                      >
                        <BiWifiOff /> {m?.mapLayers.offlineMaps}
                        {cachedMapsTotalSize > 0 &&
                          ` · ${formatSize(cachedMapsTotalSize)}`}{' '}
                        <kbd>m</kbd> <kbd>o</kbd>
                      </Dropdown.Item>

                      <Dropdown.Item
                        key="mapSettings"
                        as="button"
                        eventKey="submenu-mapSettings"
                      >
                        <FaCog /> {m?.mapLayers.settings}
                        <FaChevronRight />
                      </Dropdown.Item>
                    </>
                  )}

                  {(() => {
                    const baseItems = layersMemuItems(
                      'base',
                      !normalizedFilter && !restrictToMapSwitching,
                    );
                    const baseHasItems = baseItems.some(Boolean);
                    const overlayItems = layersMemuItems(
                      'overlay',
                      !normalizedFilter || baseHasItems,
                    );
                    const noMatches =
                      normalizedFilter &&
                      !baseHasItems &&
                      !overlayItems.some(Boolean);

                    return (
                      <>
                        {baseItems}
                        {overlayItems}
                        {noMatches && (
                          <Dropdown.ItemText className="text-muted text-center">
                            {m?.mapLayers.noMapsFound}
                          </Dropdown.ItemText>
                        )}
                      </>
                    );
                  })()}

                  <Dropdown.Divider />

                  {!normalizedFilter &&
                    (expand === false || expand === 'more') &&
                    (!isWide && expand === false ? (
                      <Dropdown.Item eventKey="show-more" className="mb-2">
                        {m?.mapLayers.showMore}
                      </Dropdown.Item>
                    ) : (
                      <Dropdown.Item eventKey="show-all" className="mb-2">
                        {m?.mapLayers.showAll}
                      </Dropdown.Item>
                    ))}

                  <div className="px-2 pb-1">
                    <Form.Control
                      type="search"
                      size="sm"
                      placeholder={m?.mapLayers.filterMaps}
                      value={filter}
                      onChange={handleFilterChange}
                    />
                  </div>
                </>
              )}
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </ButtonGroup>
    </>
  );
}
