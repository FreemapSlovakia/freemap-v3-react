import { documentShow } from 'fm3/actions/mainActions';
import { documents } from 'fm3/documents';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import { navigate } from 'fm3/navigationUtils';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FaRegLightbulb, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

type Props = { show: boolean };

export default DocumentModal;

export function DocumentModal({ show }: Props): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const documentKey = useAppSelector((state) => state.main.documentKey);

  const language = useAppSelector((state) => state.l10n.language);

  const [loading, setLoading] = useState(false);

  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    import(`fm3/documents/${documentKey}.${language}.md`)
      .catch(() => import(`fm3/documents/${documentKey}.md`))
      .then(({ default: content }) => {
        setContent(content);
      })
      .catch(() => {
        setContent(m?.tips.errorLoading ?? null);
      })
      .then(() => {
        setLoading(false);
      });
  }, [documentKey, m, language]);

  const tip = useMemo(
    () => documents.find(([key]) => key === documentKey),
    [documentKey],
  );

  function close() {
    dispatch(documentShow(null));
  }

  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  const loaded = !loading && !!content && !!ref;

  // effect is to handle local hrefs properly
  useEffect(() => {
    if (loaded) {
      for (const elem of Array.from(
        ref?.querySelectorAll('a[href^="/"]') ?? [],
      )) {
        const a = elem as HTMLAnchorElement;

        a.onclick = (e) => {
          const { href } = a;

          // if (
          //   !href.startsWith(process.env['BASE_URL'] ?? '~') &&
          //   href.match(/^\w+:/)
          // ) {
          //   return;
          // }

          e.preventDefault();

          navigate(new URL(href).searchParams);
        };
      }
    }
  }, [loaded, ref]);

  // useEffect(() => {
  //   fetch(
  //     'https://wiki.openstreetmap.org/w/api.php?action=parse&page=Main_Page&format=json&prop=text',
  //   )
  //     .then((response) => response.json())
  //     .then((json) => {
  //       setTipText(json.parse.text['*']);
  //     });
  // }, [tip]);

  if (!tip) {
    return null;
  }

  const [, title, icon, hidden] = tip;

  return (
    <Modal show={show} onHide={close} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {!hidden && (
            <>
              <FaRegLightbulb />
              {m?.mainMenu.tips}
              {'\u00A0 | \u00A0'}
            </>
          )}
          {title && icon ? (
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
