import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import {
  FmDismissButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { Button, Form, Modal, Nav } from 'react-bootstrap';
import { FaBook, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { getManualChapters } from '@/manual/index.js';
import { useMarkdownLinks } from '../hooks/useMarkdownLinks.js';
import { useDocumentsMessages } from '../translations/useDocumentsMessages.js';

type Props = { show: boolean };

const BODY_STYLE = { overflow: 'hidden' };

const NAV_STYLE = { width: '14rem' };

// Bootstrap fades the pill out and in, which reads as a flash of the old one.
const LINK_STYLE = { transition: 'none' };

// Without it a wide image or table would push the text past the modal.
const TEXT_STYLE = { minWidth: 0 };

// Module scope: an `import()` in the component body stops the React Compiler
// lowering it.
const loadChapter = (key: string, lang: string) =>
  import(
    /* webpackChunkName: "manual-[request]" */
    `@/manual/${key}.${lang}.md`
  );

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

    loadChapter(chapter.key, chapter.lang)
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
    dispatch(setActiveModal({ type: 'manual', chapter: key }));
  }

  return (
    <Modal show={show} onHide={close} size="xl" scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2 flex-grow-1 me-2">
          <FaBook className="flex-shrink-0" />

          <span className="d-none d-lg-inline">
            <Text k="mainMenu.manual" />
          </span>

          {/* Where the chapter list doesn't fit beside the text; up here it
              stays in view while the chapter scrolls. */}
          <Form.Select
            className="d-lg-none"
            value={chapter?.key}
            onChange={(e) => select(e.currentTarget.value)}
          >
            {chapters.map(({ key, title }) => (
              <option key={key} value={key}>
                {title}
              </option>
            ))}
          </Form.Select>
        </Modal.Title>
      </Modal.Header>

      {/* The list and the text scroll each on its own, so a list taller than
          the window can still be scrolled to its end. */}
      <Modal.Body className="d-flex p-0" style={BODY_STYLE}>
        <div
          ref={setNav}
          className="d-none d-lg-block flex-shrink-0 overflow-y-auto p-3 pe-0"
          style={NAV_STYLE}
        >
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

        <div className="flex-grow-1 overflow-y-auto p-3" style={TEXT_STYLE}>
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
