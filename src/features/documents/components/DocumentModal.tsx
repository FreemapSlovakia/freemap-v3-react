import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import {
  FmDismissButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { getDocuments } from '@/documents/index.js';
import { useMarkdownLinks } from '../hooks/useMarkdownLinks.js';
import { documentShow } from '../model/actions.js';
import { useDocumentsMessages } from '../translations/useDocumentsMessages.js';

type Props = { show: boolean };

// Module scope: an `import()` in the component body stops the React Compiler
// lowering it.
const loadDocument = (key: string, lang: string) =>
  import(
    /* webpackChunkName: "document-[request]" */
    `@/documents/${key}.${lang}.md`
  );

export default DocumentModal;
function DocumentModal({ show }: Props): ReactElement | null {
  const m = useMessages();

  const docm = useDocumentsMessages();

  const dispatch = useDispatch();

  const documentKey = useAppSelector((state) =>
    state.main.activeModal?.type === 'document'
      ? state.main.activeModal.key
      : null,
  );

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

    loadDocument(document.key, document.lang)
      .then(({ default: content }) => {
        setContent(content);
      })
      .catch(() => {
        setContent(docm?.errorLoading ?? null);
      })
      .then(() => {
        setLoading(false);
      });
  }, [document, docm?.errorLoading]);

  function close() {
    dispatch(documentShow(null));
  }

  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  const loaded = !loading && Boolean(content) && Boolean(ref);

  useMarkdownLinks(ref, loaded);

  if (!document) {
    return null;
  }

  const { title, icon } = document;

  return (
    <Modal show={show} onHide={close} size="lg" scrollable>
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
            <Text k="general.loading" />
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
          <Text k="general.loading" />
        )}
      </Modal.Body>

      <FmModalFooter>
        <FmDismissButton label={m?.general.close} onClick={close} />
      </FmModalFooter>
    </Modal>
  );
}
