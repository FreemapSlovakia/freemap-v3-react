import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { removeAccents } from '@shared/stringUtils.js';
import type { Layer } from '@shared/wms.js';
import clsx from 'clsx';
import {
  type CSSProperties,
  Fragment,
  type ReactElement,
  useState,
} from 'react';
import { Button, Form, ListGroup, ListGroupItem } from 'react-bootstrap';
import {
  FaAngleDown,
  FaAngleRight,
  FaCheckSquare,
  FaRegSquare,
} from 'react-icons/fa';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';
import classes from './CustomMapForm.module.css';

type Props = {
  layers: Layer[] | undefined;
  selected: readonly string[];
  onChange: (selected: string[]) => void;
  className?: string;
  style?: CSSProperties;
};

/** Past this many layers the tree gets a search box. */
const SEARCH_FROM = 10;

const normalize = (s: string) => removeAccents(s).toLowerCase();

/**
 * The layers Select all picks: named ones with no named layer below them, as a
 * named group draws its children again.
 */
function leaves(layers: Layer[]): string[] {
  return layers.flatMap((layer) => {
    const below = leaves(layer.children);

    return below.length ? below : layer.name ? [layer.name] : [];
  });
}

/** Every named layer, in the order the service lists them. */
const named = (layers: Layer[]): string[] =>
  layers.flatMap((layer) => [
    ...(layer.name ? [layer.name] : []),
    ...named(layer.children),
  ]);

/** A WMS's layer tree, a named layer toggled by a click, a group folded. */
export function WmsLayerTree({
  layers,
  selected,
  onChange,
  className,
  style,
}: Props): ReactElement {
  const msm = useMapSettingsMessages();

  const [expanded, setExpanded] = useState<string[]>([]);

  const [query, setQuery] = useState('');

  const toggleExpanded = (id: string) =>
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );

  const needle = normalize(query.trim());

  const matches = (layer: Layer) =>
    normalize(layer.title ?? layer.name ?? '').includes(needle);

  // What the search leaves: a match with everything under it, and the groups
  // leading to one.
  function shown(layers: Layer[]): Layer[] {
    return needle
      ? layers.flatMap((layer) => {
          if (matches(layer)) {
            return [layer];
          }

          const children = shown(layer.children);

          return children.length ? [{ ...layer, children }] : [];
        })
      : layers;
  }

  const visible = shown(layers ?? []);

  const searchable = leaves(layers ?? []).length > SEARCH_FROM;

  // Select all and Deselect all act on what the search shows.
  const targets = leaves(visible);

  // A WMS draws the first layer asked for at the bottom; servers list theirs
  // bottom first too, so an added layer goes before the first picked one the
  // service lists after it rather than on top. The rest keep their order.
  const order = named(layers ?? []);

  const add = (names: string[]) => {
    const next = [...selected];

    for (const name of names) {
      if (!next.includes(name)) {
        const after = next.findIndex(
          (n) => order.indexOf(n) > order.indexOf(name),
        );

        next.splice(after === -1 ? next.length : after, 0, name);
      }
    }

    onChange(next);
  };

  const selectAll = () => add(targets);

  const deselectAll = () =>
    onChange(selected.filter((n) => !targets.includes(n)));

  function renderLayers(layers: Layer[], path: number[] = []) {
    return layers.map((layer, i) => {
      const id = [...path, i].join(',');

      // A search unfolds every group it leaves.
      const open = needle !== '' || expanded.includes(id);

      return (
        <Fragment key={id}>
          {/* One line each, cut short; the whole title is in the tooltip. */}
          <LongPressTooltip label={layer.title}>
            {({ props }) => (
              <ListGroupItem
                eventKey={layer.name ?? undefined}
                active={layer.name ? selected.includes(layer.name) : undefined}
                action={layer.name !== null}
                as={
                  layer.children.length > 0
                    ? ('div' as unknown as 'button') // to add type
                    : 'button'
                }
                type="button"
                className="d-flex align-items-center text-nowrap"
                {...props}
              >
                {path.map((_, i) => (
                  <span key={i} className="ps-4 flex-shrink-0" />
                ))}

                {layer.children.length > 0 && (
                  <button
                    className="border-0 bg-transparent ms-n2 mx-0 flex-shrink-0"
                    style={{ width: '2rem' }}
                    type="button"
                    disabled={needle !== ''}
                    onClick={(e) => {
                      e.stopPropagation();

                      toggleExpanded(id);
                    }}
                  >
                    {open ? <FaAngleDown /> : <FaAngleRight />}
                  </button>
                )}

                <span
                  className={clsx(
                    'text-truncate',
                    layer.children.length === 0 && 'ms-4',
                  )}
                >
                  {layer.title}
                </span>
              </ListGroupItem>
            )}
          </LongPressTooltip>

          {layer.children.length > 0 ? (
            <div className={clsx(classes.listGroupNested, open || 'd-none')}>
              {renderLayers(layer.children, [...path, i])}
            </div>
          ) : null}
        </Fragment>
      );
    });
  }

  return (
    <div
      className={clsx('d-flex flex-column', className)}
      style={{ minHeight: 0, ...style }}
    >
      {layers && (
        <div className="d-flex gap-1 mb-2 flex-shrink-0">
          {searchable && (
            <Form.Control
              type="search"
              size="sm"
              className="flex-grow-1"
              placeholder={msm?.wmsLayers.search}
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
            />
          )}

          <LongPressTooltip label={msm?.wmsLayers.selectAll}>
            {({ props }) => (
              <Button
                variant="secondary"
                size="sm"
                className={clsx(!searchable && 'ms-auto')}
                disabled={targets.every((n) => selected.includes(n))}
                onClick={selectAll}
                {...props}
              >
                <FaCheckSquare />
              </Button>
            )}
          </LongPressTooltip>

          <LongPressTooltip label={msm?.wmsLayers.deselectAll}>
            {({ props }) => (
              <Button
                variant="secondary"
                size="sm"
                disabled={!targets.some((n) => selected.includes(n))}
                onClick={deselectAll}
                {...props}
              >
                <FaRegSquare />
              </Button>
            )}
          </LongPressTooltip>
        </div>
      )}

      <ListGroup
        className="overflow-auto flex-grow-1"
        style={{ minHeight: 0 }}
        onSelect={(name) => {
          if (name === null) {
            return;
          }

          if (selected.includes(name)) {
            onChange(selected.filter((n) => n !== name));
          } else {
            add([name]);
          }
        }}
      >
        {renderLayers(visible)}
      </ListGroup>
    </div>
  );
}
