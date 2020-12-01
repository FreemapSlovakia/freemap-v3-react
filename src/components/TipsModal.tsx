import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactElement,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Checkbox from 'react-bootstrap/lib/Checkbox';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';

import tips from 'fm3/tips/index.json';

import { setActiveModal } from 'fm3/actions/mainActions';
import { tipsShow, tipsPreventNextTime } from 'fm3/actions/tipsActions';
import { useTranslator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';

export function TipsModal(): ReactElement {
  const t = useTranslator();

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
        setTipText(t('tips.errorLoading'));
      })
      .then(() => {
        setLoading(false);
      });
  }, [tip, t]);

  const handleNextTimePrevent = useCallback(
    (e: React.FormEvent<Checkbox>) => {
      dispatch(tipsPreventNextTime((e.target as HTMLInputElement).checked));
    },
    [dispatch],
  );

  const [, title, icon] = useMemo<
    [any, string | undefined, string | undefined]
  >(
    () =>
      tip
        ? (tips.find(([key]) => key === tip) as [any, string, string])
        : [undefined, undefined, undefined],
    [tip],
  );

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  return (
    <Modal show onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="lightbulb-o" />
          {t('more.tips')}
          {'\u00A0 | \u00A0'}
          {title && icon ? (
            <>
              <FontAwesomeIcon icon={icon} /> {title}
            </>
          ) : (
            t('general.loading')
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {tipText ? (
          <div
            style={loading ? { opacity: 0.5, cursor: 'progress' } : {}}
            dangerouslySetInnerHTML={{ __html: tipText }}
          />
        ) : (
          t('general.loading')
        )}
      </Modal.Body>
      <Modal.Footer>
        <FormGroup>
          <Button
            onClick={() => {
              dispatch(tipsShow('prev'));
            }}
          >
            <Glyphicon glyph="chevron-left" /> {t('tips.previous')}
          </Button>
          <Button
            onClick={() => {
              dispatch(tipsShow('next'));
            }}
          >
            <Glyphicon glyph="chevron-right" /> {t('tips.next')}
          </Button>{' '}
          <Checkbox inline onChange={handleNextTimePrevent}>
            {t('tips.prevent')}
          </Checkbox>{' '}
          <Button onClick={close}>
            <Glyphicon glyph="remove" /> {t('general.close')} <kbd>Esc</kbd>
          </Button>
        </FormGroup>
      </Modal.Footer>
    </Modal>
  );
}
