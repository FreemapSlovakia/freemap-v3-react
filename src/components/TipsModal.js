import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Checkbox from 'react-bootstrap/lib/Checkbox';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import tips from 'fm3/tips/index.json';

import { setActiveModal } from 'fm3/actions/mainActions';
import { tipsNext, tipsPrevious, tipsPreventNextTime } from 'fm3/actions/tipsActions';
import injectL10n from 'fm3/l10nInjector';

export class TipsModal extends React.Component {
  static propTypes = {
    // eslint-disable-next-line
    tip: PropTypes.string.isRequired,
    onPrevious: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
    onModalClose: PropTypes.func.isRequired,
    onNextTimePrevent: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  };

  state = {
    loading: true,
    tip: null,
  }

  componentWillMount() {
    this.loadTip(this.props);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);
  }

  componentWillReceiveProps(nextProps) {
    this.loadTip(nextProps);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  handleKeydown = (evt) => {
    if (evt.keyCode === 37 /* left key */) {
      this.props.onPrevious();
    } else if (evt.keyCode === 39 /* right key */) {
      this.props.onNext();
    }
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
    const { onPrevious, onNext, onModalClose, tip: tipKey, t } = this.props;
    const { tip, loading } = this.state;

    let title;
    let icon;
    if (tipKey) {
      ([, title, icon] = tips.find(([key]) => key === tipKey));
    }

    return (
      <Modal show onHide={onModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon="lightbulb-o" />
            {t('more.tips')}
            {'\u00A0 | \u00A0'}
            {tipKey ? <React.Fragment><FontAwesomeIcon icon={icon} /> {title}</React.Fragment> : t('general.loading')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            tip ?
              <div
                style={loading ? { opacity: 0.5, cursor: 'progress' } : {}}
                dangerouslySetInnerHTML={{ __html: tip }}
              />
              : t('general.loading')
          }
        </Modal.Body>
        <Modal.Footer>
          <FormGroup>
            <Button onClick={onPrevious}>
              <Glyphicon glyph="chevron-left" /> {t('tips.previous')}
            </Button>
            <Button onClick={onNext}>
              <Glyphicon glyph="chevron-right" /> {t('tips.next')}
            </Button>
            {' '}
            <Checkbox inline onChange={this.handleNextTimePrevent}>{t('tips.prevent')}</Checkbox>
            {' '}
            <Button onClick={onModalClose}>
              <Glyphicon glyph="remove" /> {t('general.close')}
            </Button>
          </FormGroup>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default compose(
  injectL10n(),
  connect(
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
  ),
)(TipsModal);
