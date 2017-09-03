import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FormControl from 'react-bootstrap/lib/FormControl';

import { setActiveModal } from 'fm3/actions/mainActions';

export class EmbedMapModal extends React.Component {
  static propTypes = {
    onModalClose: PropTypes.func.isRequired,
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
    const { onModalClose } = this.props;
    const shareURL = `${window.location.href}`;

    return (
      <Modal show onHide={onModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Vložit do webstránky</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Vložte na vašu stránku tento html kód:</p>
          <FormControl
            inputRef={this.setFormControl}
            componentClass="textarea"
            value={`<iframe src="${shareURL}&embed=true" style="width: 500px; height: 300px; border: 0" />`}
            readOnly
            rows={6}
          />
          <p>Výsledok bude vyzerať následovne:</p>
          <iframe
            title="Freemap.sk"
            style={{ width: '100%', height: '300px', border: '0' }}
            src={`${shareURL}&embed=true`}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.handleCopyClick}><Glyphicon glyph="copy" /> Skopírovať kód</Button>
          {' '}
          <Button onClick={onModalClose}><Glyphicon glyph="remove" /> Zavrieť</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect(
  null,
  dispatch => ({
    onModalClose() {
      dispatch(setActiveModal(null));
    },
  }),
)(EmbedMapModal);
