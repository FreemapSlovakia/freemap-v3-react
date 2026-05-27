import { useMessages } from '@features/l10n/l10nInjector.js';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FaIconSvg, loadAllIcons, useFaIcon } from '@shared/drawingIcons.js';
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

type Props = {
  /** Currently selected Font Awesome icon name (e.g. `flag`), or undefined. */
  selectedName?: string;
  onSelect: (name: string | undefined) => void;
};

export function IconPicker({ selectedName, onSelect }: Props): ReactElement {
  const m = useMessages();

  const [open, setOpen] = useState(false);

  const [query, setQuery] = useState('');

  const [allIcons, setAllIcons] = useState<IconDefinition[] | null>(null);

  // How many filtered results to render; grows as the user scrolls.
  const [limit, setLimit] = useState(PAGE);

  const targetRef = useRef<HTMLButtonElement>(null);

  // Render the popover inside this wrapper (which lives inside the surrounding
  // Modal) rather than portaling it to <body>; otherwise the Modal's focus trap
  // steals focus from the search input.
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDef = useFaIcon(selectedName);

  useEffect(() => {
    if (open && !allIcons) {
      loadAllIcons().then(setAllIcons);
    }
  }, [open, allIcons]);

  const q = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      !allIcons
        ? []
        : q
          ? allIcons.filter((def) => def.iconName.includes(q))
          : allIcons,
    [allIcons, q],
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
        {selectedDef ? (
          <FaIconSvg def={selectedDef} />
        ) : selectedName ? (
          <Spinner size="sm" />
        ) : (
          (m?.drawing.edit.iconChoose ?? '')
        )}
      </Button>

      {selectedName && (
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
              {!allIcons ? (
                <Spinner size="sm" />
              ) : (
                visible.map((def) => (
                  <Button
                    key={def.iconName}
                    size="sm"
                    variant={
                      selectedName === def.iconName
                        ? 'secondary'
                        : 'outline-secondary'
                    }
                    onClick={() => {
                      onSelect(def.iconName);

                      setOpen(false);
                    }}
                    title={def.iconName}
                  >
                    <FaIconSvg def={def} />
                  </Button>
                ))
              )}
            </div>
          </Popover.Body>
        </Popover>
      </Overlay>
    </div>
  );
}
