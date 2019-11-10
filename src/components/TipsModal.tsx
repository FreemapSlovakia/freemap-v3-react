import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Checkbox from 'react-bootstrap/lib/Checkbox';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';

import tips from 'fm3/tips/index.json';

import { setActiveModal } from 'fm3/actions/mainActions';
import { tipsShow, tipsPreventNextTime } from 'fm3/actions/tipsActions';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

export const TipsModalInt: React.FC<Props> = ({
  tip,
  onPrevious,
  onNext,
  onModalClose,
  t,
  onNextTimePrevent,
}) => {
  const [loading, setLoading] = useState(false);
  const [tipText, setTipText] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    import(/* webpackChunkName: "tip-[request]" */ `fm3/tips/${tip}.md`)
      .then(({ default: tipText }) => {
        setTipText(tipText);
      })
      .catch(() => {
        setTipText('Tip sa nepodarilo načítať.'); // TODO translate
      })
      .then(() => {
        setLoading(false);
      });
  }, [tip]);

  const handleNextTimePrevent = useCallback(
    (e: React.FormEvent<Checkbox>) => {
      onNextTimePrevent((e.target as HTMLInputElement).checked);
    },
    [onNextTimePrevent],
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

  return (
    <Modal show onHide={onModalClose}>
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
          <Button onClick={onPrevious}>
            <Glyphicon glyph="chevron-left" /> {t('tips.previous')}
          </Button>
          <Button onClick={onNext}>
            <Glyphicon glyph="chevron-right" /> {t('tips.next')}
          </Button>{' '}
          <Checkbox inline onChange={handleNextTimePrevent}>
            {t('tips.prevent')}
          </Checkbox>{' '}
          <Button onClick={onModalClose}>
            <Glyphicon glyph="remove" /> {t('general.close')} <kbd>Esc</kbd>
          </Button>
        </FormGroup>
      </Modal.Footer>
    </Modal>
  );
};

const mapStateToProps = (state: RootState) => ({
  tip: state.tips.tip,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onModalClose() {
    dispatch(setActiveModal(null));
  },
  onPrevious() {
    dispatch(tipsShow('prev'));
  },
  onNext() {
    dispatch(tipsShow('next'));
  },
  onNextTimePrevent(prevent: boolean) {
    dispatch(tipsPreventNextTime(prevent));
  },
});

export const TipsModal = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(TipsModalInt));
