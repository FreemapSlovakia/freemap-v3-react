import React from 'react';
import { connect } from 'react-redux';
import { compose, Dispatch } from 'redux';

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

export class ShareMapModal extends React.Component<Props> {
  textarea?: HTMLInputElement;

  setFormControl = (textarea: HTMLInputElement) => {
    this.textarea = textarea;
    if (textarea) {
      textarea.select();
    }
  };

  handleCopyClick = () => {
    if (this.textarea) {
      this.textarea.select();
      document.execCommand('copy');
    }
  };

  render() {
    const { onModalClose, t } = this.props;
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
            inputRef={this.setFormControl}
            componentClass="textarea"
            value={window.location.href.replace(/&show=[^&]*/, '')}
            readOnly
            rows={6}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.handleCopyClick}>
            <Glyphicon glyph="copy" /> {t('general.copyCode')}
          </Button>{' '}
          <Button onClick={onModalClose}>
            <Glyphicon glyph="remove" /> {t('general.close')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onModalClose() {
    dispatch(setActiveModal(null));
  },
});

export default compose(
  withTranslator,
  connect(
    null,
    mapDispatchToProps,
  ),
)(ShareMapModal);
