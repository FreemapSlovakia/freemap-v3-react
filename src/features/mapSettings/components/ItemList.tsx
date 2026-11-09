import {
  deleteFeature,
  type Selection,
  selectFeature,
} from '@app/store/actions.js';
import { openToolsSelector } from '@app/store/selectors.js';
import type { RootState } from '@app/store/store.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { areFeaturesHidden } from '@features/map/featuresOpacity.js';
import { mapSetFeaturesOpacity } from '@features/map/model/actions.js';
import {
  fitOnceSettled,
  fitToUncovered,
  GENEROUS_MARGIN_PX,
} from '@features/map/panToUncovered.js';
import type { UnknownAction } from '@reduxjs/toolkit';
import { usePaged } from '@shared/components/LoadMoreSentinel.js';
import { TruncatedText } from '@shared/components/TruncatedText.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { DELETABLE_SELECTIONS, sameSelection } from '@shared/selection.js';
import type { LatLon } from '@shared/types/common.js';
import { bbox as turfBbox } from '@turf/bbox';
import clsx from 'clsx';
import type { GeoJSON } from 'geojson';
import { type ReactElement, type ReactNode, useMemo, useState } from 'react';
import { useDispatch, useStore } from 'react-redux';
import {
  isWideScreen,
  type PanelPlace,
  useMapLayersPanel,
} from '../mapLayersPanelStore.js';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';
import classes from './MapLayersPanel.module.css';
import {
  ListSearch,
  ListSortDropdown,
  type ListSortOption,
  PanelToolbar,
} from './PanelListControls.js';
import { RowRemoveButton } from './RowRemoveButton.js';

export type Bbox = [number, number, number, number];

export type Item = {
  key: string;
  icon: ReactElement;
  /** Its colour on the map, where it has one of its own. */
  color?: string | null;
  /** Also what the filter matches. */
  label: string;
  /** Shown in place of `label`, where plain text won't do. */
  display?: ReactNode;
  /** Shown muted, as what the item is where it has no label. */
  muted?: boolean;
  /** What kind of thing it is, muted after its name. */
  detail?: string;
  /** Figures worth not cutting off, on a line of their own under the name. */
  subline?: ReactNode;
  /** More text the filter finds it by, beside its label and detail. */
  search?: string;
  /** Its values for the list's sorts, by their `key`; one it lacks sorts last. */
  sortKeys?: Record<string, string | number | undefined>;
  /** The selection it is, highlighted while current, and made by a tap. */
  selects?: Selection;
  /** Dispatched by a tap instead, where selecting it on the map does more. */
  actions?: UnknownAction[];
  /** Highlighted as current, where that isn't the selection's to say. */
  current?: boolean;
  /** What a pick does beside dispatching, such as counting it. */
  onPick?: () => void;
  /** The pointer entering (`true`) or leaving the row. */
  onHover?: (hovering: boolean) => void;
  /** A page of its own, which picking it opens beside its other effects. */
  opens?: PanelPlace;
  /** Worked out only when it is picked: a long line has many points. */
  bbox: () => Bbox | undefined;
};

export type ItemSortOption = ListSortOption & {
  /** The `sortKeys` entry it orders by, its `id` unless set; one no item has keeps their order. */
  key?: string;
  desc?: boolean;
};

export type ItemSort = {
  options: ItemSortOption[];
  value: string;
  onChange: (id: string) => void;
};

// A filter box from this many items on.
const FILTER_FROM = 10;

const PAGE_ROWS = 100;

// A loop: spreading a long track into `Math.min` overflows the stack.
export function latLonBbox(points: Iterable<LatLon>): Bbox | undefined {
  let bbox: Bbox | undefined;

  for (const { lat, lon } of points) {
    bbox = bbox
      ? [
          Math.min(bbox[0], lon),
          Math.min(bbox[1], lat),
          Math.max(bbox[2], lon),
          Math.max(bbox[3], lat),
        ]
      : [lon, lat, lon, lat];
  }

  return bbox;
}

export function geojsonBbox(
  geojson: GeoJSON | null | undefined,
): Bbox | undefined {
  if (!geojson) {
    return undefined;
  }

  const [w, s, e, n] = turfBbox(geojson);

  return [w, s, e, n];
}

/** The sort chosen, or the first while that one is unavailable. */
export const effectiveSort = ({
  options,
  value,
}: Pick<ItemSort, 'options' | 'value'>) =>
  options.find((option) => option.id === value && !option.disabled) ??
  options[0];

// Plain decimals only: `Number` also takes ` ` as 0 and `0x10` as 16.
const DECIMAL = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;

function asNumber(value: string | number): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  const text = value.trim();

  return DECIMAL.test(text) ? Number(text) : undefined;
}

function sortItems(
  items: Item[],
  { id, key = id, desc }: ItemSortOption,
  collator: Intl.Collator,
): Item[] {
  // As given where no item has the key, as under the original order.
  if (!items.some((item) => item.sortKeys?.[key] !== undefined)) {
    return items;
  }

  const sign = desc ? -1 : 1;

  return items.toSorted((a, b) => {
    const x = a.sortKeys?.[key];

    const y = b.sortKeys?.[key];

    if (x === undefined || y === undefined) {
      return Number(x === undefined) - Number(y === undefined);
    }

    // Numbers by value (a collator orders `0.5` before `0.45`), then text,
    // either way: a consistent order over mixed values.
    const nx = asNumber(x);

    const ny = asNumber(y);

    if (nx === undefined || ny === undefined) {
      return nx !== undefined
        ? -1
        : ny !== undefined
          ? 1
          : sign * collator.compare(String(x), String(y));
    }

    return sign * (nx - ny);
  });
}

export function ItemList({
  items,
  footer,
  empty,
  sort,
  onSearchStart,
}: {
  items: Item[];
  /** Under the list, about the feature as a whole. */
  footer?: ReactNode;
  /** Said where there are no items at all; most lists are never empty. */
  empty?: string;
  sort?: ItemSort;
  /** Called once per search, not per keystroke. */
  onSearchStart?: () => void;
}): ReactElement {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const dispatch = useDispatch();

  const store = useStore<RootState>();

  // Read here alone, so selecting doesn't rebuild every list's items.
  const selection = useAppSelector((state) => state.main.selection);

  const language = useAppSelector((state) => state.l10n.language);

  const { setOpen, setPlace } = useMapLayersPanel();

  const [filter, setFilter] = useState('');

  const filterable = items.length >= FILTER_FROM;

  const sortable = sort !== undefined && items.length > 1;

  // Not while its box is gone: it would narrow the list out of sight.
  const query = filterable ? filter.trim().toLocaleLowerCase() : '';

  // Once per list, not per keystroke: a note's thread runs long.
  const haystacks = useMemo(
    () =>
      new Map(
        items.map((item) => [
          item,
          `${item.label} ${item.detail ?? ''} ${item.search ?? ''}`.toLocaleLowerCase(),
        ]),
      ),
    [items],
  );

  // Substring rather than fuzzy, which is quadratic in the text.
  const matching = useMemo(
    () =>
      query
        ? items.filter((item) => haystacks.get(item)?.includes(query))
        : items,
    [items, haystacks, query],
  );

  const sortedBy = sort && effectiveSort(sort);

  // Not again on every selection, which this reads.
  const sorted = useMemo(
    () =>
      sortedBy
        ? sortItems(
            matching,
            sortedBy,
            new Intl.Collator(language, { numeric: true }),
          )
        : matching,
    [matching, sortedBy, language],
  );

  // Rendered rows are costly (a tooltip and an observer each), so they come a
  // page at a time as the list scrolls.
  const { shown, more, reset } = usePaged(sorted, PAGE_ROWS);

  const pick = (item: Item) => {
    const state = store.getState();

    // A picked item has to be drawn to be seen.
    if (areFeaturesHidden(state.map.featuresOpacity)) {
      dispatch(mapSetFeaturesOpacity(1));
    }

    for (const action of item.actions ??
      (item.selects ? [selectFeature(item.selects)] : [])) {
      dispatch(action);
    }

    item.onPick?.();

    const after = store.getState();

    const openBefore = openToolsSelector(state);

    // A selection of another kind, or a tool just opened, brings up its
    // toolbar, which may cover the item: the fit measures once it is there.
    const toolbarComing =
      (after.main.selection !== null &&
        after.main.selection.type !== state.main.selection?.type) ||
      openToolsSelector(after).some((tool) => !openBefore.includes(tool));

    const bbox = item.bbox();

    if (item.opens) {
      setPlace(item.opens);
    }

    // On a phone the panel covers what was just selected; not a page opened.
    const closing = !item.opens && !isWideScreen();

    if (closing) {
      setOpen(false);
    }

    if (!bbox) {
      return;
    }

    // Into the part of the map nothing covers, once a closing panel is gone;
    // not moved where it is in view already, zoomed out only to fit, and never
    // past the store's zoom, which may be ahead of an animating map.
    const bringIntoView = () =>
      void fitToUncovered(dispatch, bbox, {
        ifHidden: true,
        margin: closing ? undefined : GENEROUS_MARGIN_PX,
        maxZoom: store.getState().map.zoom,
      });

    fitOnceSettled(bringIntoView, toolbarComing);
  };

  return (
    <>
      {(filterable || sortable) && (
        <PanelToolbar>
          {filterable && (
            <ListSearch
              placeholder={msm?.filterItems}
              value={filter}
              onSearchStart={onSearchStart}
              onChange={(value) => {
                setFilter(value);

                reset();
              }}
            />
          )}

          {sortable && (
            <div className="d-flex mb-2">
              <ListSortDropdown
                options={sort.options}
                value={sortedBy?.id ?? sort.value}
                onChange={(id) => {
                  sort.onChange(id);

                  reset();
                }}
              />
            </div>
          )}
        </PanelToolbar>
      )}

      {shown.map((item) => {
        const selected =
          item.current ??
          (item.selects !== undefined &&
            sameSelection(selection, item.selects));

        // Selected, the row is Bootstrap's `.active`: all of it white, the
        // muted parts a fainter white, as grey is lost on the blue.
        const muted = selected ? 'opacity-75' : 'text-muted';

        return (
          <div
            key={item.key}
            className={clsx(
              classes.row,
              selected && classes.rowSelected,
              'd-flex align-items-center gap-1 mx-n2 px-3',
            )}
            onMouseEnter={item.onHover && (() => item.onHover?.(true))}
            onMouseLeave={item.onHover && (() => item.onHover?.(false))}
          >
            <button
              type="button"
              className={clsx(
                classes.rowToggle,
                'flex-grow-1 d-flex align-items-center gap-1 text-start',
              )}
              onClick={() => pick(item)}
            >
              <span
                className="d-inline-flex flex-shrink-0"
                style={
                  item.color && !selected ? { color: item.color } : undefined
                }
              >
                {item.icon}
              </span>

              <span className="d-flex flex-column min-w-0">
                <TruncatedText
                  className={clsx(item.muted && muted)}
                  // Muted grey is lost on the tooltip's dark background.
                  tooltip={
                    item.detail ? `${item.label} · ${item.detail}` : undefined
                  }
                >
                  {item.display ?? item.label}

                  {item.detail && (
                    <span className={muted}> · {item.detail}</span>
                  )}
                </TruncatedText>

                {item.subline && (
                  <TruncatedText className={clsx('small', muted)}>
                    {item.subline}
                  </TruncatedText>
                )}
              </span>
            </button>

            {/* The selection stays, unless it is this item. */}
            {item.selects && DELETABLE_SELECTIONS.has(item.selects.type) && (
              <RowRemoveButton
                onClick={() => dispatch(deleteFeature(item.selects))}
              />
            )}
          </div>
        );
      })}

      {more}

      {(items.length === 0 ? empty : shown.length === 0) && (
        <p className="text-muted mt-1 mb-0">
          {items.length === 0 ? empty : m?.search.noResults}
        </p>
      )}

      {footer}
    </>
  );
}
