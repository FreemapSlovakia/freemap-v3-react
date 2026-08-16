import { useMessages } from '@features/l10n/l10nInjector.js';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { poiIcons } from '@osm/poiIcons.js';
import { IconGlyph } from '@shared/components/IconGlyph.js';
import {
  faSpec,
  loadAllIcons,
  parseIconSpec,
  poiSpec,
  useFaIcon,
} from '@shared/drawingIcons.js';
import {
  type ReactElement,
  type ReactNode,
  type UIEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, Form, Overlay, Popover, Spinner } from 'react-bootstrap';
import { FaXmark } from 'react-icons/fa6';

const PAGE = 120;

type PoiEntry = { kind: 'poi'; name: string };

type FaEntry = { kind: 'fa'; name: string; def: IconDefinition };

type Entry = PoiEntry | FaEntry;

const poiEntries: PoiEntry[] = Object.keys(poiIcons)
  .map((name) => ({ kind: 'poi' as const, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

type Props = {
  /** Currently selected icon spec (`fa:<name>` or `poi:<name>`), or undefined. */
  selected?: string;
  onSelect: (spec: string | undefined) => void;
  /** What the button shows with nothing picked; defaults to a "choose" label. */
  placeholder?: ReactNode;
  /** Goes on the button that opens the picker, for a `<label>` to point at. */
  id?: string;
};

export function IconPicker({
  selected,
  onSelect,
  placeholder,
  id,
}: Props): ReactElement {
  const m = useMessages();

  const [open, setOpen] = useState(false);

  const [query, setQuery] = useState('');

  const [faIcons, setFaIcons] = useState<IconDefinition[] | null>(null);

  // How many filtered results to render; grows as the user scrolls.
  const [limit, setLimit] = useState(PAGE);

  const targetRef = useRef<HTMLButtonElement>(null);

  const selectedSpec = parseIconSpec(selected);

  const selectedFa = useFaIcon(
    selectedSpec?.kind === 'fa' ? selectedSpec.name : undefined,
  );

  const selectedPoi =
    selectedSpec?.kind === 'poi' && poiIcons[selectedSpec.name]
      ? selectedSpec.name
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
    <div className="d-flex gap-1 align-items-center">
      <Button
        ref={targetRef}
        id={id}
        variant="outline-secondary"
        title={m?.general.iconChoose}
        onClick={() => setOpen((o) => !o)}
      >
        {selectedFa ? (
          <IconGlyph def={selectedFa} />
        ) : selectedPoi ? (
          <IconGlyph poi={selectedPoi} />
        ) : selectedSpec?.kind === 'fa' ? (
          <Spinner size="sm" />
        ) : (
          (placeholder ?? m?.general.iconChoose ?? '')
        )}
      </Button>

      {selectedSpec && selectedSpec.kind !== 'text' && (
        <Button
          variant="outline-secondary"
          onClick={() => onSelect(undefined)}
          title={m?.general.iconNone}
        >
          <FaXmark />
        </Button>
      )}

      {/*
        The popover portals to <body> (react-bootstrap's default with no
        `container`) so it escapes the surrounding modal's `scrollable` body
        overflow instead of being clipped by it. This requires the enclosing
        modal to set `enforceFocus={false}` (every current consumer does), else
        the modal's focus trap would steal focus from the search input.
      */}
      <Overlay
        target={targetRef.current}
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
              placeholder={m?.general.iconSearch}
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
                    variant="outline-secondary"
                    active={isSelected}
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
                      <IconGlyph poi={e.name} />
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
