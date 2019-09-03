import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Checkbox from 'react-bootstrap/lib/Checkbox';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import tips from 'fm3/tips/index.json';

import { setActiveModal } from 'fm3/actions/mainActions';
import {
  tipsNext,
  tipsPrevious,
  tipsPreventNextTime,
} from 'fm3/actions/tipsActions';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

interface State {
  loading: boolean;
  tip: string | null;
}

export class TipsModal extends React.Component<Props, State> {
  state: State = {
    loading: true,
    tip: null,
  };

  componentDidMount() {
    this.loadTip();
    document.addEventListener('keydown', this.handleKeydown);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.tip !== this.props.tip) {
      this.loadTip();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  handleKeydown = (evt: KeyboardEvent) => {
    if (evt.keyCode === 37 /* left key */) {
      this.props.onPrevious();
    } else if (evt.keyCode === 39 /* right key */) {
      this.props.onNext();
    }
  };

  handleNextTimePrevent = (e: React.FormEvent<Checkbox>) => {
    this.props.onNextTimePrevent((e.target as HTMLInputElement).checked);
  };

  loadTip() {
    this.setState({ loading: true });
    import(
      /* webpackChunkName: "tip-[request]" */ `fm3/tips/${this.props.tip}.md`
    )
      .then(({ default: tip }) => {
        this.setState({
          tip,
          loading: false,
        });
      })
      .catch(() => {
        this.setState({
          tip: 'Tip sa nepodarilo načítať.', // TODO translate
          loading: false,
        });
      });
  }

  render() {
    const { onPrevious, onNext, onModalClose, tip: tipKey, t } = this.props;
    const { tip, loading } = this.state;

    let title: string | undefined;
    let icon: string | undefined;
    if (tipKey) {
      [, title, icon] = tips.find(([key]) => key === tipKey) as any;
    }

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
          {tip ? (
            <div
              style={loading ? { opacity: 0.5, cursor: 'progress' } : {}}
              dangerouslySetInnerHTML={{ __html: tip }}
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
            <Checkbox inline onChange={this.handleNextTimePrevent}>
              {t('tips.prevent')}
            </Checkbox>{' '}
            <Button onClick={onModalClose}>
              <Glyphicon glyph="remove" /> {t('general.close')}
            </Button>
          </FormGroup>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  tip: state.tips.tip,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onModalClose() {
    dispatch(setActiveModal(null));
  },
  onPrevious() {
    dispatch(tipsPrevious());
  },
  onNext() {
    dispatch(tipsNext(undefined));
  },
  onNextTimePrevent(prevent: boolean) {
    dispatch(tipsPreventNextTime(prevent));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(TipsModal));
