import { setActiveModal } from 'fm3/actions/mainActions';
import { tipsPreventNextTime, tipsShow } from 'fm3/actions/tipsActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { tips } from 'fm3/tips';
import {
  FormEvent,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Button from 'react-bootstrap/Button';
import FormCheck from 'react-bootstrap/FormCheck';
import Modal from 'react-bootstrap/Modal';
import {
  FaChevronLeft,
  FaChevronRight,
  FaRegLightbulb,
  FaTimes,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

type Props = { show: boolean };

export function TipsModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const tip = useSelector((state: RootState) => state.tips.tip);

  const [loading, setLoading] = useState(false);

  const [tipText, setTipText] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    import(/* webpackChunkName: "tip-[request]" */ `fm3/tips/${tip}.md`)
      .then(({ default: tipText }) => {
        setTipText(tipText);
      })
      .catch(() => {
        setTipText(m?.tips.errorLoading ?? null);
      })
      .then(() => {
        setLoading(false);
      });
  }, [tip, m]);

  const handleNextTimePrevent = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      dispatch(tipsPreventNextTime(e.currentTarget.checked));
    },
    [dispatch],
  );

  const [, title, icon] = useMemo(
    () =>
      tips.find(([key]) => key === tip) ?? [undefined, undefined, undefined],
    [tip],
  );

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  const loaded = !loading && !!tipText && !!ref;

  // effect is to handle local hrefs properly
  useEffect(() => {
    if (loaded) {
      for (const a of Array.from(ref?.querySelectorAll('a') ?? [])) {
        a.onclick = (e) => {
          const { href } = a;

          if (
            !href.startsWith(process.env['BASE_URL'] ?? '~') &&
            href.match(/^\w+:/)
          ) {
            return;
          }

          e.preventDefault();

          const url = new URL(document.location.href);

          const sp = url.searchParams;

          new URL(href).searchParams.forEach((value, key) => {
            if (value) {
              sp.set(key, value);
            } else {
              sp.delete(key);
            }
          });

          url.search = sp.toString();

          const stringUrl = url.toString();

          history.pushState(undefined, '', stringUrl);

          window.dispatchEvent(
            new PopStateEvent('popstate', { state: { sq: stringUrl } }),
          );
        };
      }
    }
  }, [loaded, ref]);

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaRegLightbulb />
          {m?.more.tips}
          {'\u00A0 | \u00A0'}
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
        {tipText ? (
          <div
            ref={setRef}
            style={loading ? { opacity: 0.5, cursor: 'progress' } : {}}
            dangerouslySetInnerHTML={{ __html: tipText }}
          />
        ) : (
          m?.general.loading
        )}
      </Modal.Body>
      <Modal.Footer>
        <FormCheck
          className="w-100"
          id="chk-prevent"
          onChange={handleNextTimePrevent}
          type="checkbox"
          label={m?.tips.prevent}
        />

        <Button
          variant="secondary"
          onClick={() => {
            dispatch(tipsShow('prev'));
          }}
        >
          <FaChevronLeft /> {m?.tips.previous}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            dispatch(tipsShow('next'));
          }}
        >
          <FaChevronRight /> {m?.tips.next}
        </Button>
        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
