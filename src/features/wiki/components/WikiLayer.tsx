import { selectFeature } from '@app/store/actions.js';
import { HALO_OPACITY, HALO_WIDTH, SELECTION_COLOR } from '@shared/halo.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { Icon, type IconOptions } from 'leaflet';
import { type ReactElement, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { FaWikipediaW } from 'react-icons/fa';
import { Marker, Pane, Tooltip } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { selectedWikiId } from '../model/selectors.js';
import classes from './WikiLayer.module.css';

/** The ring a selected marker wears, as `RichMarker`'s `halo` draws it. */
const SELECTED_RING = `0 0 0 ${HALO_WIDTH / 2}px color-mix(in srgb, ${SELECTION_COLOR} ${HALO_OPACITY * 100}%, transparent)`;

/**
 * The glyph every marker clones, rendered once and at once into an element of
 * its own: a root on a marker's element would be lost, or doubled, as Leaflet
 * swaps or reuses it. At load, as `flushSync` can't run within a render.
 */
const GLYPH: Node = (() => {
  const holder = document.createElement('div');

  const root = createRoot(holder);

  flushSync(() => root.render(<FaWikipediaW />));

  const node = holder.firstChild!.cloneNode(true);

  root.unmount();

  return node;
})();

class WikiIcon extends Icon<IconOptions & { selected?: boolean }> {
  createIcon(oldIcon?: HTMLElement) {
    const reuse = oldIcon && oldIcon.tagName === 'DIV';

    const div = oldIcon && reuse ? oldIcon : document.createElement('div');

    // Reused when the icon is swapped (selected or not), so its glyph is
    // added anew rather than beside the old one.
    div.replaceChildren();

    // Leaflet's Icon._setIconStyles is an untyped internal method.
    (this as any)._setIconStyles(div, 'icon');

    div.style.boxShadow = this.options.selected ? SELECTED_RING : '';

    div.appendChild(GLYPH.cloneNode(true));

    return div;
  }

  createShadow(oldIcon?: HTMLElement) {
    return oldIcon ?? document.createElement('div');
  }
}

const iconOptions = {
  className: classes.wikiIcon,
  iconUrl: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -9],
  tooltipAnchor: [0, -9],
} satisfies IconOptions;

const wikiIcon = new WikiIcon(iconOptions);

const selectedWikiIcon = new WikiIcon({ ...iconOptions, selected: true });

export function WikiLayer(): ReactElement {
  const points = useAppSelector((state) => state.wiki.points);

  const selectedId = useAppSelector(selectedWikiId);

  const opacity = useAppSelector(
    (state) => state.map.layerSetups['w']?.opacity ?? 1,
  );

  const dispatch = useDispatch();

  // `Pane` reads its style once; set anew, it would remount every marker.
  const [pane, setPane] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (pane) {
      pane.style.opacity = String(opacity);
    }
  }, [pane, opacity]);

  // A marker's article opens in the panel (`WikiPanel`).
  return (
    <Pane name="wiki" ref={setPane}>
      {points.map(({ id, lat, lon, name, wikipedia }) => (
        <Marker
          key={id}
          position={{ lat, lng: lon }}
          icon={wikipedia === selectedId ? selectedWikiIcon : wikiIcon}
          zIndexOffset={wikipedia === selectedId ? 1000 : 0}
          eventHandlers={{
            click() {
              dispatch(selectFeature({ type: 'wiki', id: wikipedia }));
            },
          }}
        >
          {(wikipedia || name) && (
            <Tooltip className="compact" direction="top" permanent>
              <div
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 150,
                }}
              >
                {wikipedia.replace(/^[a-z]+:/, '') || name}
              </div>
            </Tooltip>
          )}
        </Marker>
      ))}
    </Pane>
  );
}
