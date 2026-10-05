import { hasRole } from '@features/auth/model/types.js';
import { isCachedMapComplete } from '@features/cachedMaps/cachedTileMaps.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  mapFitBbox,
  mapPresetToggle,
  mapRefocus,
  mapToggleLayer,
} from '@features/map/model/actions.js';
import { type MapPreset, presetItem } from '@features/map/model/mapPreset.js';
import { resolvedCustomLayersSelector } from '@features/map/model/selectors.js';
import {
  integratedLayerDefsSelector,
  overlayZIndexSelector,
  presetKindsSelector,
} from '@features/mapLibrary/model/selectors.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { useBecomePremium } from '@features/premium/hooks/useBecomePremium.js';
import { isPremium, premiumMapZoom } from '@features/premium/premium.js';
import { usePremiumMessages } from '@features/premium/translations/usePremiumMessages.js';
import { Checkbox } from '@shared/components/Checkbox.js';
import { CountryFlag } from '@shared/components/CountryFlag.js';
import {
  CustomMapGlyph,
  customMapKind,
} from '@shared/components/CustomMapGlyph.js';
import { ExperimentalFunction } from '@shared/components/ExperimentalFunction.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { MenuGutter } from '@shared/components/MenuGutter.js';
import { OfflineBadge } from '@shared/components/OfflineBadge.js';
import { Radio } from '@shared/components/Radio.js';
import { formatShortcut } from '@shared/components/ShortcutRecorder.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useMenuHandler } from '@shared/hooks/useMenuHandler.js';
import { layerLabel, layerName } from '@shared/layerName.js';
import {
  flaggedCountries,
  getCountriesBbox,
  getLayerBbox,
} from '@shared/mapDefinitions.js';
import { coverageCountries } from '@shared/mapLibrary/coverage.js';
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
  useRef,
  useState,
} from 'react';
import { Button, ButtonGroup, Dropdown, Form } from 'react-bootstrap';
import {
  FaEllipsisV,
  FaEyeSlash,
  FaFilter,
  FaGem,
  FaGlobeEurope,
  FaHistory,
  FaRegMap,
  FaSearchLocation,
  FaSearchPlus,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { setActiveModal } from '../store/actions.js';

/**
 * A badge on a menu item, explained by the same tooltip the toolbar uses.
 *
 * One that acts carries `data-*` naming what to do rather than a handler: the
 * item is an anchor, so a real `<button>` inside it would not be valid markup,
 * and the item's own click handler reads them (see `handlePossibleBadgeClick`).
 */
function Badge({
  label,
  data,
  children,
}: {
  label: ReactNode;
  data?: Record<string, string | number | undefined>;
  children: ReactNode;
}) {
  return (
    <GlyphMarker
      hint={label}
      {...data}
      // Every `data-*` a badge carries is one `handlePossibleBadgeClick` acts on,
      // so carrying any of them makes it a control.
      cursor={data ? 'pointer' : undefined}
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
    extraHandler,
  } = useMenuHandler();

  const [expand, setExpand] = useState<false | 'more' | 'all'>(false);

  const [filter, setFilter] = useState('');

  const filterRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!menuShown) {
      setExpand(false);
      setFilter('');
    } else if (window.matchMedia('(pointer: fine)').matches) {
      // Not on touch: the keyboard would cover the menu it was opened to use.
      filterRef.current?.focus({ preventScroll: true });
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

  const integratedLayerDefs = useAppSelector(integratedLayerDefsSelector);

  const overlayZIndex = useAppSelector(overlayZIndexSelector);

  const customLayerDefs = useAppSelector(resolvedCustomLayersSelector);

  const presets = useAppSelector((state) => state.map.presets);

  const presetKinds = useAppSelector(presetKindsSelector);

  const language = useAppSelector((state) => state.l10n.language);

  const cachedMaps = useAppSelector((state) => state.map.cachedMaps);

  const countries = useAppSelector((state) => state.map.countries);

  const countriesSet = countries && new Set(countries);

  // Base maps: the built-in ones in the registry's order, the user's own by
  // name, each kind among itself. Overlays: as they stack, top first.
  const byName = makeLabelComparator(language);

  const stackPlace = (def: { type: string; layer: 'base' | 'overlay' }) =>
    def.layer === 'base'
      ? Number.NEGATIVE_INFINITY
      : -(overlayZIndex[def.type] ?? 0);

  const layerDefs = [
    // Installed or on, and listed once its body has loaded.
    ...integratedLayerDefs.map((def) => ({
      ...def,
      custom: false as const,
      cached: false,
    })),
    ...customLayerDefs.map((def) => ({
      ...def,
      custom: true as const,
      cached: false,
    })),
    ...cachedMaps
      .filter(isCachedMapComplete)
      .sort((a, b) => byName(a.name || undefined, b.name || undefined))
      .map((cm) => ({ ...cm, custom: true as const, cached: true })),
  ].map((def) => ({
    scaleWithDpi: false,
    ...def,
    countryOk:
      !countriesSet ||
      def.custom ||
      (coverageCountries(def)?.some((c) => countriesSet.has(c)) ?? true),
    zoomOk: def.minZoom === undefined || zoom >= def.minZoom,
  }));

  type Entry =
    | { def: (typeof layerDefs)[number]; preset?: undefined }
    | { preset: MapPreset; layer: 'base' | 'overlay' };

  const kindOf = (entry: Entry) =>
    entry.preset ? entry.layer : entry.def.layer;

  // Built-in base maps, then the user's own maps and presets by name, then
  // offline maps; overlays as they stack.
  const rank = (entry: Entry) =>
    entry.preset ? 1 : !entry.def.custom ? 0 : entry.def.cached ? 2 : 1;

  const entries: Entry[] = [
    ...layerDefs.map((def): Entry => ({ def })),
    ...presets.map(
      (preset): Entry => ({
        preset,
        layer: presetKinds[preset.id] ?? 'overlay',
      }),
    ),
  ].sort((a, b) => {
    const place = (entry: Entry) =>
      entry.preset
        ? stackPlace({ type: presetItem(entry.preset.id), layer: entry.layer })
        : stackPlace(entry.def);

    if (kindOf(a) === 'overlay' || kindOf(b) === 'overlay') {
      return place(a) - place(b);
    }

    const ownName = (entry: Entry) =>
      (entry.preset ? entry.preset.name : layerLabel(entry.def, m)) ||
      undefined;

    return (
      rank(a) - rank(b) || (rank(a) === 1 ? byName(ownName(a), ownName(b)) : 0)
    );
  });

  extraHandler.current = (eventKey: string) => {
    if (eventKey === 'show-all') {
      setExpand('all');
    } else if (eventKey === 'show-more') {
      setExpand('more');
    } else if (eventKey.startsWith('preset-')) {
      const id = eventKey.slice(7);

      // As with maps: a base map ends the choice, an overlay stacks.
      if (presetKinds[id] === 'base') {
        closeMenu();
      }

      dispatch(mapPresetToggle({ id }));
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
  // undefined when they are. Layers whose countries tell their coverage use
  // the border-accurate `countryOk`; the rest (cached maps' `bounds`, a catalog
  // map's `bbox`) test whether the map centre sits outside their extent.
  const getOutOfCoverageBbox = (
    def: (typeof layerDefs)[number],
  ): [number, number, number, number] | undefined => {
    if (!def.custom && coverageCountries(def)) {
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

  /**
   * A layer's countries. They stay beside the name rather than joining the
   * badges: they are what tells two layers of the same name apart.
   */
  function countryFlags(def: (typeof layerDefs)[number]) {
    return (
      !def.custom &&
      flaggedCountries(def)?.map((country) => (
        <CountryFlag key={country} country={country} />
      ))
    );
  }

  function commonBadges(
    def: (typeof layerDefs)[number],
    place: 'menu' | 'toolbar' | 'tooltip',
  ) {
    const premiumHere =
      !def.custom &&
      def.premiumFromZoom !== undefined &&
      zoom >= premiumMapZoom(def.premiumFromZoom, def.scaleWithDpi);

    return (
      <>
        {/* Quiet only where it repeats down the menu; on a tooltip it is the
            only gem there, and dimmed it would be the hardest to read. */}
        {(place === 'menu' || (place === 'tooltip' && premium)) &&
          premiumHere && <PremiumGem capture nested quiet={place === 'menu'} />}

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
                  {def.zoomOk ? <FaGlobeEurope /> : <FaSearchLocation />}
                </Badge>
              );
            }

            return def.zoomOk ? null : (
              <Badge
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

        {/* The shortcut sits at the row's edge the way a menu writes it. */}
        {place !== 'toolbar' &&
          getKbdShortcut(
            layersSettings[def.type]?.shortcut === undefined
              ? def.shortcut
              : layersSettings[def.type].shortcut,
          )}

        {/* All but a downloaded map or a colour draw nothing offline.
            Outermost, so a transient badge doesn't shift the shortcut's column. */}
        {place !== 'toolbar' &&
          !def.cached &&
          def.technology !== 'interactive' &&
          def.technology !== 'color' && (
            <OfflineBadge hint={m?.mapLayers.offlineWarning} />
          )}
      </>
    );
  }

  /** A layer's check; `i` on the map hides the interactive layer. */
  const isLayerOn = (def: { type: string }) =>
    (def.type === 'i') !== activeLayers.includes(def.type);

  /** Whether a layer or preset is listed at the menu's filter and expand level. */
  const isListed = (
    name: string,
    on: boolean,
    {
      showInMenu,
      showInToolbar,
    }: { showInMenu: boolean; showInToolbar: boolean },
  ) =>
    normalizedFilter
      ? removeAccents(name.toLowerCase()).includes(normalizedFilter)
      : expand === 'all' ||
        on ||
        (expand === false && !isWide ? showInToolbar : showInMenu);

  // A built-in map has a name once the messages are in.
  const nameOf = (def: { type: string; name?: string; custom: boolean }) =>
    def.custom ? layerLabel(def, m) : (layerName(def, m) ?? '…');

  function layersMemuItems(layer: 'base' | 'overlay') {
    return entries
      .filter((entry) => kindOf(entry) === layer)
      .map((entry) => {
        if (entry.preset) {
          return presetMenuItem(entry.preset, layer);
        }

        const { def } = entry;

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

        const name = nameOf(def);

        if (
          !isListed(name, activeLayers.includes(type), {
            showInMenu,
            showInToolbar,
          })
        ) {
          return null;
        }

        const active = isLayerOn(def);

        return (
          <Dropdown.Item
            key={type}
            href={`#layers=${type}`}
            eventKey={`layer-${type}`}
            active={active}
          >
            {/* base layers are mutually exclusive (radio), overlays stack
                  (checkbox) */}
            {def.layer === 'base' ? (
              <Radio value={active} />
            ) : (
              <Checkbox value={active} />
            )}

            {def.custom ? (
              <CustomMapGlyph spec={def.iconSpec} kind={customMapKind(def)} />
            ) : (
              def.icon
            )}

            <span>{nameOf(def)}</span>

            {countryFlags(def)}

            <MenuGutter>{commonBadges(def, 'menu')}</MenuGutter>
          </Dropdown.Item>
        );
      });
  }

  function presetMenuItem(
    { id, name, iconSpec }: MapPreset,
    layer: 'base' | 'overlay',
  ) {
    const active = activeLayers.includes(presetItem(id));

    return isListed(name, active, {
      showInMenu: layersSettings[id]?.showInMenu ?? true,
      showInToolbar: Boolean(layersSettings[id]?.showInToolbar),
    }) ? (
      <Dropdown.Item
        key={`preset-${id}`}
        as="button"
        eventKey={`preset-${id}`}
        active={active}
      >
        {layer === 'base' ? (
          <Radio value={active} />
        ) : (
          <Checkbox value={active} />
        )}

        <CustomMapGlyph spec={iconSpec} kind="preset" />

        <span>{name}</span>

        <MenuGutter>{getKbdShortcut(layersSettings[id]?.shortcut)}</MenuGutter>
      </Dropdown.Item>
    ) : null;
  }

  function presetButton(preset: MapPreset) {
    const { id } = preset;

    const active = activeLayers.includes(presetItem(id));

    if (!active && !layersSettings[id]?.showInToolbar) {
      return null;
    }

    return (
      <LongPressTooltip
        key={`preset-${id}`}
        label={
          <span className="d-inline-flex flex-wrap align-items-center gap-1">
            {preset.name}

            {getKbdShortcut(layersSettings[id]?.shortcut)}
          </span>
        }
      >
        {({ props }) => (
          <Button
            variant="secondary"
            active={active}
            onClick={() => dispatch(mapPresetToggle({ id }))}
            {...props}
          >
            <CustomMapGlyph spec={preset.iconSpec} kind="preset" />
          </Button>
        )}
      </LongPressTooltip>
    );
  }

  const baseItems = layersMemuItems('base');

  const baseHasItems = baseItems.some(Boolean);

  const overlayItems = layersMemuItems('overlay');

  const overlayHasItems = overlayItems.some(Boolean);

  function toolbarButton(entry: Entry) {
    if (entry.preset) {
      return presetButton(entry.preset);
    }

    const { def } = entry;

    const { type } = def;

    const showInToolbar =
      layersSettings[def.type]?.showInToolbar ??
      (!def.custom && Boolean(def.defaultInToolbar));

    // Out of `minZoom` or coverage doesn't hide it: the accessories below
    // offer the fix.
    if (!activeLayers.includes(def.type) && !showInToolbar) {
      return null;
    }

    const active = isLayerOn(def);

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
          <FaGlobeEurope className="text-warning" />
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
              maxZoom: 'maxNativeZoom' in def ? def.maxNativeZoom : undefined,
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
      zoom >= premiumMapZoom(def.premiumFromZoom, def.scaleWithDpi)
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
              {nameOf(def)}

              {countryFlags(def)}

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
              className={clsx(
                // A crowded toolbar shrinks its buttons; the badge would
                // then wrap under the icon.
                'text-nowrap',
                joined && 'pe-1 border-end-0 fm-btn-joined',
              )}
            >
              {def.custom ? (
                <CustomMapGlyph spec={def.iconSpec} kind={customMapKind(def)} />
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
                  i === accessories.length - 1 ? 'ps-1' : 'px-1 border-end-0',
                )}
              >
                {acc.icon}
              </Button>
            )}
          </LongPressTooltip>
        ))}
      </Fragment>
    );
  }

  const toolbarButtons = (isWide ? entries : []).flatMap((entry) => {
    const button = toolbarButton(entry);

    return button ? [{ kind: kindOf(entry), button }] : [];
  });

  // Seams set base maps, overlays and the menu apart; overlays sort last.
  const seam = (key: string) => (
    <span key={key} className="btn btn-secondary fm-seam" />
  );

  return (
    <>
      <div className="px-1 d-none d-sm-block">{m?.mapLayers.switch}</div>

      <ButtonGroup>
        {toolbarButtons.flatMap(({ kind, button }, i) =>
          i > 0 && kind === 'overlay' && toolbarButtons[i - 1].kind === 'base'
            ? [seam('seam-overlays'), button]
            : [button],
        )}

        {toolbarButtons.length > 0 && seam('seam-menu')}

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
            className="text-nowrap"
            variant={isWide ? 'secondary' : 'primary'}
          >
            <FaEllipsisV className="d-none d-sm-block" />
            <FaRegMap className="d-sm-none" />

            {/* Narrow screens have no toolbar button to carry it. */}
            {!isWide && activeLayers.includes('i') && (
              <Badge label={m?.mapLayers.interactiveLayerWarning}>
                <FaEyeSlash />
              </Badge>
            )}
          </Dropdown.Toggle>

          <FmDropdownMenu>
            {baseItems}

            {(!normalizedFilter || baseHasItems) && overlayHasItems && (
              <Dropdown.Divider />
            )}

            {overlayItems}

            {normalizedFilter && !baseHasItems && !overlayHasItems && (
              <Dropdown.ItemText className="text-muted text-center">
                {m?.mapLayers.noMapsFound}
              </Dropdown.ItemText>
            )}

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
                <Dropdown.Item as="button" eventKey="show-all" className="mb-2">
                  {m?.mapLayers.showAll}
                </Dropdown.Item>
              ))}

            <div className="px-2 pb-1">
              <Form.Control
                ref={filterRef}
                type="search"
                size="sm"
                placeholder={m?.mapLayers.filterMaps}
                value={filter}
                onChange={handleFilterChange}
              />
            </div>
          </FmDropdownMenu>
        </Dropdown>
      </ButtonGroup>
    </>
  );
}
