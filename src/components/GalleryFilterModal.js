/* eslint-disable jsx-a11y/no-static-element-interactions */ // prevented warning in bootstrap code

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Image from 'react-bootstrap/lib/Image';
import Label from 'react-bootstrap/lib/Label';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Form from 'react-bootstrap/lib/Form';
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';

import { gallerySetFilterShown } from 'fm3/actions/galleryActions';

class GalleryViewerModal extends React.Component {
  static propTypes = {
    onOk: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
  }

  state = {
    tag: '',
  }

  handleTagChange = (e) => {
    this.setState({ tag: e.target.value });
  }

  handleUserIdChange = (e) => {
    this.setState({ userId: e.target.value });
  }

  render() {
    const { onClose, onOk } = this.props;

    return (
      <Modal show onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Filter fotografií</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <FormGroup>
              <ControlLabel>Tag</ControlLabel>
              <FormControl
                type="text"
                value={this.state.tag}
                onChange={this.handleTagChange}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Autor</ControlLabel>
              <FormControl
                type="text"
                value={this.state.userId}
                onChange={this.handleUserIdChange}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Dátum fotenia</ControlLabel>
              <InputGroup>
                <FormControl
                  type="date"
                  value={this.state.takenAtFrom}
                  onChange={this.handletakenAtFromChange}
                />
                <InputGroup.Addon> - </InputGroup.Addon>
                <FormControl
                  type="date"
                  value={this.state.takenAtTo}
                  onChange={this.handletakenAtToChange}
                />
              </InputGroup>
            </FormGroup>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onOk}><Glyphicon glyph="floppy-disk" /> Použiť</Button>
          <Button onClick={onClose}><Glyphicon glyph="remove" /> Zrušiť</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect(
  state => ({
  }),
  dispatch => ({
    onClose() {
      dispatch(gallerySetFilterShown(false));
    },
    onOk() {
    },
  }),
)(GalleryViewerModal);
