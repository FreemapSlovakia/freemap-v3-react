import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { documentShow } from '../actions/mainActions.js';
import { getDocuments } from '../documents/index.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useMessages } from '../l10nInjector.js';
import { navigate } from '../navigationUtils.js';

type Props = { show: boolean };

export default DocumentModal;

export function DocumentModal({ show }: Props): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const documentKey = useAppSelector((state) => state.main.documentKey);

  const language = useAppSelector((state) => state.l10n.language);

  const [loading, setLoading] = useState(false);

  const [content, setContent] = useState<string | null>(null);

  const document = useMemo(
    () => getDocuments(language).find(({ key }) => key === documentKey),
    [documentKey, language],
  );

  useEffect(() => {
    if (!document) {
      // TODO show not found error
      return;
    }

    setLoading(true);

    import(`../documents/${document.key}.${document.lang}.md`)
      .then(({ default: content }) => {
        setContent(content);
      })
      .catch(() => {
        setContent(m?.documents.errorLoading ?? null);
      })
      .then(() => {
        setLoading(false);
      });
  }, [document, m]);

  function close() {
    dispatch(documentShow(null));
  }

  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  const loaded = !loading && !!content && !!ref;

  // effect is to handle local hrefs properly
  useEffect(() => {
    if (loaded) {
      for (const elem of Array.from(
        ref?.querySelectorAll('a[href^="#"]') ?? [],
      )) {
        const a = elem as HTMLAnchorElement;

        a.onclick = (e) => {
          const { href } = a;

          e.preventDefault();

          const i = href.lastIndexOf('#');

          navigate(href.slice(i + 1));
        };
      }
    }
  }, [loaded, ref]);

  if (!document) {
    return null;
  }

  const { title, icon } = document;

  return (
    <Modal show={show} onHide={close} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {/* {!hidden && (
            <>
              <FaRegLightbulb />
              {m?.mainMenu.tips}
              {'\u00A0 | \u00A0'}
            </>
          )} */}
          {title ? (
            <>
              {icon} {title}
            </>
          ) : (
            m?.general.loading
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {content ? (
          <div
            ref={setRef}
            className="markdown"
            style={loading ? { opacity: 0.5, cursor: 'progress' } : {}}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          m?.general.loading
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
