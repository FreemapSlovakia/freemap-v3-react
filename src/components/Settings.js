import React from 'react';
import { connect } from 'react-redux';

import Modal from 'react-bootstrap/lib/Modal';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

import { setMapTileFormat } from 'fm3/actions/mapActions';
import { closePopup } from 'fm3/actions/mainActions';
import * as FmPropTypes from 'fm3/propTypes';

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tileFormat: props.tileFormat
    };
  }

  save() {
    this.props.onSave(this.state.tileFormat);
    this.props.onShowToast('info', null, 'Zmeny boli uložené.');
  }

  render() {
    const { onClosePopup } = this.props;
    const b = (fn, ...args) => fn.bind(this, ...args);

    return (
      <Modal show onHide={b(onClosePopup)}>
        <Modal.Header closeButton>
          <Modal.Title>Nastavenia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ marginBottom: '10px' }}>
            Formát dlaždíc:{' '}
            <ButtonGroup>
              <Button
                active={this.state.tileFormat === 'png'}
                onClick={() => this.setState({ tileFormat: 'png' })}
              >
                PNG
              </Button>
              <Button
                active={this.state.tileFormat === 'jpeg'}
                onClick={() => this.setState({ tileFormat: 'jpeg' })}
              >
                JPG
              </Button>
            </ButtonGroup>
          </div>
          <Alert bsStyle="success">
            Mapové dlaždice vyzerajú lepšie v PNG formáte, ale sú asi 4x väčšie než JPG dlaždice.
            Pri pomalom internete preto odporúčame zvoliť JPG.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="success" onClick={b(this.save)}><Glyphicon glyph="floppy-disk"/> Uložiť</Button>
          <Button onClick={b(onClosePopup)}><Glyphicon glyph="remove"/> Zrušiť</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

Settings.propTypes = {
  tileFormat: FmPropTypes.tileFormat.isRequired,
  onSave: React.PropTypes.func.isRequired,
  onClosePopup: React.PropTypes.func.isRequired,
  onShowToast: React.PropTypes.func.isRequired
};

export default connect(
  function (state) {
    return {
      tileFormat: state.map.tileFormat
    };
  },
  function (dispatch) {
    return {
      onSave(tileFormat) {
        dispatch(setMapTileFormat(tileFormat));
        dispatch(closePopup());
      },
      onClosePopup() {
        dispatch(closePopup());
      }
    };
  }
)(Settings);
