import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { poiIconBBoxes } from '@osm/poiIconBBoxes.js';
import {
  faIconToSvg,
  faSpec,
  loadAllIcons,
  parseIconSpec,
  poiIconNameToUrl,
  poiSpec,
  useFaIcon,
} from '@shared/drawingIcons.js';
import classes from '@shared/poiIcon.module.css';
import { poiIconGlyphRect } from '@shared/poiIconGlyph.js';
import {
  type ReactElement,
  type UIEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, Form, Overlay, Popover, Spinner } from 'react-bootstrap';
import { FaXmark } from 'react-icons/fa6';
import { useDrawingMessages } from '../translations/useDrawingMessages.js';

const PAGE = 120;

// The glyph drawing box, in user units — the same intrinsic-scale RichMarker
// uses (so e.g. `peak` stays small instead of filling the cell, and fa icons
// scale to the box). Some fa paths have ink reaching outside their declared
// viewBox (e.g. person-hiking's head sits at y=-32); the marker doesn't clip it
// because it draws into a much larger canvas, so the svg here is `overflow:
// visible` to match (the button padding leaves room for the spill).
const GLYPH_BOX = 160;

// Renders a single icon the way the marker glyph does, so the picker preview is
// faithful: the glyph centered in a fixed square viewBox, black-filled.
function IconGlyph(
  props: { url: string; def?: never } | { def: IconDefinition; url?: never },
): ReactElement {
  const c = GLYPH_BOX / 2;

  return (
    <svg
      viewBox={`0 0 ${GLYPH_BOX} ${GLYPH_BOX}`}
      overflow="visible"
      className={classes.icon}
      aria-hidden="true"
    >
      {props.def
        ? (() => {
            const { width, height, path } = faIconToSvg(props.def);

            const scale = GLYPH_BOX / Math.max(width, height);

            return (
              <path
                d={path}
                fill="black"
                transform={`translate(${c - (width * scale) / 2} ${
                  c - (height * scale) / 2
                }) scale(${scale})`}
              />
            );
          })()
        : (() => {
            const bbox = poiIconBBoxes[props.url];

            const rect = bbox
              ? poiIconGlyphRect(bbox, c, c, GLYPH_BOX)
              : { x: 0, y: 0, width: GLYPH_BOX, height: GLYPH_BOX };

            return <image {...rect} href={props.url} />;
          })()}
    </svg>
  );
}

type PoiEntry = { kind: 'poi'; name: string; url: string };

type FaEntry = { kind: 'fa'; name: string; def: IconDefinition };

type Entry = PoiEntry | FaEntry;

const poiEntries: PoiEntry[] = Object.entries(poiIconNameToUrl)
  .map(([name, url]) => ({ kind: 'poi' as const, name, url }))
  .sort((a, b) => a.name.localeCompare(b.name));

type Props = {
  /** Currently selected icon spec (`fa:<name>` or `poi:<name>`), or undefined. */
  selected?: string;
  onSelect: (spec: string | undefined) => void;
};

export function IconPicker({ selected, onSelect }: Props): ReactElement {
  const dm = useDrawingMessages();

  const [open, setOpen] = useState(false);

  const [query, setQuery] = useState('');

  const [faIcons, setFaIcons] = useState<IconDefinition[] | null>(null);

  // How many filtered results to render; grows as the user scrolls.
  const [limit, setLimit] = useState(PAGE);

  const targetRef = useRef<HTMLButtonElement>(null);

  // Render the popover inside this wrapper (which lives inside the surrounding
  // Modal) rather than portaling it to <body>; otherwise the Modal's focus trap
  // steals focus from the search input.
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedSpec = parseIconSpec(selected);

  const selectedFa = useFaIcon(
    selectedSpec?.kind === 'fa' ? selectedSpec.name : undefined,
  );

  const selectedPoiUrl =
    selectedSpec?.kind === 'poi'
      ? poiIconNameToUrl[selectedSpec.name]
      : undefined;

  useEffect(() => {
    if (open && !faIcons) {
      loadAllIcons().then(setFaIcons);
    }
  }, [open, faIcons]);

  const q = query.trim().toLowerCase();

  const entries = useMemo<Entry[]>(() => {
    const faEntries: FaEntry[] = (faIcons ?? []).map((def) => ({
      kind: 'fa',
      name: def.iconName,
      def,
    }));

    return [...poiEntries, ...faEntries];
  }, [faIcons]);

  const filtered = useMemo(
    () => (q ? entries.filter((e) => e.name.includes(q)) : entries),
    [entries, q],
  );

  const visible = filtered.slice(0, limit);

  function handleScroll(e: UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;

    if (
      el.scrollHeight - el.scrollTop - el.clientHeight < 200 &&
      limit < filtered.length
    ) {
      setLimit((l) => l + PAGE);
    }
  }

  return (
    <div className="d-flex gap-1 align-items-center" ref={containerRef}>
      <Button
        ref={targetRef}
        variant="outline-secondary"
        onClick={() => setOpen((o) => !o)}
      >
        {selectedFa ? (
          <IconGlyph def={selectedFa} />
        ) : selectedPoiUrl ? (
          <IconGlyph url={selectedPoiUrl} />
        ) : selectedSpec?.kind === 'fa' ? (
          <Spinner size="sm" />
        ) : (
          (dm?.edit.iconChoose ?? '')
        )}
      </Button>

      {selectedSpec && selectedSpec.kind !== 'text' && (
        <Button
          variant="outline-secondary"
          onClick={() => onSelect(undefined)}
          title={dm?.edit.iconNone}
        >
          <FaXmark />
        </Button>
      )}

      <Overlay
        target={targetRef.current}
        container={containerRef.current}
        show={open}
        placement="bottom-start"
        rootClose
        onHide={() => setOpen(false)}
      >
        <Popover style={{ maxWidth: 'none' }}>
          <Popover.Body>
            <Form.Control
              autoFocus
              type="search"
              value={query}
              placeholder={dm?.edit.iconSearch}
              onChange={(e) => {
                setQuery(e.currentTarget.value);

                setLimit(PAGE);
              }}
            />

            <div
              className="d-flex flex-wrap gap-1 mt-2 overflow-auto"
              style={{ maxHeight: '14rem', width: '20rem' }}
              onScroll={handleScroll}
            >
              {visible.map((e) => {
                const isSelected =
                  selectedSpec?.kind === e.kind && selectedSpec.name === e.name;

                return (
                  <Button
                    key={`${e.kind}:${e.name}`}
                    size="sm"
                    className="p-2 lh-1"
                    variant={isSelected ? 'secondary' : 'outline-secondary'}
                    onClick={() => {
                      onSelect(
                        e.kind === 'fa' ? faSpec(e.name) : poiSpec(e.name),
                      );

                      setOpen(false);
                    }}
                    title={e.name}
                  >
                    {e.kind === 'fa' ? (
                      <IconGlyph def={e.def} />
                    ) : (
                      <IconGlyph url={e.url} />
                    )}
                  </Button>
                );
              })}

              {!faIcons && <Spinner size="sm" />}
            </div>
          </Popover.Body>
        </Popover>
      </Overlay>
    </div>
  );
}
