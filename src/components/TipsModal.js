import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Checkbox from 'react-bootstrap/lib/Checkbox';

import { setActiveModal } from 'fm3/actions/mainActions';
import { tipsNext, tipsPrevious, tipsPreventNextTime } from 'fm3/actions/tipsActions';

export class TipsModal extends React.Component {
  static propTypes = {
    // eslint-disable-next-line
    tip: PropTypes.string.isRequired,
    onPrevious: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
    onModalClose: PropTypes.func.isRequired,
    onNextTimePrevent: PropTypes.func.isRequired,
  };

  state = {
    loading: true,
    tip: null,
  }

  componentWillMount() {
    this.loadTip(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.loadTip(nextProps);
  }

  loadTip(props) {
    this.setState({ loading: true });
    import(`fm3/tips/${props.tip}.md`)
      .then((tip) => {
        this.setState({
          tip,
          loading: false,
        });
      })
      .catch(() => {
        this.setState({
          tip: 'Tip sa nepodarilo načítať.',
          loading: false,
        });
      });
  }

  handleNextTimePrevent = (e) => {
    this.props.onNextTimePrevent(e.target.checked);
  }

  render() {
    const { onPrevious, onNext, onModalClose } = this.props;
    const { tip, loading } = this.state;

    return (
      <Modal show onHide={onModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Tipy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            tip ?
              <div
                style={loading ? { opacity: 0.5, cursor: 'progress' } : {}}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: tip }}
              />
              : 'Načítavam…'
          }
        </Modal.Body>
        <Modal.Footer>
          <FormGroup>
            <Button onClick={onPrevious}><Glyphicon glyph="chevron-left" /> Predošlý tip</Button>
            <Button onClick={onNext}><Glyphicon glyph="chevron-right" /> Ďalši tip</Button>
            {' '}
            <Checkbox inline onChange={this.handleNextTimePrevent}>Nabudúce nezobrazovať</Checkbox>
            {' '}
            <Button onClick={onModalClose}><Glyphicon glyph="remove" /> Zavrieť</Button>
          </FormGroup>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect(
  state => ({
    tip: state.tips.tip,
  }),
  dispatch => ({
    onModalClose() {
      dispatch(setActiveModal(null));
    },
    onPrevious() {
      dispatch(tipsPrevious());
    },
    onNext() {
      dispatch(tipsNext());
    },
    onNextTimePrevent(prevent) {
      dispatch(tipsPreventNextTime(prevent));
    },
  }),
)(TipsModal);
