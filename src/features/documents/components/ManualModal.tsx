import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import {
  FmDismissButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Modal } from '@shared/components/Modal.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import clsx from 'clsx';
import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { Button, Form, Nav } from 'react-bootstrap';
import { FaBook, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { getManualChapters } from '@/manual/index.js';
import { useMarkdownLinks } from '../hooks/useMarkdownLinks.js';
import { loadManualChapter } from '../loadManualChapter.js';
import { useDocumentsMessages } from '../translations/useDocumentsMessages.js';
import classes from './ManualModal.module.css';
import {
  ManualSearchResults,
  type ManualTarget,
  useManualSearch,
} from './ManualSearch.js';

type Props = { show: boolean };

const BODY_STYLE = { overflow: 'hidden' };

// Bootstrap fades the pill out and in, which reads as a flash of the old one.
const LINK_STYLE = { transition: 'none' };

// Without it a wide image or table would push the text past the modal.
const TEXT_STYLE = { minWidth: 0 };

export default ManualModal;

function ManualModal({ show }: Props): ReactElement {
  const m = useMessages();

  const docm = useDocumentsMessages();

  const dispatch = useDispatch();

  const requested = useAppSelector((state) =>
    state.main.activeModal?.type === 'manual'
      ? state.main.activeModal.chapter
      : undefined,
  );

  const language = useAppSelector((state) => state.l10n.language);

  const chapters = useMemo(() => getManualChapters(language), [language]);

  const index = Math.max(
    0,
    chapters.findIndex(({ key }) => key === requested),
  );

  const chapter = chapters.at(index);

  const prev = index > 0 ? chapters.at(index - 1) : undefined;

  const next = chapters.at(index + 1);

  const [content, setContent] = useState<{ key: string; html: string }>();

  const [body, setBody] = useState<HTMLDivElement | null>(null);

  const [nav, setNav] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chapter) {
      return;
    }

    let cancelled = false;

    loadManualChapter(chapter.key, chapter.lang)
      .then(({ default: html }) => html)
      .catch(() => docm?.errorLoading ?? '')
      .then((html) => {
        if (!cancelled) {
          setContent({ key: chapter.key, html });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chapter, docm?.errorLoading]);

  // Apart from the load, which runs again once the messages arrive.
  const chapterKey = chapter?.key;

  useEffect(() => {
    if (chapterKey) {
      trackMatomo(['trackEvent', 'Manual', 'chapter', chapterKey]);
    }
  }, [chapterKey]);

  const loaded = content !== undefined && content.key === chapter?.key;

  useMarkdownLinks(body, loaded);

  // A new chapter starts at its top, not where the last one was scrolled to.
  useEffect(() => {
    if (loaded) {
      body?.parentElement?.scrollTo(0, 0);
    }
  }, [loaded, body]);

  const [query, setQuery] = useState('');

  const searching = query.trim().length >= 2;

  // Below `lg` the results take the text's place until one is picked.
  const [picked, setPicked] = useState(false);

  const search = useManualSearch(query, chapters);

  // A section a search hit asked for, once its chapter is in; after the effect
  // above, which would scroll it back to the top.
  const [target, setTarget] = useState<ManualTarget>();

  useEffect(() => {
    if (!loaded || !body || !target || target.key !== chapterKey) {
      return;
    }

    // The chapter's top too: picked while open, it doesn't reload.
    if (target.section > 0) {
      body
        .querySelectorAll(':scope > h2')
        [target.section - 1]?.scrollIntoView({ block: 'start' });
    } else {
      body.parentElement?.scrollTo(0, 0);
    }

    // Served once: reopening the chapter later starts at its top.
    setTarget(undefined);
  }, [loaded, body, target, chapterKey]);

  // In the header below `lg`, above the chapter list from it.
  const searchField = (className: string) => (
    <Form.Control
      type="search"
      className={className}
      placeholder={docm?.searchManual}
      value={query}
      onChange={(e) => {
        setQuery(e.currentTarget.value);

        setPicked(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.nativeEvent.isComposing && search.first) {
          pick(search.first);
        } else if (e.key === 'Escape' && query) {
          // Clears the field rather than closing the manual.
          e.stopPropagation();

          setQuery('');
        }
      }}
    />
  );

  function pick(found: ManualTarget) {
    trackMatomo(['trackEvent', 'Manual', 'search', found.key]);

    setTarget(found);

    select(found.key);
  }

  // A chapter opened by a link may sit below the list's fold.
  useEffect(() => {
    if (chapterKey) {
      nav?.querySelector('.active')?.scrollIntoView({ block: 'nearest' });
    }
  }, [chapterKey, nav]);

  function close() {
    dispatch(setActiveModal(null));
  }

  function select(key: string) {
    // Below `lg` a chapter chosen any way brings the text back over the results.
    setPicked(true);

    dispatch(setActiveModal({ type: 'manual', chapter: key }));
  }

  return (
    <Modal show={show} onHide={close} size="xl" scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex flex-wrap align-items-center gap-2 flex-grow-1 me-2">
          <FaBook className="flex-shrink-0" />

          <span className="d-none d-lg-inline">
            <Text k="mainMenu.manual" />
          </span>

          {/* Where the chapter list doesn't fit beside the text; up here it
              stays in view while the chapter scrolls. */}
          <Form.Select
            className={clsx(classes.headerField, 'd-lg-none')}
            value={chapter?.key}
            onChange={(e) => select(e.currentTarget.value)}
          >
            {chapters.map(({ key, title }) => (
              <option key={key} value={key}>
                {title}
              </option>
            ))}
          </Form.Select>

          {searchField(clsx(classes.headerField, 'd-lg-none'))}
        </Modal.Title>
      </Modal.Header>

      {/* The list and the text scroll each on its own, so a list taller than
          the window can still be scrolled to its end. */}
      <Modal.Body
        className="d-flex flex-column flex-lg-row p-0"
        style={BODY_STYLE}
      >
        <div
          className={clsx(
            classes.side,
            // A third of the modal at `lg`, a quarter of the wider one at `xl`.
            'col-lg-4 col-xl-3 flex-column flex-lg-shrink-0 gap-2 p-3 pe-lg-0',
            // Below `lg` only the results, in place of the text.
            searching && !picked
              ? 'd-flex flex-grow-1 flex-lg-grow-0'
              : 'd-none d-lg-flex flex-shrink-0',
          )}
        >
          {searchField('d-none d-lg-block')}

          {searching ? (
            <ManualSearchResults
              search={search}
              chapters={chapters}
              onSelect={pick}
              className="overflow-y-auto"
            />
          ) : (
            <div ref={setNav} className="d-none d-lg-block overflow-y-auto">
              <Nav
                variant="pills"
                className="flex-column"
                activeKey={chapter?.key}
                onSelect={(key) => key && select(key)}
              >
                {chapters.map(({ key, icon, title }) => (
                  <Nav.Link
                    key={key}
                    eventKey={key}
                    style={LINK_STYLE}
                    href={`#show=manual/${key}`}
                    onClick={(e) => e.preventDefault()}
                  >
                    {icon} {title}
                  </Nav.Link>
                ))}
              </Nav>
            </div>
          )}
        </div>

        <div
          className={clsx(
            'flex-grow-1 overflow-y-auto p-3',
            searching && !picked && 'd-none d-lg-block',
          )}
          style={TEXT_STYLE}
        >
          {content ? (
            <div
              ref={setBody}
              className="markdown"
              style={loaded ? {} : { opacity: 0.5, cursor: 'progress' }}
              dangerouslySetInnerHTML={{ __html: content.html }}
            />
          ) : (
            <Text k="general.loading" />
          )}
        </div>
      </Modal.Body>

      <FmModalFooter>
        {/* Only beside the drop-down; the chapter list is a step away otherwise. */}
        <ChapterStep
          to={prev}
          icon={<FaChevronLeft />}
          className="d-lg-none"
          onSelect={select}
        />

        <ChapterStep
          to={next}
          icon={<FaChevronRight />}
          className="d-lg-none me-auto"
          onSelect={select}
        />

        <FmDismissButton label={m?.general.close} onClick={close} />
      </FmModalFooter>
    </Modal>
  );
}

type StepProps = {
  to: { key: string; title: string } | undefined;
  icon: ReactElement;
  className: string;
  onSelect: (key: string) => void;
};

function ChapterStep({ to, icon, className, onSelect }: StepProps) {
  // No chapter that way: nothing for a tooltip to name.
  if (!to) {
    return (
      <Button variant="secondary" className={className} disabled>
        {icon}
      </Button>
    );
  }

  return (
    <LongPressTooltip label={to.title}>
      {({ props }) => (
        <Button
          variant="secondary"
          className={className}
          onClick={() => onSelect(to.key)}
          {...props}
        >
          {icon}
        </Button>
      )}
    </LongPressTooltip>
  );
}
