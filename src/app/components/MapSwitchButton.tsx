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
import { CountryFlag } from '@shared/components/CountryFlag.js';
import { ExperimentalFunction } from '@shared/components/ExperimentalFunction.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import { IconSpecGlyph } from '@shared/components/IconGlyph.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { OfflineBadge } from '@shared/components/OfflineBadge.js';
import { OnlineOnlyItem } from '@shared/components/OnlineOnlyItem.js';
import { Radio } from '@shared/components/Radio.js';
import { formatShortcut } from '@shared/components/ShortcutRecorder.js';
import { formatSize } from '@shared/formatSize.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCanSaveSettings } from '@shared/hooks/useCanSaveSettings.js';
import {
  modalMenuItemProps,
  useMenuHandler,
} from '@shared/hooks/useMenuHandler.js';
import {
  getCountriesBbox,
  getLayerBbox,
  integratedLayerDefs,
} from '@shared/mapDefinitions.js';
import { makeLabelComparator, removeAccents } from '@shared/stringUtils.js';
import type { Shortcut } from '@shared/types/common.js';
import clsx from 'clsx';
import {
  type ChangeEvent,
  Fragment,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type SyntheticEvent,
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
  FaRegMap,
  FaSearchLocation,
  FaSearchPlus,
} from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { setActiveModal } from '../store/actions.js';

/**
 * A badge on a menu item, explained by the same tooltip the toolbar uses.
 *
 * `action` gives it Bootstrap's button clothes: the item is an anchor, so a
 * real `<button>` inside it would not be valid markup, and the span carries
 * `data-*` naming what to do instead — which the item's own click handler reads
 * (see `handlePossibleBadgeClick`).
 */
function Badge({
  label,
  action,
  data,
  children,
}: {
  label: ReactNode;
  action?: boolean;
  data?: Record<string, string | number | undefined>;
  children: ReactNode;
}) {
  return (
    <GlyphMarker
      hint={label}
      {...data}
      // The button clothes are the acting badge's own box, and `.fm-badge-action`
      // sizes it to the 24px a target needs.
      bare={action}
      color={action ? null : 'warning'}
      // Every `data-*` a badge carries is one `handlePossibleBadgeClick` acts on,
      // so carrying any of them makes it a control — including the photo filter,
      // which does so without the button clothes.
      cursor={data ? 'pointer' : undefined}
      className={
        action
          ? 'btn btn-sm btn-outline-warning lh-1 fm-badge-action'
          : undefined
      }
    >
      {children}
    </GlyphMarker>
  );
}

function getKbdShortcut(shortcut?: Shortcut | null) {
  return shortcut && <kbd>{formatShortcut(shortcut)}</kbd>;
}

export function MapSwitchButton(): ReactElement {
  const m = useMessages();

  const canSaveSettings = useCanSaveSettings();

  // Both questions asked of it below — is the layer in range, are its tiles
  // premium here — are about the tiles the layer would request, and Leaflet
  // requests them at the rounded map zoom.
  const zoom = useAppSelector((state) => Math.round(state.map.zoom));

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

        if (
          (x instanceof HTMLElement || x instanceof SVGElement) &&
          x.dataset['filter']
        ) {
          dispatch(setActiveModal({ type: 'gallery-filter' }));

          return true;
        }

        // A badge saying the layer cannot be seen here is a request to see
        // it, so it is switched on as well. Never off: the layer button is
        // what toggles.
        if (
          (x instanceof HTMLElement || x instanceof SVGElement) &&
          x.dataset['activateType']
        ) {
          dispatch(
            mapToggleLayer({ type: x.dataset['activateType'], enable: true }),
          );
        }

        if (
          (x instanceof HTMLElement || x instanceof SVGElement) &&
          x.dataset['focusBbox']
        ) {
          const bbox = x.dataset['focusBbox'].split(',').map(Number) as [
            number,
            number,
            number,
            number,
          ];

          const maxZoom = x.dataset['focusMaxZoom'];

          const minZoom = x.dataset['focusMinZoom'];

          dispatch(
            mapFitBbox({
              bbox,
              maxZoom: maxZoom ? Number(maxZoom) : undefined,
              minZoom: minZoom ? Number(minZoom) : undefined,
            }),
          );

          return true;
        }

        if (
          (x instanceof HTMLElement || x instanceof SVGElement) &&
          x.dataset['refocusZoom']
        ) {
          dispatch(mapRefocus({ zoom: Number(x.dataset['refocusZoom']) }));

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

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  const customLayerDefs = useAppSelector((state) => state.map.customLayers);

  const language = useAppSelector((state) => state.l10n.language);

  const cachedMaps = useAppSelector((state) => state.map.cachedMaps);

  const cachedMapsTotalSize = cachedMaps.reduce(
    (sum, cm) => sum + cm.sizeBytes,
    0,
  );

  const countries = useAppSelector((state) => state.map.countries);

  const countriesSet = countries && new Set(countries);

  // The built-in layers keep the order the registry gives them, which is a
  // considered one; the user's own are sorted, each kind among itself. Merging
  // the two kinds would put an offline copy beside the layer it was made from,
  // told apart only by a badge, and would move one kind about as the other grows.
  const byName = makeLabelComparator(language);

  const layerDefs = [
    ...integratedLayerDefs.map((def) => ({
      ...def,
      custom: false as const,
      cached: false,
    })),
    ...[...customLayerDefs]
      .sort((a, b) => byName(a.name || undefined, b.name || undefined))
      .map((def) => ({ ...def, custom: true as const, cached: false })),
    ...cachedMaps
      .filter((cm) => cm.downloadedCount === cm.tileCount)
      .sort((a, b) => byName(a.name || undefined, b.name || undefined))
      .map((cm) => ({ ...cm, custom: true as const, cached: true })),
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

  extraHandler.current = (eventKey: string) => {
    if (eventKey === 'show-all') {
      setExpand('all');
    } else if (eventKey === 'show-more') {
      setExpand('more');
    } else if (eventKey === 'offlineMaps') {
      closeMenu();

      dispatch(cachedMapsSetView('list'));

      dispatch(setActiveModal({ type: 'offline-maps' }));
    } else if (eventKey.startsWith('layer-')) {
      const type = eventKey.slice(6);

      // Base layers are mutually exclusive, so picking one is the end of the
      // choice and the menu closes; overlays stack, so it stays open.
      if (layerDefs.find((def) => def.type === type)?.layer === 'base') {
        closeMenu();
      }

      dispatch(mapToggleLayer({ type }));
    } else {
      return false;
    }

    return true;
  };

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

  /** Both warnings in one line, or nothing while the messages are loading. */
  const findLabel = (minZoom: number) =>
    m &&
    `${m.mapLayers.minZoomWarning(minZoom)} · ${m.mapLayers.outsideViewWarning}`;

  function commonBadges(
    def: (typeof layerDefs)[number],
    place: 'menu' | 'toolbar' | 'tooltip',
  ) {
    const premiumHere =
      !def.custom &&
      def.premiumFromZoom !== undefined &&
      zoom >= def.premiumFromZoom - (def.scaleWithDpi ? 1 : 0);

    return (
      <>
        {place !== 'toolbar' &&
          def.type !== 'X' &&
          !def.custom &&
          def.countries?.map((country) => (
            <CountryFlag key={country} country={country} />
          ))}

        {place !== 'toolbar' &&
          getKbdShortcut(
            layersSettings[def.type]?.shortcut === undefined
              ? def.shortcut
              : layersSettings[def.type].shortcut,
          )}

        {(place === 'menu' || (place === 'tooltip' && premium)) &&
          premiumHere && <PremiumGem capture nested />}

        {/* Everything but a downloaded map draws nothing while offline. The
            toolbar says it through the button's own tooltip, as premium does. */}
        {place !== 'toolbar' &&
          !def.cached &&
          def.technology !== 'interactive' && (
            <OfflineBadge hint={m?.mapLayers.offlineWarning} />
          )}

        {place !== 'toolbar' && !def.custom && def.superseededBy && (
          <Badge label={m?.mapLayers.legacy}>
            <FaHistory />
          </Badge>
        )}

        {place !== 'toolbar' && !def.custom && def.experimental && (
          <ExperimentalFunction />
        )}

        {place === 'menu' &&
          (() => {
            const box = getOutOfCoverageBbox(def);

            // Away from the layer either way: the fit carries the zoom it needs,
            // so both are one thing to put right and so one badge.
            if (box) {
              return (
                <Badge
                  action
                  label={
                    def.zoomOk
                      ? m?.mapLayers.outsideViewWarning
                      : findLabel(def.minZoom!)
                  }
                  data={{
                    'data-activate-type': def.type,
                    'data-focus-bbox': box.join(','),
                    'data-focus-max-zoom':
                      'maxNativeZoom' in def ? def.maxNativeZoom : undefined,
                    'data-focus-min-zoom': def.minZoom,
                  }}
                >
                  {def.zoomOk ? <BiWorld /> : <FaSearchLocation />}
                </Badge>
              );
            }

            return def.zoomOk ? null : (
              <Badge
                action
                label={m?.mapLayers.minZoomWarning(def.minZoom!)}
                data={{
                  'data-activate-type': def.type,
                  'data-refocus-zoom': def.minZoom,
                }}
              >
                <FaSearchPlus />
              </Badge>
            );
          })()}

        {place !== 'tooltip' && def.type === 'I' && pictureFilterIsActive && (
          <Badge
            label={m?.mapLayers.photoFilterWarning}
            data={{ 'data-filter': '1' }}
          >
            <FaFilter />
          </Badge>
        )}

        {place !== 'tooltip' &&
          activeLayers.includes('i') &&
          def.type === 'i' && (
            <Badge label={m?.mapLayers.interactiveLayerWarning}>
              <FaEyeSlash />
            </Badge>
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
          ? def.name || `${m?.mapLayers.customBase ?? ''} ${type}`
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
          !(expand === false && !isWide ? showInToolbar : showInMenu)
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
              href={`#layers=${type}`}
              eventKey={`layer-${type}`}
              active={active}
              // className={clsx(showInMenu || 'text-secondary')}
            >
              {/* base layers are mutually exclusive (radio), overlays stack
                  (checkbox) */}
              {def.layer === 'base' ? (
                <Radio value={active} />
              ) : (
                <Checkbox value={active} />
              )}

              {def.custom ? (
                <IconSpecGlyph
                  spec={def.iconSpec}
                  fallback={<MdDashboardCustomize />}
                />
              ) : (
                def.icon
              )}

              <span>
                {def.custom
                  ? def.name || `${m?.mapLayers.customBase} ${type}`
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
      <div className="px-1 d-none d-sm-block">{m?.mapLayers.switch}</div>

      <ButtonGroup>
        {(isWide ? layerDefs : []).map((def) => {
          const { type } = def;

          const showInToolbar =
            layersSettings[def.type]?.showInToolbar ??
            (!def.custom && Boolean(def.defaultInToolbar));

          // Being below a layer's `minZoom` does not hide it, the way being
          // away from its coverage does not: both are offered as something to
          // fix, through the accessories below.
          if (
            !activeLayers.includes(def.type) &&
            (!showInToolbar ||
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

          // a layer whose tiles aren't in view gets a button that zooms to its
          // coverage, at the zoom the layer needs when that is further in than
          // the extent would fit
          const outOfCoverageBbox = getOutOfCoverageBbox(def);

          if (outOfCoverageBbox) {
            accessories.push({
              key: 'coverage',
              icon: def.zoomOk ? (
                <BiWorld className="text-warning" />
              ) : (
                <FaSearchLocation className="text-warning" />
              ),
              tooltip: def.zoomOk
                ? m?.mapLayers.outsideViewWarning
                : findLabel(def.minZoom!),
              onClick: () => {
                dispatch(mapToggleLayer({ type, enable: true }));

                dispatch(
                  mapFitBbox({
                    bbox: outOfCoverageBbox,
                    maxZoom:
                      'maxNativeZoom' in def ? def.maxNativeZoom : undefined,
                    minZoom: def.minZoom,
                  }),
                );
              },
            });
          } else if (!def.zoomOk) {
            accessories.push({
              key: 'zoom',
              icon: <FaSearchPlus className="text-warning" />,
              tooltip: m?.mapLayers.minZoomWarning(def.minZoom!),
              onClick: () => {
                dispatch(mapToggleLayer({ type, enable: true }));

                dispatch(mapRefocus({ zoom: def.minZoom }));
              },
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
                  <span className="d-inline-flex flex-wrap align-items-center gap-1">
                    {def.custom
                      ? def.name || `${m?.mapLayers.customBase} ${type}`
                      : (m?.mapLayers.letters[type] ?? '…')}

                    {commonBadges(def, 'tooltip')}
                  </span>
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
                    {def.custom ? (
                      <IconSpecGlyph
                        spec={def.iconSpec}
                        fallback={<MdDashboardCustomize />}
                      />
                    ) : (
                      def.icon
                    )}

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

          <FmDropdownMenu>
            {submenu === 'mapSettings' ? (
              <>
                <SubmenuHeader icon={<FaCog />} title={m?.mapLayers.settings} />

                <OnlineOnlyItem
                  offline={!canSaveSettings}
                  {...modalMenuItemProps('map-layers-config')}
                >
                  <FaLayerGroup /> {m?.mapLayers.configureLayers} <kbd>m</kbd>{' '}
                  <kbd>y</kbd>
                </OnlineOnlyItem>

                {/* A custom map lives only in the account's settings, so
                    offline there is nothing here to add, change or remove —
                    unless the settings are the browser's own. */}
                <OnlineOnlyItem
                  offline={!canSaveSettings}
                  {...modalMenuItemProps('custom-maps')}
                >
                  <MdDashboardCustomize /> {m?.mapLayers.customMaps}
                  {customLayerDefs.length > 0 && ` · ${customLayerDefs.length}`}{' '}
                  <kbd>m</kbd> <kbd>c</kbd>
                </OnlineOnlyItem>

                <Dropdown.Item as="button" eventKey="offlineMaps">
                  <BiWifiOff /> {m?.mapLayers.offlineMaps}
                  {cachedMapsTotalSize > 0 &&
                    ` · ${formatSize(cachedMapsTotalSize)}`}{' '}
                  <kbd>m</kbd> <kbd>o</kbd>
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item {...modalMenuItemProps('map-preferences')}>
                  <FaCog /> {m?.mapLayers.preferences} <kbd>m</kbd> <kbd>p</kbd>
                </Dropdown.Item>
              </>
            ) : (
              <>
                {!normalizedFilter && !restrictToMapSwitching && (
                  <Dropdown.Item
                    key="mapSettings"
                    as="button"
                    eventKey="submenu-mapSettings"
                  >
                    <FaCog /> {m?.mapLayers.settings}
                    <FaChevronRight />
                  </Dropdown.Item>
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
                    <Dropdown.Item
                      as="button"
                      eventKey="show-more"
                      className="mb-2"
                    >
                      {m?.mapLayers.showMore}
                    </Dropdown.Item>
                  ) : (
                    <Dropdown.Item
                      as="button"
                      eventKey="show-all"
                      className="mb-2"
                    >
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
          </FmDropdownMenu>
        </Dropdown>
      </ButtonGroup>
    </>
  );
}
