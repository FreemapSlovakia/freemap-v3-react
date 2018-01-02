import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FormControl from 'react-bootstrap/lib/FormControl';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import { setActiveModal } from 'fm3/actions/mainActions';
import injectL10n from 'fm3/l10nInjector';

export class EmbedMapModal extends React.Component {
  static propTypes = {
    onModalClose: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  };

  setFormControl = (textarea) => {
    this.textarea = textarea;
    if (textarea) {
      textarea.select();
    }
  }

  handleCopyClick = () => {
    this.textarea.select();
    document.execCommand('copy');
  }

  render() {
    const { onModalClose, t } = this.props;
    const shareURL = window.location.href.replace(/&show=[^&]*/, '');

    return (
      <Modal show onHide={onModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon="code" /> {t('more.embedMap')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {t('embed.code')}
          </p>
          <FormControl
            inputRef={this.setFormControl}
            componentClass="textarea"
            value={`<iframe src="${shareURL}" style="width: 500px; height: 300px; border: 0" />`}
            readOnly
            rows={6}
          />
          <br />
          <p>
            {t('embed.example')}
          </p>
          <iframe
            title="Freemap.sk"
            style={{ width: '100%', height: '300px', border: '0' }}
            src={shareURL}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.handleCopyClick}>
            <Glyphicon glyph="copy" /> {t('general.copyCode')}
          </Button>
          {' '}
          <Button onClick={onModalClose}>
            <Glyphicon glyph="remove" /> {t('general.close')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default compose(
  injectL10n(),
  connect(
    null,
    dispatch => ({
      onModalClose() {
        dispatch(setActiveModal(null));
      },
    }),
  ),
)(EmbedMapModal);
