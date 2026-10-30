import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import {
  FmDismissButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { Col, Form, Modal, Nav, Row } from 'react-bootstrap';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { getManualChapters } from '@/manual/index.js';
import { useMarkdownLinks } from '../hooks/useMarkdownLinks.js';
import { useDocumentsMessages } from '../translations/useDocumentsMessages.js';

type Props = { show: boolean };

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

  const chapter =
    chapters.find(({ key }) => key === requested) ?? chapters.at(0);

  const [content, setContent] = useState<{ key: string; html: string }>();

  const [body, setBody] = useState<HTMLDivElement | null>(null);

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
      body?.closest('.modal-body')?.scrollTo(0, 0);
    }
  }, [loaded, body]);

  function close() {
    dispatch(setActiveModal(null));
  }

  function select(key: string) {
    dispatch(setActiveModal({ type: 'manual', chapter: key }));
  }

  return (
    <Modal show={show} onHide={close} size="xl" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaRegQuestionCircle /> <Text k="mainMenu.manual" />
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row>
          <Col md={3} className="d-none d-md-block">
            <Nav
              variant="pills"
              className="flex-column position-sticky top-0"
              activeKey={chapter?.key}
              onSelect={(key) => key && select(key)}
            >
              {chapters.map(({ key, icon, title }) => (
                <Nav.Link
                  key={key}
                  eventKey={key}
                  href={`#show=manual/${key}`}
                  onClick={(e) => e.preventDefault()}
                >
                  {icon} {title}
                </Nav.Link>
              ))}
            </Nav>
          </Col>

          <Col md={9}>
            <Form.Select
              className="d-md-none mb-3"
              value={chapter?.key}
              onChange={(e) => select(e.currentTarget.value)}
            >
              {chapters.map(({ key, title }) => (
                <option key={key} value={key}>
                  {title}
                </option>
              ))}
            </Form.Select>

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
          </Col>
        </Row>
      </Modal.Body>

      <FmModalFooter>
        <FmDismissButton label={m?.general.close} onClick={close} />
      </FmModalFooter>
    </Modal>
  );
}
