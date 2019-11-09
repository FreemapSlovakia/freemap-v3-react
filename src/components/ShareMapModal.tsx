import React, { useRef, useCallback } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FormControl from 'react-bootstrap/lib/FormControl';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import { setActiveModal } from 'fm3/actions/mainActions';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapDispatchToProps> & {
  t: Translator;
};

export const ShareMapModal: React.FC<Props> = ({ onModalClose, t }) => {
  const textarea = useRef<HTMLInputElement>();

  const setFormControl = useCallback((ele: HTMLInputElement) => {
    textarea.current = ele;
    setTimeout(() => {
      if (textarea.current) {
        textarea.current.setSelectionRange(0, 9999);
      }
    });
  }, []);

  const handleCopyClick = useCallback(() => {
    if (textarea.current) {
      textarea.current.focus();
      setTimeout(() => {
        if (textarea.current) {
          textarea.current.setSelectionRange(0, 9999);
        }
      });
      document.execCommand('copy');
    }
  }, []);

  const handleShareClick = useCallback(() => {
    (navigator as any)
      .share({
        title: document.title,
        text: document.title,
        url: window.location.href.replace(/&show=[^&]*/, ''),
      })
      .catch(error => console.log('Error sharing', error)); // TODO toast
  }, []);

  return (
    <Modal show onHide={onModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="share-alt" /> {t('more.shareMap')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{t('shareMap.label')}</p>
        <FormControl
          inputRef={setFormControl}
          componentClass="textarea"
          value={window.location.href.replace(/&show=[^&]*/, '')}
          readOnly
          rows={6}
        />
      </Modal.Body>
      <Modal.Footer>
        {(navigator as any).share && (
          <>
            <Button onClick={handleShareClick}>
              <FontAwesomeIcon icon="share-alt" /> {t('more.shareMap')}
            </Button>{' '}
          </>
        )}
        <Button onClick={handleCopyClick}>
          <Glyphicon glyph="copy" /> {t('general.copyCode')}
        </Button>{' '}
        <Button onClick={onModalClose}>
          <Glyphicon glyph="remove" />
          <span className="hidden-xs"> {t('general.close')}</span>{' '}
          <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onModalClose() {
    dispatch(setActiveModal(null));
  },
});

export default connect(null, mapDispatchToProps)(withTranslator(ShareMapModal));
