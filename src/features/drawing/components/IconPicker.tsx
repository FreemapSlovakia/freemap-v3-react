import { useMessages } from '@features/l10n/l10nInjector.js';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
  FaIconSvg,
  faSpec,
  loadAllIcons,
  parseIconSpec,
  poiIconNameToUrl,
  poiSpec,
  useFaIcon,
} from '@shared/drawingIcons.js';
import classes from '@shared/poiIcon.module.css';
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

const PAGE = 120;

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
  const m = useMessages();

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
          <FaIconSvg def={selectedFa} />
        ) : selectedPoiUrl ? (
          <img src={selectedPoiUrl} alt="" className={classes['icon']} />
        ) : selectedSpec?.kind === 'fa' ? (
          <Spinner size="sm" />
        ) : (
          (m?.drawing.edit.iconChoose ?? '')
        )}
      </Button>

      {selectedSpec && selectedSpec.kind !== 'text' && (
        <Button
          variant="outline-secondary"
          onClick={() => onSelect(undefined)}
          title={m?.drawing.edit.iconNone}
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
              placeholder={m?.drawing.edit.iconSearch}
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
                      <FaIconSvg def={e.def} />
                    ) : (
                      <img src={e.url} alt="" className={classes['icon']} />
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
